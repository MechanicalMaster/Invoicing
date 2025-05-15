import { Database } from '@/lib/database.types'
import { Session, User } from '@supabase/supabase-js'

// Export types for Supabase Auth
export type { Session, User }

// Define user profile type
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  updated_at?: string
}

// Define a type for our Supabase database
export type Tables = Database['public']['Tables']

// For convenience, you can add specific table types here
export type InvoiceType = Tables['invoices']['Row']
export type CustomerType = Tables['customers']['Row']
export type ProductType = Tables['products']['Row']

// Helper type for form input
export type FormData<T> = {
  [K in keyof T]: T[K]
} 