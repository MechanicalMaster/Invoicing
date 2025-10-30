import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type UserSettings = Tables<'user_settings'>

/**
 * GET /api/settings
 * Get user settings for authenticated user
 * Creates default settings if none exist
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { data, error } = await supabaseServer
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // If no settings found, return empty settings (not an error)
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found - return null to indicate first-time user
        return apiResponse<UserSettings | null>(null)
      }
      console.error('Error fetching user settings:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<UserSettings>(data)
  } catch (error: any) {
    console.error('GET /api/settings error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * PATCH /api/settings
 * Update user settings (partial update)
 * Creates settings if they don't exist (upsert)
 * Body: Partial<UserSettings>
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    // Remove user_id and updated_at from body if present (managed server-side)
    const { user_id, updated_at, ...updates } = body

    // Prepare settings data
    const settingsData = {
      ...updates,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    // Upsert settings (insert if not exists, update if exists)
    const { data, error } = await supabaseServer
      .from('user_settings')
      .upsert(settingsData, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating user settings:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<UserSettings>(data)
  } catch (error: any) {
    console.error('PATCH /api/settings error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * PUT /api/settings
 * Full replace of user settings
 * Body: Full UserSettings object
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    // Prepare full settings data
    const settingsData = {
      ...body,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    // Upsert settings
    const { data, error } = await supabaseServer
      .from('user_settings')
      .upsert(settingsData, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving user settings:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<UserSettings>(data)
  } catch (error: any) {
    console.error('PUT /api/settings error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
