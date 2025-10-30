import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type StockItem = Tables<'stock_items'>

/**
 * GET /api/stock
 * Get all stock items for the authenticated user
 * Query params: sold (optional) - filter by sold status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const soldParam = searchParams.get('sold')

    let query = supabaseServer
      .from('stock_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Filter by sold status if provided
    if (soldParam !== null) {
      const isSold = soldParam === 'true'
      query = query.eq('is_sold', isSold)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching stock items:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<StockItem[]>(data || [])
  } catch (error: any) {
    console.error('GET /api/stock error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * POST /api/stock
 * Create a new stock item
 * Body: { name, description?, weight?, purity?, making_charges?, other_charges?, purchase_price?, selling_price?, image_url?, notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    // Validate required fields
    if (!body.category || !body.category.trim()) {
      return apiError('Category is required', 400)
    }
    if (!body.material || !body.material.trim()) {
      return apiError('Material is required', 400)
    }
    if (!body.item_number || !body.item_number.trim()) {
      return apiError('Item number is required', 400)
    }

    // Validate and parse weight (required field)
    const weight = body.weight ? parseFloat(body.weight) : 0
    if (isNaN(weight) || weight < 0) {
      return apiError('Invalid weight value', 400)
    }

    // Validate and parse purchase_price (required field)
    const purchasePrice = body.purchase_price ? parseFloat(body.purchase_price) : 0
    if (isNaN(purchasePrice) || purchasePrice < 0) {
      return apiError('Invalid purchase price value', 400)
    }

    // Prepare insert data
    const insertData: any = {
      user_id: user.id,
      item_number: body.item_number.trim(),
      category: body.category.trim(),
      material: body.material.trim(),
      weight: weight,
      purchase_price: purchasePrice,
      description: body.description?.trim() || null,
      purity: body.purity?.trim() || null,
      supplier: body.supplier?.trim() || null,
      purchase_date: body.purchase_date || null,
      image_urls: body.image_urls || null,
      is_sold: false,
    }

    // Insert stock item
    const { data, error } = await supabaseServer
      .from('stock_items')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating stock item:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<StockItem>(data, undefined, 201)
  } catch (error: any) {
    console.error('POST /api/stock error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
