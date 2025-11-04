import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { apiResponse, apiError } from '@/lib/api/utils'
import { supabaseServer } from '@/lib/supabase-server'
import type { Tables } from '@/lib/database.types'

type Customer = Tables<'customers'>

/**
 * GET /api/customers
 * List customers with optional search filter
 * Query params: search (optional) - filter by name, referred (optional) - filter by referred_by
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const referred = searchParams.get('referred') === 'true'

    let query = supabaseServer
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Apply referred filter
    if (referred) {
      query = query.not('referred_by', 'is', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching customers:', error)
      return apiError(error.message, 500)
    }

    return apiResponse<Customer[]>(data || [])
  } catch (error: any) {
    console.error('GET /api/customers error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}

/**
 * POST /api/customers
 * Create a new customer
 * Body: { name, email?, phone?, address?, identity_type?, identity_reference?, identity_doc?, referred_by?, referral_notes?, notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return apiError('Customer name is required', 400)
    }

    // Validate identity reference when "others" is selected
    if (body.identity_type === 'others' && !body.identity_reference) {
      return apiError('Identity reference is required when identity type is "others"', 400)
    }

    // Validate email format if provided
    if (body.email && body.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email.trim())) {
        return apiError('Invalid email format', 400)
      }
    }

    // Prepare insert data
    const insertData: any = {
      user_id: user.id,
      name: body.name.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      address: body.address?.trim() || null,
      identity_type: body.identity_type || null,
      identity_reference: body.identity_reference?.trim() || null,
      identity_doc: body.identity_doc || null,
      referred_by: body.referred_by?.trim() || null,
      referral_notes: body.referral_notes?.trim() || null,
      notes: body.notes?.trim() || null,
    }

    // Insert customer
    const { data, error } = await supabaseServer
      .from('customers')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error)

      // CRITICAL: Rollback file upload if customer creation failed
      if (body.identity_doc) {
        await supabaseServer.storage
          .from('identity_docs')
          .remove([body.identity_doc])
          .catch(err => console.error('Error rolling back file upload:', err))
      }

      return apiError(error.message, 500)
    }

    return apiResponse<Customer>(data, undefined, 201)
  } catch (error: any) {
    console.error('POST /api/customers error:', error)
    return apiError(error.message, error.message.includes('Unauthorized') ? 401 : 500)
  }
}
