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
      stock_items: {
        Row: {
          id: string
          user_id: string
          item_number: string
          category: string
          material: string
          purity: string | null
          weight: number
          description: string | null
          supplier: string | null
          purchase_date: string | null
          purchase_price: number
          image_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_number: string
          category: string
          material: string
          purity?: string | null
          weight: number
          description?: string | null
          supplier?: string | null
          purchase_date?: string | null
          purchase_price: number
          image_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_number?: string
          category?: string
          material?: string
          purity?: string | null
          weight?: number
          description?: string | null
          supplier?: string | null
          purchase_date?: string | null
          purchase_price?: number
          image_urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          updated_at: string
          // Firm Details
          firm_name: string | null
          firm_phone: string | null
          firm_address: string | null
          firm_gstin: string | null
          firm_email: string | null
          firm_website: string | null
          firm_establishment_date: string | null
          // Notification Settings
          notifications_email_enabled: boolean | null
          notifications_push_enabled: boolean | null
          notifications_sms_enabled: boolean | null
          notifications_whatsapp_enabled: boolean | null
          notifications_frequency: Database['public']['Enums']['notification_frequency_enum'] | null
          notifications_quiet_hours_start: string | null
          notifications_quiet_hours_end: string | null
          // Invoice Settings
          invoice_default_prefix: string | null
          invoice_next_number: number | null
          invoice_default_notes: string | null
          invoice_custom_data: Json | null
          // Label Settings
          label_type: Database['public']['Enums']['label_type_enum'] | null
          label_copies: number | null
          label_include_product_name: boolean | null
          label_include_price: boolean | null
          label_include_barcode: boolean | null
          label_include_date: boolean | null
          label_include_metal: boolean | null
          label_include_weight: boolean | null
          label_include_purity: boolean | null
          label_include_qr_code: boolean | null
          // Photo Settings
          photo_compression_level: Database['public']['Enums']['photo_compression_enum'] | null
        }
        Insert: {
          user_id: string
          updated_at?: string
          // Firm Details
          firm_name?: string | null
          firm_phone?: string | null
          firm_address?: string | null
          firm_gstin?: string | null
          firm_email?: string | null
          firm_website?: string | null
          firm_establishment_date?: string | null
          // Notification Settings
          notifications_email_enabled?: boolean | null
          notifications_push_enabled?: boolean | null
          notifications_sms_enabled?: boolean | null
          notifications_whatsapp_enabled?: boolean | null
          notifications_frequency?: Database['public']['Enums']['notification_frequency_enum'] | null
          notifications_quiet_hours_start?: string | null
          notifications_quiet_hours_end?: string | null
          // Invoice Settings
          invoice_default_prefix?: string | null
          invoice_next_number?: number | null
          invoice_default_notes?: string | null
          invoice_custom_data?: Json | null
          // Label Settings
          label_type?: Database['public']['Enums']['label_type_enum'] | null
          label_copies?: number | null
          label_include_product_name?: boolean | null
          label_include_price?: boolean | null
          label_include_barcode?: boolean | null
          label_include_date?: boolean | null
          label_include_metal?: boolean | null
          label_include_weight?: boolean | null
          label_include_purity?: boolean | null
          label_include_qr_code?: boolean | null
          // Photo Settings
          photo_compression_level?: Database['public']['Enums']['photo_compression_enum'] | null
        }
        Update: {
          user_id?: string
          updated_at?: string
          // Firm Details
          firm_name?: string | null
          firm_phone?: string | null
          firm_address?: string | null
          firm_gstin?: string | null
          firm_email?: string | null
          firm_website?: string | null
          firm_establishment_date?: string | null
          // Notification Settings
          notifications_email_enabled?: boolean | null
          notifications_push_enabled?: boolean | null
          notifications_sms_enabled?: boolean | null
          notifications_whatsapp_enabled?: boolean | null
          notifications_frequency?: Database['public']['Enums']['notification_frequency_enum'] | null
          notifications_quiet_hours_start?: string | null
          notifications_quiet_hours_end?: string | null
          // Invoice Settings
          invoice_default_prefix?: string | null
          invoice_next_number?: number | null
          invoice_default_notes?: string | null
          invoice_custom_data?: Json | null
          // Label Settings
          label_type?: Database['public']['Enums']['label_type_enum'] | null
          label_copies?: number | null
          label_include_product_name?: boolean | null
          label_include_price?: boolean | null
          label_include_barcode?: boolean | null
          label_include_date?: boolean | null
          label_include_metal?: boolean | null
          label_include_weight?: boolean | null
          label_include_purity?: boolean | null
          label_include_qr_code?: boolean | null
          // Photo Settings
          photo_compression_level?: Database['public']['Enums']['photo_compression_enum'] | null
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
      notification_frequency_enum: 'instant' | 'daily' | 'weekly'
      label_type_enum: 'standard' | 'large' | 'small'
      photo_compression_enum: 'none' | 'low' | 'medium' | 'high'
    }
  }
} 