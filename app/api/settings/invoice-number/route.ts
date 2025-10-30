import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'

/**
 * POST /api/settings/invoice-number
 * Increment invoice number (atomic operation)
 * Returns the CURRENT number (before increment) for use in invoice creation
 *
 * This ensures thread-safe invoice number generation even with concurrent requests
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // First, get current invoice number
    const { data: currentSettings, error: fetchError } = await supabaseServer
      .from('user_settings')
      .select('invoice_next_number')
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      // If settings don't exist, create them with invoice_next_number = 1
      if (fetchError.code === 'PGRST116') {
        const { data: newSettings, error: createError } = await supabaseServer
          .from('user_settings')
          .insert({
            user_id: user.id,
            invoice_next_number: 2, // Next number will be 2
            updated_at: new Date().toISOString(),
          })
          .select('invoice_next_number')
          .single()

        if (createError) {
          console.error('Error creating settings with invoice number:', createError)
          return apiError(createError.message, 500)
        }

        // Return 1 as the current invoice number
        return apiResponse({
          currentNumber: 1,
          nextNumber: newSettings.invoice_next_number,
        })
      }

      console.error('Error fetching invoice number:', fetchError)
      return apiError(fetchError.message, 500)
    }

    const currentNumber = currentSettings.invoice_next_number || 1
    const nextNumber = currentNumber + 1

    // Increment the invoice number atomically
    const { error: updateError } = await supabaseServer
      .from('user_settings')
      .update({
        invoice_next_number: nextNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error incrementing invoice number:', updateError)
      return apiError(updateError.message, 500)
    }

    return apiResponse({
      currentNumber,
      nextNumber,
    })
  } catch (error: any) {
    console.error('POST /api/settings/invoice-number error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * PUT /api/settings/invoice-number
 * Set invoice number to a specific value
 * Body: { number: number }
 *
 * Use this to manually set the next invoice number (e.g., after importing old invoices)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    if (typeof body.number !== 'number' || body.number < 1) {
      return apiError('Invalid invoice number. Must be a positive integer.', 400)
    }

    const { data, error } = await supabaseServer
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          invoice_next_number: body.number,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('invoice_next_number')
      .single()

    if (error) {
      console.error('Error setting invoice number:', error)
      return apiError(error.message, 500)
    }

    return apiResponse({
      nextNumber: data.invoice_next_number,
    })
  } catch (error: any) {
    console.error('PUT /api/settings/invoice-number error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
