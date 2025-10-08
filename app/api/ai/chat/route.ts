import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseServer } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { extractInvoiceAction } from '@/lib/ai/actions/invoice/invoice-extractor'
import { validateInvoiceAction } from '@/lib/ai/actions/invoice/invoice-validator'
import { InvoiceActionData } from '@/lib/ai/actions/invoice/invoice-action-schema'
import { AIAction } from '@/lib/ai/actions/types'
import { buildSalesPrompt } from '@/lib/ai/modes/prompts/sales-prompt'
import { buildAssistantPrompt } from '@/lib/ai/modes/prompts/assistant-prompt'
import { buildHelpPrompt } from '@/lib/ai/modes/prompts/help-prompt'
import { ChatMode } from '@/lib/ai/modes/types'
import { filterContent, filterAssistantResponse } from '@/lib/ai/security/content-filter'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting: different limits per mode
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, mode: ChatMode): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)

  // Different rate limits per mode
  const limits = {
    sales: 20, // 20 requests per hour for guests
    assistant: 100, // 100 requests per hour for authenticated
    help: 30, // 30 requests per hour
  }

  const maxRequests = limits[mode]

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 3600000 }) // 1 hour
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, mode, context } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    if (!mode || !['sales', 'assistant', 'help'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Validate message length (stricter for guest users)
    const maxLength = mode === 'sales' || mode === 'help' ? 500 : 2000
    if (message.length > maxLength) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    // Get auth token from request (may be null for guest mode)
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    let user = null

    if (token) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

      const {
        data: { user: authUser },
      } = await supabaseClient.auth.getUser(token)

      user = authUser
    }

    // SECURITY: Content filtering for harmful/malicious input
    const contentCheck = filterContent(message)
    if (!contentCheck.safe) {
      console.warn(`Content filter blocked message: ${contentCheck.category}`, {
        userId: user?.id || 'guest',
        reason: contentCheck.reason,
      })
      return NextResponse.json(
        {
          error: contentCheck.reason,
          filtered: true,
          category: contentCheck.category
        },
        { status: 400 }
      )
    }

    // Validate mode vs authentication state
    if (mode === 'assistant' && !user) {
      return NextResponse.json({ error: 'Assistant mode requires authentication' }, { status: 401 })
    }

    // Rate limit identifier (user ID or IP address)
    const rateLimitIdentifier = user?.id || request.headers.get('x-forwarded-for') || 'anonymous'

    if (!checkRateLimit(rateLimitIdentifier, mode)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Build system prompt based on mode
    let systemPrompt: string

    switch (mode) {
      case 'sales':
        systemPrompt = buildSalesPrompt({
          currentDate: new Date().toLocaleDateString('en-IN'),
          currentPage: context?.currentPage || '/',
          userQuestions: context?.previousQuestions,
        })
        break

      case 'assistant':
        // Fetch user context data
        const [userSettings, recentInvoices, customerCount, invoiceCount] = await Promise.all([
          supabaseServer
            .from('user_settings')
            .select('firm_name')
            .eq('user_id', user!.id)
            .single()
            .then((res) => res.data),

          supabaseServer
            .from('invoices')
            .select('invoice_number, created_at')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(5)
            .then((res) => res.data),

          supabaseServer
            .from('customers')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user!.id)
            .then((res) => res.count || 0),

          supabaseServer
            .from('invoices')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user!.id)
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
            .then((res) => res.count || 0),
        ])

        systemPrompt = buildAssistantPrompt({
          userName: user!.email?.split('@')[0] || 'User',
          userId: user!.id,
          shopName: userSettings?.firm_name || undefined,
          currentPage: context?.currentPage || '/dashboard',
          currentDate: new Date().toLocaleDateString('en-IN'),
          recentActivity: recentInvoices?.map((inv) => inv.invoice_number).join(', '),
          customerCount,
          invoiceCount,
        })
        break

      case 'help':
        systemPrompt = buildHelpPrompt({
          currentPage: context?.currentPage || '/documentation',
          currentDate: new Date().toLocaleDateString('en-IN'),
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Handle conversation history differently for authenticated vs guest users
    let conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = []
    let activeSessionId = sessionId

    if (user && mode === 'assistant') {
      // Authenticated user: Load from database
      if (!activeSessionId) {
        const { data: newSession, error: sessionError } = await supabaseServer
          .from('ai_chat_sessions')
          .insert({
            user_id: user.id,
            title: 'New Chat',
            is_active: true,
          })
          .select()
          .single()

        if (sessionError) throw sessionError
        activeSessionId = newSession.id
      }

      // Save user message to database
      const { data: userMessage, error: userMessageError } = await supabaseServer
        .from('ai_chat_messages')
        .insert({
          session_id: activeSessionId,
          user_id: user.id,
          role: 'user',
          content: message,
          metadata: { mode },
        })
        .select()
        .single()

      if (userMessageError) throw userMessageError

      // Get conversation history (last 10 messages)
      const { data: history } = await supabaseServer
        .from('ai_chat_messages')
        .select('role, content')
        .eq('session_id', activeSessionId)
        .order('created_at', { ascending: false })
        .limit(10)

      conversationHistory = (history || [])
        .reverse()
        .map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }))

      // Try to extract action intent (only in assistant mode)
      let action: AIAction<InvoiceActionData> | null = null
      let isActionIntent = false

      try {
        action = await extractInvoiceAction(message, conversationHistory, user.id, activeSessionId)
        isActionIntent = true
      } catch (e) {
        isActionIntent = false
      }

      if (isActionIntent && action) {
        console.log('Action intent detected:', action.type, 'ID:', action.id)

        // Validate the extracted action
        const validation = await validateInvoiceAction(action.data, user.id)

        action.validationErrors = validation.errors
        action.status = validation.isValid ? 'awaiting_confirmation' : 'validating'

        if (validation.enhancedData) {
          action.data = validation.enhancedData
        }

        // Save action to database
        const { error: insertError } = await (supabaseServer as any).from('ai_actions').insert({
          id: action.id,
          user_id: user.id,
          session_id: activeSessionId,
          action_type: action.type,
          status: action.status,
          extracted_data: action.data,
          validation_errors: action.validationErrors,
          missing_fields: action.missingFields,
        })

        if (insertError) {
          console.error('Failed to save action to database:', insertError)
        }

        // Generate confirmation message
        const confirmationMessage = generateActionConfirmationMessage(action)

        // Save assistant response to database
        const { data: assistantMessage, error: assistantMessageError } = await supabaseServer
          .from('ai_chat_messages')
          .insert({
            session_id: activeSessionId,
            user_id: user.id,
            role: 'assistant',
            content: confirmationMessage,
            metadata: { model: 'gpt-4o-mini', actionId: action.id, mode },
          })
          .select()
          .single()

        if (assistantMessageError) throw assistantMessageError

        // Update session
        await supabaseServer
          .from('ai_chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeSessionId)

        return NextResponse.json({
          type: 'action',
          action: action,
          response: confirmationMessage,
          sessionId: activeSessionId,
          messageId: assistantMessage.id,
          userMessageId: userMessage.id,
          mode,
        })
      }
    } else {
      // Guest user (sales/help mode): No database storage, history handled in frontend
      conversationHistory = []
    }

    // Normal conversation - call OpenAI with timeout
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ]

    // SECURITY: Add timeout to prevent long-running requests
    const timeoutMs = 30000 // 30 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout')), timeoutMs)
    )

    const completionPromise = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: mode === 'sales' ? 500 : 1000,
      temperature: mode === 'sales' ? 0.8 : 0.7, // More creative for sales
    })

    const completion = await Promise.race([completionPromise, timeoutPromise]).catch((error) => {
      if (error.message === 'AI request timeout') {
        throw new Error('Request took too long. Please try again with a simpler question.')
      }
      throw error
    })

    let assistantResponse =
      completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    const tokensUsed = completion.usage?.total_tokens || 0

    // SECURITY: Filter assistant response for PII leakage
    assistantResponse = filterAssistantResponse(assistantResponse, user?.id || 'guest')

    // Save to database only for authenticated users
    if (user && mode === 'assistant' && activeSessionId) {
      const { data: assistantMessage, error: assistantMessageError } = await supabaseServer
        .from('ai_chat_messages')
        .insert({
          session_id: activeSessionId,
          user_id: user.id,
          role: 'assistant',
          content: assistantResponse,
          metadata: { model: 'gpt-4o-mini', mode },
          tokens_used: tokensUsed,
        })
        .select()
        .single()

      if (assistantMessageError) throw assistantMessageError

      await supabaseServer
        .from('ai_chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeSessionId)

      return NextResponse.json({
        type: 'message',
        response: assistantResponse,
        sessionId: activeSessionId,
        messageId: assistantMessage.id,
        userMessageId: activeSessionId,
        tokensUsed,
        mode,
      })
    }

    // Guest user response
    return NextResponse.json({
      type: 'message',
      response: assistantResponse,
      tokensUsed,
      mode,
    })
  } catch (error) {
    console.error('Chat API error:', error)

    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'AI service is busy. Please try again in a moment.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: 'AI assistant is temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    )
  }
}

function generateActionConfirmationMessage(action: AIAction<InvoiceActionData>): string {
  if (action.type === 'create_invoice') {
    const data = action.data
    return `I've prepared an invoice for ${data.customerName} with ${data.items.length} item(s) totaling ₹${data.grandTotal?.toLocaleString('en-IN')}. Please review and confirm to create it.`
  }
  return 'Action prepared. Please review and confirm.'
}
