import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type Invoice = Tables<'invoices'>
type InvoiceItem = Tables<'invoice_items'>

interface CreateInvoiceRequest {
  customer_id?: string | null
  customer_name_snapshot: string
  customer_address_snapshot?: string | null
  customer_phone_snapshot?: string | null
  customer_email_snapshot?: string | null
  firm_name_snapshot: string
  firm_address_snapshot?: string | null
  firm_phone_snapshot?: string | null
  firm_gstin_snapshot?: string | null
  invoice_date: string
  subtotal: number
  gst_percentage: number
  gst_amount: number
  grand_total: number
  notes?: string | null
  status?: string
  items: Array<{
    name: string
    quantity: number
    weight: number
    price_per_gram: number
    total: number
  }>
}

/**
 * GET /api/invoices
 * List invoices with optional filters
 * Query params: search, dateFrom, dateTo, status, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

    const offset = (page - 1) * limit

    let query = supabaseServer
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('invoice_date', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filter
    if (search) {
      query = query.or(`customer_name_snapshot.ilike.%${search}%,invoice_number.ilike.%${search}%`)
    }

    // Apply date filters
    if (dateFrom) {
      query = query.gte('invoice_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('invoice_date', dateTo)
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching invoices:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<Invoice[]>(
      data || [],
      {
        page,
        limit,
        total: count || 0,
      }
    )
  } catch (error: any) {
    console.error('GET /api/invoices error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * POST /api/invoices
 * Create a new invoice with items (atomic operation)
 * Body: invoice data + items array
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body: CreateInvoiceRequest = await request.json()

    // Validate required fields
    if (!body.customer_name_snapshot || !body.customer_name_snapshot.trim()) {
      return apiError('Customer name is required', 400)
    }

    if (!body.firm_name_snapshot || !body.firm_name_snapshot.trim()) {
      return apiError('Firm name is required', 400)
    }

    if (!body.invoice_date) {
      return apiError('Invoice date is required', 400)
    }

    if (!body.items || body.items.length === 0) {
      return apiError('At least one item is required', 400)
    }

    // Validate items
    for (const item of body.items) {
      if (!item.name || !item.name.trim()) {
        return apiError('All items must have a name', 400)
      }
      if (item.quantity <= 0) {
        return apiError('All items must have quantity > 0', 400)
      }
      if (item.weight <= 0) {
        return apiError('All items must have weight > 0', 400)
      }
      if (item.price_per_gram < 0) {
        return apiError('Price per gram cannot be negative', 400)
      }
    }

    // Validate numeric fields
    if (body.subtotal < 0 || body.gst_amount < 0 || body.grand_total < 0) {
      return apiError('Amounts cannot be negative', 400)
    }

    // Use PostgreSQL function for atomic operation
    // This ensures invoice + items + number increment all succeed or all fail
    const { data: result, error: rpcError } = await supabaseServer.rpc('create_invoice_with_items', {
      p_user_id: user.id,
      p_customer_id: body.customer_id || undefined,
      p_customer_name_snapshot: body.customer_name_snapshot.trim(),
      p_customer_phone_snapshot: body.customer_phone_snapshot?.trim() || undefined,
      p_customer_email_snapshot: body.customer_email_snapshot?.trim() || undefined,
      p_customer_address_snapshot: body.customer_address_snapshot?.trim() || undefined,
      p_firm_name_snapshot: body.firm_name_snapshot.trim(),
      p_firm_address_snapshot: body.firm_address_snapshot?.trim() || undefined,
      p_firm_phone_snapshot: body.firm_phone_snapshot?.trim() || undefined,
      p_firm_gstin_snapshot: body.firm_gstin_snapshot?.trim() || undefined,
      p_invoice_date: body.invoice_date,
      p_subtotal: body.subtotal,
      p_gst_percentage: body.gst_percentage,
      p_gst_amount: body.gst_amount,
      p_grand_total: body.grand_total,
      p_status: body.status || 'finalized',
      p_notes: body.notes?.trim() || undefined,
      p_items: body.items as any, // PostgreSQL function expects JSONB
    } as any)

    if (rpcError) {
      console.error('Error creating invoice with items:', rpcError)
      return apiError(rpcError.message || 'Failed to create invoice', 500)
    }

    if (!result || result.length === 0) {
      return apiError('Failed to create invoice', 500)
    }

    const { invoice_id, invoice_number } = result[0]

    // Fetch the complete invoice with items
    const { data: completeInvoice } = await supabaseServer
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', invoice_id)
      .single()

    return apiResponse(completeInvoice || { id: invoice_id, invoice_number }, undefined, 201)
  } catch (error: any) {
    console.error('POST /api/invoices error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
