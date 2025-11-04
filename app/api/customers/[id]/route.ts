import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type Customer = Tables<'customers'>

/**
 * GET /api/customers/[id]
 * Get a specific customer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    if (!id) {
      return apiError('Customer ID is required', 400)
    }

    const { data, error } = await supabaseServer
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('Customer not found', 404)
      }
      console.error('Error fetching customer:', error)
      return apiError(error.message, 500)
    }

    return apiResponse(data)
  } catch (error: any) {
    console.error('GET /api/customers/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * PUT /api/customers/[id]
 * Update a customer
 * Body: customer fields to update
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
      return apiError('Customer ID is required', 400)
    }

    // Verify customer exists and belongs to user
    const { data: existing, error: existError } = await supabaseServer
      .from('customers')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existError || !existing) {
      return apiError('Customer not found', 404)
    }

    // Prepare update data (only include provided fields)
    const updateData: Partial<Customer> = {}

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return apiError('Customer name cannot be empty', 400)
      }
      updateData.name = body.name.trim()
    }

    if (body.email !== undefined) {
      if (body.email && body.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email.trim())) {
          return apiError('Invalid email format', 400)
        }
        updateData.email = body.email.trim()
      } else {
        updateData.email = null
      }
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone?.trim() || null
    }

    if (body.address !== undefined) {
      updateData.address = body.address?.trim() || null
    }

    if (body.identity_type !== undefined) {
      updateData.identity_type = body.identity_type || null

      // Validate identity reference when "others" is selected
      if (body.identity_type === 'others') {
        if (!body.identity_reference) {
          return apiError('Identity reference is required when identity type is "others"', 400)
        }
      }
    }

    if (body.identity_reference !== undefined) {
      updateData.identity_reference = body.identity_reference?.trim() || null
    }

    if (body.identity_doc !== undefined) {
      updateData.identity_doc = body.identity_doc || null
    }

    if (body.referred_by !== undefined) {
      updateData.referred_by = body.referred_by?.trim() || null
    }

    if (body.referral_notes !== undefined) {
      updateData.referral_notes = body.referral_notes?.trim() || null
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim() || null
    }

    // Update customer
    const { data, error } = await supabaseServer
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer:', error)
      return apiError(error.message, 500)
    }

    return apiResponse(data)
  } catch (error: any) {
    console.error('PUT /api/customers/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete a customer and cleanup identity document file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    if (!id) {
      return apiError('Customer ID is required', 400)
    }

    // Use PostgreSQL function to delete and get file path
    const { data: result, error: rpcError } = await supabaseServer.rpc('delete_customer_with_cleanup', {
      p_user_id: user.id,
      p_customer_id: id,
    })

    if (rpcError) {
      if (rpcError.message.includes('existing invoices')) {
        return apiError('Cannot delete customer with existing invoices', 400)
      }
      console.error('Error deleting customer:', rpcError)
      return apiError(rpcError.message || 'Failed to delete customer', 500)
    }

    // Delete identity document from storage if it exists
    if (result && result.length > 0 && result[0].identity_doc_path) {
      const filePath = result[0].identity_doc_path
      const { error: storageError } = await supabaseServer.storage
        .from('identity_docs')
        .remove([filePath])

      if (storageError) {
        console.error('Error deleting identity document:', storageError)
        // Log but don't fail - customer is already deleted from database
      }
    }

    return apiResponse({ success: true, message: 'Customer deleted successfully' })
  } catch (error: any) {
    console.error('DELETE /api/customers/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
