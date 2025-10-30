import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError, getQueryParams } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type Supplier = Tables<'suppliers'>

/**
 * GET /api/purchases/suppliers
 * List all suppliers for authenticated user
 * Query params: search (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { search } = getQueryParams(request.nextUrl.searchParams)

    let query = supabaseServer
      .from('suppliers')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    // Apply search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching suppliers:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<Supplier[]>(
      data || [],
      { total: data?.length || 0 }
    )
  } catch (error: any) {
    console.error('GET /api/purchases/suppliers error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * POST /api/purchases/suppliers
 * Create a new supplier
 * Body: { name, contact_person?, email?, phone?, address?, notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return apiError('Supplier name is required', 400)
    }

    // Prepare supplier data
    const supplierData = {
      name: body.name.trim(),
      contact_person: body.contact_person?.trim() || null,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      address: body.address?.trim() || null,
      notes: body.notes?.trim() || null,
      user_id: user.id,
    }

    // Validate email format if provided
    if (supplierData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(supplierData.email)) {
        return apiError('Invalid email format', 400)
      }
    }

    // Insert supplier
    const { data, error } = await supabaseServer
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single()

    if (error) {
      console.error('Error creating supplier:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<Supplier>(data, undefined, 201)
  } catch (error: any) {
    console.error('POST /api/purchases/suppliers error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
