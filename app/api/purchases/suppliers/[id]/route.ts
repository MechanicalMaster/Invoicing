import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type Supplier = Tables<'suppliers'>

/**
 * GET /api/purchases/suppliers/[id]
 * Get a specific supplier by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    if (!id) {
      return apiError('Supplier ID is required', 400)
    }

    const { data, error } = await supabaseServer
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('Supplier not found', 404)
      }
      console.error('Error fetching supplier:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<Supplier>(data)
  } catch (error: any) {
    console.error('GET /api/purchases/suppliers/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * PUT /api/purchases/suppliers/[id]
 * Update a supplier
 * Body: { name?, contact_person?, email?, phone?, address?, notes? }
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
      return apiError('Supplier ID is required', 400)
    }

    // Verify supplier exists and belongs to user
    const { data: existing, error: existError } = await supabaseServer
      .from('suppliers')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existError || !existing) {
      return apiError('Supplier not found', 404)
    }

    // Prepare update data (only include provided fields)
    const updateData: Partial<Supplier> = {}

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return apiError('Supplier name cannot be empty', 400)
      }
      updateData.name = body.name.trim()
    }

    if (body.contact_person !== undefined) {
      updateData.contact_person = body.contact_person?.trim() || null
    }

    if (body.email !== undefined) {
      const email = body.email?.trim() || null
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return apiError('Invalid email format', 400)
        }
      }
      updateData.email = email
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone?.trim() || null
    }

    if (body.address !== undefined) {
      updateData.address = body.address?.trim() || null
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim() || null
    }

    // Update supplier
    const { data, error } = await supabaseServer
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating supplier:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<Supplier>(data)
  } catch (error: any) {
    console.error('PUT /api/purchases/suppliers/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * DELETE /api/purchases/suppliers/[id]
 * Delete a supplier
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    if (!id) {
      return apiError('Supplier ID is required', 400)
    }

    // Check if supplier has associated purchase invoices
    const { count, error: countError } = await supabaseServer
      .from('purchase_invoices')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', id)
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error checking supplier references:', countError)
      return apiError('Error checking supplier references', 500)
    }

    if (count && count > 0) {
      return apiError(
        `Cannot delete supplier. It is referenced in ${count} purchase invoice(s). Please remove or update those references first.`,
        409
      )
    }

    // Delete supplier
    const { error } = await supabaseServer
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting supplier:', error)
      return apiError(error.message, 500)
    }

    return apiResponse({ success: true, message: 'Supplier deleted successfully' })
  } catch (error: any) {
    console.error('DELETE /api/purchases/suppliers/[id] error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
