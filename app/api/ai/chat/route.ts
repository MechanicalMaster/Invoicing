import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseServer } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { extractInvoiceAction } from '@/lib/ai/actions/invoice/invoice-extractor'
import { validateInvoiceAction } from '@/lib/ai/actions/invoice/invoice-validator'
import { InvoiceActionData } from '@/lib/ai/actions/invoice/invoice-action-schema'
import { AIAction } from '@/lib/ai/actions/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an AI assistant for Sethiya Gold, a jewelry shop management system.

CONTEXT:
- This is a Next.js application for managing invoices, inventory, customers, and orders
- Users are jewelry shop owners and employees
- The app handles gold, silver, and diamond jewelry items
- Pricing is typically per gram for precious metals

YOUR CAPABILITIES:
1. Answer questions about how to use the app
2. Provide guidance on creating invoices, managing inventory, and tracking customers
3. Help users navigate features and troubleshoot issues
4. Execute actions like creating invoices through AI commands

TONE:
- Professional yet friendly
- Clear and concise
- Patient and helpful
- Use Indian business context (GST, rupees, etc.)

ACTIONS YOU CAN PERFORM:
- Create invoices: When users ask to create an invoice, you can extract the details and prepare it for creation
- More actions coming soon

Always respond in a helpful, context-aware manner. If you're unsure about specific app features, be honest and suggest checking the documentation.`

// Rate limiting: 10 requests per minute per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 })
    return true
  }

  if (userLimit.count >= 10) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from request
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { message, sessionId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    // Validate message length
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    // Get or validate session
    let activeSessionId = sessionId

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
        metadata: {},
      })
      .select()
      .single()

    if (userMessageError) throw userMessageError

    // Get conversation history (last 10 messages)
    const { data: history, error: historyError } = await supabaseServer
      .from('ai_chat_messages')
      .select('role, content')
      .eq('session_id', activeSessionId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (historyError) throw historyError

    // Build messages array for OpenAI (reverse to get chronological order)
    const conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = history
      .reverse()
      .map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }))

    // Try to extract action intent
    let action: AIAction<InvoiceActionData> | null = null
    let isActionIntent = false

    try {
      action = await extractInvoiceAction(message, conversationHistory, user.id, activeSessionId)
      isActionIntent = true
    } catch (e) {
      // Not an action intent, treat as normal conversation
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

      console.log('Saving action to database:', {
        id: action.id,
        type: action.type,
        status: action.status
      })

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
        // Continue anyway - we'll still show the confirmation UI
      } else {
        console.log('Action saved successfully to database')
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
          metadata: { model: 'gpt-4o-mini', actionId: action.id },
        })
        .select()
        .single()

      if (assistantMessageError) throw assistantMessageError

      // Update session updated_at
      await supabaseServer
        .from('ai_chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeSessionId)

      // Return action for UI to show confirmation
      return NextResponse.json({
        type: 'action',
        action: action,
        response: confirmationMessage,
        sessionId: activeSessionId,
        messageId: assistantMessage.id,
        userMessageId: userMessage.id,
      })
    }

    // Normal conversation - call OpenAI for response
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    })

    const assistantResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    const tokensUsed = completion.usage?.total_tokens || 0

    // Save assistant response to database
    const { data: assistantMessage, error: assistantMessageError } = await supabaseServer
      .from('ai_chat_messages')
      .insert({
        session_id: activeSessionId,
        user_id: user.id,
        role: 'assistant',
        content: assistantResponse,
        metadata: { model: 'gpt-4o-mini' },
        tokens_used: tokensUsed,
      })
      .select()
      .single()

    if (assistantMessageError) throw assistantMessageError

    // Update session updated_at
    await supabaseServer
      .from('ai_chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeSessionId)

    return NextResponse.json({
      type: 'message',
      response: assistantResponse,
      sessionId: activeSessionId,
      messageId: assistantMessage.id,
      userMessageId: userMessage.id,
      tokensUsed,
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
