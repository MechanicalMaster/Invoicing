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
 * GET /api/purchases/invoices/[id]
 * Get a specific purchase invoice with supplier
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    if (!id) {
      return apiError('Purchase invoice ID is required', 400)
    }

    const { data, error } = await supabaseServer
      .from('purchase_invoices')
      .select('*, suppliers(name)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('Purchase invoice not found', 404)
      }
      console.error('Error fetching purchase invoice:', error)
      return apiError(error.message, 500)
    }

    return apiResponse(data)
  } catch (error: any) {
    console.error('GET /api/purchases/invoices/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * PUT /api/purchases/invoices/[id]
 * Update a purchase invoice
 * Body: purchase invoice fields to update
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
      return apiError('Purchase invoice ID is required', 400)
    }

    // Verify purchase invoice exists and belongs to user
    const { data: existing, error: existError } = await supabaseServer
      .from('purchase_invoices')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existError || !existing) {
      return apiError('Purchase invoice not found', 404)
    }

    // Prepare update data (only include provided fields)
    const updateData: Partial<PurchaseInvoice> = {}

    if (body.purchase_number !== undefined) {
      if (!body.purchase_number.trim()) {
        return apiError('Purchase number cannot be empty', 400)
      }
      updateData.purchase_number = body.purchase_number.trim()
    }

    if (body.invoice_number !== undefined) {
      if (!body.invoice_number.trim()) {
        return apiError('Invoice number cannot be empty', 400)
      }
      updateData.invoice_number = body.invoice_number.trim()
    }

    if (body.invoice_date !== undefined) {
      updateData.invoice_date = body.invoice_date
    }

    if (body.supplier_id !== undefined) {
      updateData.supplier_id = body.supplier_id || null
    }

    if (body.amount !== undefined) {
      const amount = parseFloat(body.amount)
      if (isNaN(amount) || amount < 0) {
        return apiError('Invalid amount value', 400)
      }
      updateData.amount = amount
    }

    if (body.status !== undefined) {
      updateData.status = body.status
    }

    if (body.payment_status !== undefined) {
      updateData.payment_status = body.payment_status
    }

    if (body.number_of_items !== undefined) {
      if (body.number_of_items !== null) {
        const numberOfItems = parseInt(body.number_of_items)
        if (isNaN(numberOfItems) || numberOfItems < 0) {
          return apiError('Invalid number of items', 400)
        }
        updateData.number_of_items = numberOfItems
      } else {
        updateData.number_of_items = null
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim() || null
    }

    if (body.invoice_file_url !== undefined) {
      updateData.invoice_file_url = body.invoice_file_url || null
    }

    // Update purchase invoice
    const { data, error } = await supabaseServer
      .from('purchase_invoices')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, suppliers(name)')
      .single()

    if (error) {
      console.error('Error updating purchase invoice:', error)
      return apiError(error.message, 500)
    }

    return apiResponse(data)
  } catch (error: any) {
    console.error('PUT /api/purchases/invoices/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * DELETE /api/purchases/invoices/[id]
 * Delete a purchase invoice and cleanup invoice file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    if (!id) {
      return apiError('Purchase invoice ID is required', 400)
    }

    // Use PostgreSQL function to delete and get file path
    const { data: result, error: rpcError } = await supabaseServer.rpc('delete_purchase_invoice_with_cleanup', {
      p_user_id: user.id,
      p_invoice_id: id,
    })

    if (rpcError) {
      console.error('Error deleting purchase invoice:', rpcError)
      return apiError(rpcError.message || 'Failed to delete purchase invoice', 500)
    }

    // Delete invoice file from storage if it exists
    if (result && result.length > 0 && result[0].file_path) {
      const filePath = result[0].file_path
      const { error: storageError } = await supabaseServer.storage
        .from('purchase-invoices')
        .remove([filePath])

      if (storageError) {
        console.error('Error deleting invoice file:', storageError)
        // Log but don't fail - invoice is already deleted from database
      }
    }

    return apiResponse({ success: true, message: 'Purchase invoice deleted successfully' })
  } catch (error: any) {
    console.error('DELETE /api/purchases/invoices/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
