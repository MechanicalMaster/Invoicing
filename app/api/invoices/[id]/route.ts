import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type Invoice = Tables<'invoices'>

/**
 * GET /api/invoices/[id]
 * Get a specific invoice with its items
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    if (!id) {
      return apiError('Invoice ID is required', 400)
    }

    const { data, error } = await supabaseServer
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('Invoice not found', 404)
      }
      console.error('Error fetching invoice:', error)
      return apiError(error.message, 500)
    }

    return apiResponse(data)
  } catch (error: any) {
    console.error('GET /api/invoices/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * PUT /api/invoices/[id]
 * Update an invoice (excluding items for now)
 * Body: invoice fields to update
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
      return apiError('Invoice ID is required', 400)
    }

    // Verify invoice exists and belongs to user
    const { data: existing, error: existError } = await supabaseServer
      .from('invoices')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existError || !existing) {
      return apiError('Invoice not found', 404)
    }

    // Prepare update data (only include provided fields)
    const updateData: Partial<Invoice> = {}

    if (body.customer_name_snapshot !== undefined) {
      if (!body.customer_name_snapshot.trim()) {
        return apiError('Customer name cannot be empty', 400)
      }
      updateData.customer_name_snapshot = body.customer_name_snapshot.trim()
    }

    if (body.customer_address_snapshot !== undefined) {
      updateData.customer_address_snapshot = body.customer_address_snapshot?.trim() || null
    }

    if (body.customer_phone_snapshot !== undefined) {
      updateData.customer_phone_snapshot = body.customer_phone_snapshot?.trim() || null
    }

    if (body.customer_email_snapshot !== undefined) {
      updateData.customer_email_snapshot = body.customer_email_snapshot?.trim() || null
    }

    if (body.firm_name_snapshot !== undefined) {
      if (!body.firm_name_snapshot.trim()) {
        return apiError('Firm name cannot be empty', 400)
      }
      updateData.firm_name_snapshot = body.firm_name_snapshot.trim()
    }

    if (body.firm_address_snapshot !== undefined) {
      updateData.firm_address_snapshot = body.firm_address_snapshot?.trim() || null
    }

    if (body.firm_phone_snapshot !== undefined) {
      updateData.firm_phone_snapshot = body.firm_phone_snapshot?.trim() || null
    }

    if (body.firm_gstin_snapshot !== undefined) {
      updateData.firm_gstin_snapshot = body.firm_gstin_snapshot?.trim() || null
    }

    if (body.invoice_date !== undefined) {
      updateData.invoice_date = body.invoice_date
    }

    if (body.status !== undefined) {
      updateData.status = body.status
    }

    if (body.subtotal !== undefined) {
      const subtotal = parseFloat(body.subtotal)
      if (isNaN(subtotal) || subtotal < 0) {
        return apiError('Invalid subtotal value', 400)
      }
      updateData.subtotal = subtotal
    }

    if (body.gst_percentage !== undefined) {
      const gstPercentage = parseFloat(body.gst_percentage)
      if (isNaN(gstPercentage) || gstPercentage < 0) {
        return apiError('Invalid GST percentage', 400)
      }
      updateData.gst_percentage = gstPercentage
    }

    if (body.gst_amount !== undefined) {
      const gstAmount = parseFloat(body.gst_amount)
      if (isNaN(gstAmount) || gstAmount < 0) {
        return apiError('Invalid GST amount', 400)
      }
      updateData.gst_amount = gstAmount
    }

    if (body.grand_total !== undefined) {
      const grandTotal = parseFloat(body.grand_total)
      if (isNaN(grandTotal) || grandTotal < 0) {
        return apiError('Invalid grand total', 400)
      }
      updateData.grand_total = grandTotal
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim() || null
    }

    // Update invoice
    const { data, error } = await supabaseServer
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, invoice_items(*)')
      .single()

    if (error) {
      console.error('Error updating invoice:', error)
      return apiError(error.message, 500)
    }

    return apiResponse(data)
  } catch (error: any) {
    console.error('PUT /api/invoices/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * DELETE /api/invoices/[id]
 * Delete an invoice (cascade deletes items via foreign key)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    if (!id) {
      return apiError('Invoice ID is required', 400)
    }

    // Delete invoice (items will be cascade deleted by foreign key)
    const { error } = await supabaseServer
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting invoice:', error)
      return apiError(error.message, 500)
    }

    return apiResponse({ success: true, message: 'Invoice deleted successfully' })
  } catch (error: any) {
    console.error('DELETE /api/invoices/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
