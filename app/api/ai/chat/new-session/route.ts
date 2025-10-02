import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

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

    // Deactivate current active sessions
    await supabaseServer
      .from('ai_chat_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true)

    // Create new session
    const { data: newSession, error: createError } = await supabaseServer
      .from('ai_chat_sessions')
      .insert({
        user_id: user.id,
        title: 'New Chat',
        is_active: true,
      })
      .select()
      .single()

    if (createError) throw createError

    return NextResponse.json({
      sessionId: newSession.id,
      title: newSession.title,
    })
  } catch (error) {
    console.error('New session API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while creating a new session.' },
      { status: 500 }
    )
  }
}
