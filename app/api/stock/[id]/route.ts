import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type StockItem = Tables<'stock_items'>

/**
 * GET /api/stock/[id]
 * Get a specific stock item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    if (!id) {
      return apiError('Stock item ID is required', 400)
    }

    const { data, error } = await supabaseServer
      .from('stock_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('Stock item not found', 404)
      }
      console.error('Error fetching stock item:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<StockItem>(data)
  } catch (error: any) {
    console.error('GET /api/stock/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * PUT /api/stock/[id]
 * Update a stock item
 * Body: { name?, description?, weight?, purity?, making_charges?, other_charges?, purchase_price?, selling_price?, image_url?, notes? }
 */
export async function PUT(
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

    // Verify stock item exists and belongs to user
    const { data: existing, error: existError } = await supabaseServer
      .from('stock_items')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existError || !existing) {
      return apiError('Stock item not found', 404)
    }

    // Prepare update data (only include provided fields)
    const updateData: Partial<StockItem> = {}

    if (body.category !== undefined) {
      if (!body.category.trim()) {
        return apiError('Category cannot be empty', 400)
      }
      updateData.category = body.category.trim()
    }

    if (body.material !== undefined) {
      if (!body.material.trim()) {
        return apiError('Material cannot be empty', 400)
      }
      updateData.material = body.material.trim()
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }

    if (body.weight !== undefined) {
      const weight = parseFloat(body.weight)
      if (isNaN(weight) || weight < 0) {
        return apiError('Invalid weight value', 400)
      }
      updateData.weight = weight
    }

    if (body.purity !== undefined) {
      updateData.purity = body.purity?.trim() || null
    }

    if (body.purchase_price !== undefined) {
      const purchasePrice = parseFloat(body.purchase_price)
      if (isNaN(purchasePrice) || purchasePrice < 0) {
        return apiError('Invalid purchase price value', 400)
      }
      updateData.purchase_price = purchasePrice
    }

    if (body.supplier !== undefined) {
      updateData.supplier = body.supplier?.trim() || null
    }

    if (body.purchase_date !== undefined) {
      updateData.purchase_date = body.purchase_date || null
    }

    if (body.image_urls !== undefined) {
      updateData.image_urls = body.image_urls || null
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
    console.error('PUT /api/stock/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * DELETE /api/stock/[id]
 * Delete a stock item and cleanup image files
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    if (!id) {
      return apiError('Stock item ID is required', 400)
    }

    // Use PostgreSQL function to delete and get image paths
    const { data: result, error: rpcError } = await supabaseServer.rpc('delete_stock_item_with_cleanup', {
      p_user_id: user.id,
      p_item_id: id,
    })

    if (rpcError) {
      console.error('Error deleting stock item:', rpcError)
      return apiError(rpcError.message || 'Failed to delete stock item', 500)
    }

    // Delete images from storage if they exist
    if (result && result.length > 0 && result[0].image_paths) {
      const imagePaths = result[0].image_paths
      if (imagePaths && imagePaths.length > 0) {
        const { error: storageError } = await supabaseServer.storage
          .from('stock_item_images')
          .remove(imagePaths)

        if (storageError) {
          console.error('Error deleting stock images:', storageError)
          // Log but don't fail - stock item is already deleted from database
        }
      }
    }

    return apiResponse({ success: true, message: 'Stock item deleted successfully' })
  } catch (error: any) {
    console.error('DELETE /api/stock/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
