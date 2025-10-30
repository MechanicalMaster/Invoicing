import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import type { User } from '@supabase/supabase-js'

/**
 * Extracts and validates authentication token from request headers
 * @param request - The incoming request object
 * @returns Authenticated user object
 * @throws Error if authentication fails
 */
export async function requireAuth(request: Request): Promise<User> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new Error('Unauthorized: No token provided')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser(token)

  if (error || !user) {
    throw new Error('Unauthorized: Invalid token')
  }

  return user
}

/**
 * Optional authentication - returns user if token is valid, null otherwise
 * Useful for endpoints that work with or without authentication
 * @param request - The incoming request object
 * @returns Authenticated user object or null
 */
export async function optionalAuth(request: Request): Promise<User | null> {
  try {
    return await requireAuth(request)
  } catch {
    return null
  }
}
