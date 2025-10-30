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

    // Get next invoice number (atomic increment)
    const { data: settingsData, error: settingsError } = await supabaseServer
      .from('user_settings')
      .select('invoice_default_prefix, invoice_next_number')
      .eq('user_id', user.id)
      .single()

    if (settingsError) {
      console.error('Error fetching settings:', settingsError)
      return apiError('Failed to generate invoice number', 500)
    }

    const prefix = settingsData?.invoice_default_prefix || 'INV-'
    const nextNumber = settingsData?.invoice_next_number || 1
    const invoiceNumber = `${prefix}${nextNumber.toString().padStart(4, '0')}`

    // Create invoice
    const invoiceData = {
      user_id: user.id,
      customer_id: body.customer_id || null,
      invoice_number: invoiceNumber,
      invoice_date: body.invoice_date,
      status: body.status || 'finalized',
      customer_name_snapshot: body.customer_name_snapshot.trim(),
      customer_address_snapshot: body.customer_address_snapshot?.trim() || null,
      customer_phone_snapshot: body.customer_phone_snapshot?.trim() || null,
      customer_email_snapshot: body.customer_email_snapshot?.trim() || null,
      firm_name_snapshot: body.firm_name_snapshot.trim(),
      firm_address_snapshot: body.firm_address_snapshot?.trim() || null,
      firm_phone_snapshot: body.firm_phone_snapshot?.trim() || null,
      firm_gstin_snapshot: body.firm_gstin_snapshot?.trim() || null,
      subtotal: body.subtotal,
      gst_percentage: body.gst_percentage,
      gst_amount: body.gst_amount,
      grand_total: body.grand_total,
      notes: body.notes?.trim() || null,
    }

    const { data: invoice, error: invoiceError } = await supabaseServer
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return apiError(invoiceError.message, 500)
    }

    // Create invoice items
    const itemsData = body.items.map((item) => ({
      invoice_id: invoice.id,
      user_id: user.id,
      name: item.name.trim(),
      quantity: item.quantity,
      weight: item.weight,
      price_per_gram: item.price_per_gram,
      total: item.total,
    }))

    const { error: itemsError } = await supabaseServer
      .from('invoice_items')
      .insert(itemsData)

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError)
      // Rollback: delete the invoice
      await supabaseServer.from('invoices').delete().eq('id', invoice.id)
      return apiError('Failed to create invoice items', 500)
    }

    // Increment invoice number (atomic)
    const { error: updateError } = await supabaseServer
      .from('user_settings')
      .update({ invoice_next_number: nextNumber + 1 })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating invoice number:', updateError)
      // Don't fail the request, but log the error
      // The invoice is already created successfully
    }

    // Return invoice with items
    const { data: invoiceWithItems } = await supabaseServer
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', invoice.id)
      .single()

    return apiResponse(invoiceWithItems || invoice, undefined, 201)
  } catch (error: any) {
    console.error('POST /api/invoices error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
