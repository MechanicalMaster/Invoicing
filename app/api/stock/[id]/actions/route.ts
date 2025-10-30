import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type StockItem = Tables<'stock_items'>

/**
 * POST /api/stock/[id]/actions
 * Perform actions on a stock item (mark as sold/unsold)
 * Body: { action: 'mark_sold' | 'mark_unsold' }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return apiError('Stock item ID is required', 400)
    }

    if (!body.action) {
      return apiError('Action is required', 400)
    }

    // Verify stock item exists and belongs to user
    const { data: existing, error: existError } = await supabaseServer
      .from('stock_items')
      .select('id, is_sold')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existError || !existing) {
      return apiError('Stock item not found', 404)
    }

    let updateData: Partial<StockItem> = {}

    switch (body.action) {
      case 'mark_sold':
        if (existing.is_sold) {
          return apiError('Stock item is already marked as sold', 400)
        }
        updateData = {
          is_sold: true,
          sold_at: new Date().toISOString(),
        }
        break

      case 'mark_unsold':
        if (!existing.is_sold) {
          return apiError('Stock item is already marked as unsold', 400)
        }
        updateData = {
          is_sold: false,
          sold_at: null,
        }
        break

      default:
        return apiError(
          `Invalid action: ${body.action}. Valid actions are: mark_sold, mark_unsold`,
          400
        )
    }

    // Update stock item
    const { data, error } = await supabaseServer
      .from('stock_items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating stock item:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<StockItem>(data)
  } catch (error: any) {
    console.error('POST /api/stock/[id]/actions error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
