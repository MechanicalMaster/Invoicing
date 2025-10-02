import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabaseServer
      .from('ai_chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get messages
    const { data: messages, error: messagesError, count } = await supabaseServer
      .from('ai_chat_messages')
      .select('*', { count: 'exact' })
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (messagesError) throw messagesError

    return NextResponse.json({
      messages: messages || [],
      session,
      hasMore: (count || 0) > offset + limit,
      total: count || 0,
    })
  } catch (error) {
    console.error('Chat history API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching chat history.' },
      { status: 500 }
    )
  }
}
