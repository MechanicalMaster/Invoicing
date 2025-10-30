import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type PurchaseInvoice = Tables<'purchase_invoices'>

interface PurchaseInvoiceWithSupplier extends PurchaseInvoice {
  suppliers?: {
    name: string
  } | null
}

/**
 * GET /api/purchases/invoices
 * List purchase invoices with optional filters and supplier join
 * Query params: search, status, payment_status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const paymentStatus = searchParams.get('payment_status') || ''

    let query = supabaseServer
      .from('purchase_invoices')
      .select('*, suppliers(name)')
      .eq('user_id', user.id)
      .order('invoice_date', { ascending: false })

    // Apply search filter (purchase_number, invoice_number, or supplier name)
    if (search) {
      // Note: Supabase doesn't support nested field search in .or()
      // So we'll filter by purchase_number and invoice_number only
      query = query.or(`purchase_number.ilike.%${search}%,invoice_number.ilike.%${search}%`)
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Apply payment status filter
    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching purchase invoices:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<PurchaseInvoiceWithSupplier[]>(data || [])
  } catch (error: any) {
    console.error('GET /api/purchases/invoices error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * POST /api/purchases/invoices
 * Create a new purchase invoice
 * Body: { purchase_number?, invoice_number, invoice_date, supplier_id?, amount, status?, payment_status?, number_of_items?, notes?, invoice_file_url? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    // Validate required fields
    if (!body.invoice_number || !body.invoice_number.trim()) {
      return apiError('Invoice number is required', 400)
    }

    if (!body.invoice_date) {
      return apiError('Invoice date is required', 400)
    }

    if (body.amount === undefined || body.amount === null) {
      return apiError('Amount is required', 400)
    }

    // Validate numeric fields
    const amount = parseFloat(body.amount)
    if (isNaN(amount) || amount < 0) {
      return apiError('Invalid amount value', 400)
    }

    const numberOfItems = body.number_of_items ? parseInt(body.number_of_items) : null
    if (numberOfItems !== null && (isNaN(numberOfItems) || numberOfItems < 0)) {
      return apiError('Invalid number of items', 400)
    }

    // Generate purchase number if not provided
    const purchaseNumber = body.purchase_number?.trim() || `P-${Date.now().toString().slice(-6)}`

    // Prepare insert data
    const insertData: any = {
      user_id: user.id,
      purchase_number: purchaseNumber,
      invoice_number: body.invoice_number.trim(),
      invoice_date: body.invoice_date,
      supplier_id: body.supplier_id || null,
      amount: amount,
      status: body.status || 'Received',
      payment_status: body.payment_status || 'Unpaid',
      number_of_items: numberOfItems,
      notes: body.notes?.trim() || null,
      invoice_file_url: body.invoice_file_url || null,
    }

    // Insert purchase invoice
    const { data, error } = await supabaseServer
      .from('purchase_invoices')
      .insert(insertData)
      .select('*, suppliers(name)')
      .single()

    if (error) {
      console.error('Error creating purchase invoice:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<PurchaseInvoiceWithSupplier>(data, undefined, 201)
  } catch (error: any) {
    console.error('POST /api/purchases/invoices error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
