// app/api/ai/execute-action/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { executeInvoiceCreation } from '@/lib/ai/actions/invoice/invoice-executor'
import { supabaseServer } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { generateRequestId, logInfo, logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    const { actionId } = await request.json()

    console.log('Execute action request received for actionId:', actionId)

    // Get auth token from request
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      console.error('No auth token provided')
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

    // Fetch action from database
    const { data: action, error: fetchError } = await (supabaseServer as any)
      .from('ai_actions')
      .select('*')
      .eq('id', actionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching action:', fetchError)
      return NextResponse.json({ error: `Action fetch error: ${fetchError.message}` }, { status: 500 })
    }

    if (!action) {
      console.error('Action not found for ID:', actionId, 'user:', user.id)
      return NextResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    console.log('Action found:', action)

    // Check if action is in correct state
    if (action.status !== 'awaiting_confirmation') {
      return NextResponse.json(
        { error: 'Action not in confirmable state' },
        { status: 400 }
      )
    }

    // Update status to executing
    await (supabaseServer as any)
      .from('ai_actions')
      .update({ status: 'executing', updated_at: new Date().toISOString() })
      .eq('id', actionId)

    // Execute based on action type
    let result

    if (action.action_type === 'create_invoice') {
      result = await executeInvoiceCreation(
        action.extracted_data,
        user.id,
        actionId
      )
    } else {
      throw new Error(`Unknown action type: ${action.action_type}`)
    }

    // Update action status based on result
    await (supabaseServer as any)
      .from('ai_actions')
      .update({
        status: result.success ? 'completed' : 'failed',
        entity_id: result.entityId || null,
        error_message: result.success ? null : result.message,
        executed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', actionId)

    logInfo('ai_action_executed', {
      requestId,
      userId: user.id,
      route: '/api/ai/execute-action',
      entity: action.action_type,
      entityId: result.entityId,
      metadata: { success: result.success }
    })

    return NextResponse.json(result)

  } catch (error: any) {
    logError('ai_action_execution_failed', {
      requestId,
      userId: null,
      route: '/api/ai/execute-action',
      entity: 'invoice',
      metadata: {},
      error: error.message
    })

    return NextResponse.json(
      { error: error.message || 'Execution failed' },
      { status: 500 }
    )
  }
}
