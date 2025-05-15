export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          user_id: string
          identity_type: 'pan_card' | 'aadhaar_card' | 'others' | 'none'
          identity_reference: string | null
          identity_doc: string | null
          referred_by: string | null
          referral_notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          user_id: string
          identity_type: 'pan_card' | 'aadhaar_card' | 'others' | 'none'
          identity_reference?: string | null
          identity_doc?: string | null
          referred_by?: string | null
          referral_notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          user_id?: string
          identity_type?: 'pan_card' | 'aadhaar_card' | 'others' | 'none'
          identity_reference?: string | null
          identity_doc?: string | null
          referred_by?: string | null
          referral_notes?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          invoice_number: string
          customer_id: string
          total_amount: number
          paid_amount: number
          due_amount: number
          status: string
          due_date: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          invoice_number: string
          customer_id: string
          total_amount: number
          paid_amount: number
          due_amount: number
          status: string
          due_date?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          invoice_number?: string
          customer_id?: string
          total_amount?: number
          paid_amount?: number
          due_amount?: number
          status?: string
          due_date?: string | null
          notes?: string | null
          user_id?: string
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          price: number
          category: string | null
          sku: string | null
          stock_quantity: number | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          price: number
          category?: string | null
          sku?: string | null
          stock_quantity?: number | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          price?: number
          category?: string | null
          sku?: string | null
          stock_quantity?: number | null
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          full_name: string | null
          avatar_url: string | null
          phone_number: string | null
          email_address: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          email_address?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          email_address?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 