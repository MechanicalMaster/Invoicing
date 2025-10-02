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

    // Get all sessions for this user with message count
    const { data: sessions, error: sessionsError } = await supabaseServer
      .from('ai_chat_sessions')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        is_active
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (sessionsError) throw sessionsError

    // Get message counts for each session
    const sessionsWithCounts = await Promise.all(
      (sessions || []).map(async (session) => {
        const { count } = await supabaseServer
          .from('ai_chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)

        return {
          ...session,
          message_count: count || 0,
        }
      })
    )

    return NextResponse.json({
      sessions: sessionsWithCounts,
    })
  } catch (error) {
    console.error('Sessions fetch API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching sessions.' },
      { status: 500 }
    )
  }
}
