export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          identity_doc: string | null
          identity_reference: string | null
          identity_type: string | null
          name: string
          notes: string | null
          phone: string | null
          referral_notes: string | null
          referred_by: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          identity_doc?: string | null
          identity_reference?: string | null
          identity_type?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          referral_notes?: string | null
          referred_by?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          identity_doc?: string | null
          identity_reference?: string | null
          identity_type?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          referral_notes?: string | null
          referred_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          id: string
          invoice_id: string
          name: string
          price_per_gram: number
          quantity: number
          total: number
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_id: string
          name: string
          price_per_gram: number
          quantity: number
          total: number
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_id?: string
          name?: string
          price_per_gram?: number
          quantity?: number
          total?: number
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_address_snapshot: string | null
          customer_email_snapshot: string | null
          customer_id: string | null
          customer_name_snapshot: string
          customer_phone_snapshot: string | null
          firm_address_snapshot: string | null
          firm_gstin_snapshot: string | null
          firm_name_snapshot: string
          firm_phone_snapshot: string | null
          grand_total: number
          gst_amount: number
          gst_percentage: number
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          status: string
          subtotal: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_address_snapshot?: string | null
          customer_email_snapshot?: string | null
          customer_id?: string | null
          customer_name_snapshot: string
          customer_phone_snapshot?: string | null
          firm_address_snapshot?: string | null
          firm_gstin_snapshot?: string | null
          firm_name_snapshot: string
          firm_phone_snapshot?: string | null
          grand_total: number
          gst_amount: number
          gst_percentage: number
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          status?: string
          subtotal: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_address_snapshot?: string | null
          customer_email_snapshot?: string | null
          customer_id?: string | null
          customer_name_snapshot?: string
          customer_phone_snapshot?: string | null
          firm_address_snapshot?: string | null
          firm_gstin_snapshot?: string | null
          firm_name_snapshot?: string
          firm_phone_snapshot?: string | null
          grand_total?: number
          gst_amount?: number
          gst_percentage?: number
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          status?: string
          subtotal?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email_address: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email_address?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email_address?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_invoices: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_date: string
          invoice_file_url: string | null
          invoice_number: string
          notes: string | null
          number_of_items: number | null
          payment_status: string
          purchase_number: string
          status: string
          supplier_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_date: string
          invoice_file_url?: string | null
          invoice_number: string
          notes?: string | null
          number_of_items?: number | null
          payment_status?: string
          purchase_number: string
          status?: string
          supplier_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_date?: string
          invoice_file_url?: string | null
          invoice_number?: string
          notes?: string | null
          number_of_items?: number | null
          payment_status?: string
          purchase_number?: string
          status?: string
          supplier_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_urls: string[] | null
          is_sold: boolean
          item_number: string
          material: string
          purchase_date: string | null
          purchase_price: number
          purity: string | null
          sold_at: string | null
          supplier: string | null
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          is_sold?: boolean
          item_number: string
          material: string
          purchase_date?: string | null
          purchase_price: number
          purity?: string | null
          sold_at?: string | null
          supplier?: string | null
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          is_sold?: boolean
          item_number?: string
          material?: string
          purchase_date?: string | null
          purchase_price?: number
          purity?: string | null
          sold_at?: string | null
          supplier?: string | null
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          firm_address: string | null
          firm_email: string | null
          firm_establishment_date: string | null
          firm_gstin: string | null
          firm_name: string | null
          firm_phone: string | null
          firm_website: string | null
          invoice_custom_data: Json | null
          invoice_default_notes: string | null
          invoice_default_prefix: string | null
          invoice_next_number: number | null
          label_copies: number | null
          label_include_barcode: boolean | null
          label_include_date: boolean | null
          label_include_metal: boolean | null
          label_include_price: boolean | null
          label_include_product_name: boolean | null
          label_include_purity: boolean | null
          label_include_qr_code: boolean | null
          label_include_weight: boolean | null
          label_qr_error_correction:
            | Database["public"]["Enums"]["qr_error_correction_level_enum"]
            | null
          label_type: Database["public"]["Enums"]["label_type_enum"] | null
          notifications_email_enabled: boolean | null
          notifications_frequency:
            | Database["public"]["Enums"]["notification_frequency_enum"]
            | null
          notifications_push_enabled: boolean | null
          notifications_quiet_hours_end: string | null
          notifications_quiet_hours_start: string | null
          notifications_sms_enabled: boolean | null
          notifications_whatsapp_enabled: boolean | null
          photo_compression_level:
            | Database["public"]["Enums"]["photo_compression_enum"]
            | null
          updated_at: string
          user_id: string
        }
        Insert: {
          firm_address?: string | null
          firm_email?: string | null
          firm_establishment_date?: string | null
          firm_gstin?: string | null
          firm_name?: string | null
          firm_phone?: string | null
          firm_website?: string | null
          invoice_custom_data?: Json | null
          invoice_default_notes?: string | null
          invoice_default_prefix?: string | null
          invoice_next_number?: number | null
          label_copies?: number | null
          label_include_barcode?: boolean | null
          label_include_date?: boolean | null
          label_include_metal?: boolean | null
          label_include_price?: boolean | null
          label_include_product_name?: boolean | null
          label_include_purity?: boolean | null
          label_include_qr_code?: boolean | null
          label_include_weight?: boolean | null
          label_qr_error_correction?:
            | Database["public"]["Enums"]["qr_error_correction_level_enum"]
            | null
          label_type?: Database["public"]["Enums"]["label_type_enum"] | null
          notifications_email_enabled?: boolean | null
          notifications_frequency?:
            | Database["public"]["Enums"]["notification_frequency_enum"]
            | null
          notifications_push_enabled?: boolean | null
          notifications_quiet_hours_end?: string | null
          notifications_quiet_hours_start?: string | null
          notifications_sms_enabled?: boolean | null
          notifications_whatsapp_enabled?: boolean | null
          photo_compression_level?:
            | Database["public"]["Enums"]["photo_compression_enum"]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          firm_address?: string | null
          firm_email?: string | null
          firm_establishment_date?: string | null
          firm_gstin?: string | null
          firm_name?: string | null
          firm_phone?: string | null
          firm_website?: string | null
          invoice_custom_data?: Json | null
          invoice_default_notes?: string | null
          invoice_default_prefix?: string | null
          invoice_next_number?: number | null
          label_copies?: number | null
          label_include_barcode?: boolean | null
          label_include_date?: boolean | null
          label_include_metal?: boolean | null
          label_include_price?: boolean | null
          label_include_product_name?: boolean | null
          label_include_purity?: boolean | null
          label_include_qr_code?: boolean | null
          label_include_weight?: boolean | null
          label_qr_error_correction?:
            | Database["public"]["Enums"]["qr_error_correction_level_enum"]
            | null
          label_type?: Database["public"]["Enums"]["label_type_enum"] | null
          notifications_email_enabled?: boolean | null
          notifications_frequency?:
            | Database["public"]["Enums"]["notification_frequency_enum"]
            | null
          notifications_push_enabled?: boolean | null
          notifications_quiet_hours_end?: string | null
          notifications_quiet_hours_start?: string | null
          notifications_sms_enabled?: boolean | null
          notifications_whatsapp_enabled?: boolean | null
          photo_compression_level?:
            | Database["public"]["Enums"]["photo_compression_enum"]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          role: string
          content: string
          metadata: Json
          tokens_used: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          role: string
          content: string
          metadata?: Json
          tokens_used?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          role?: string
          content?: string
          metadata?: Json
          tokens_used?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_transcriptions: {
        Row: {
          id: string
          user_id: string
          session_id: string
          audio_duration: number
          audio_size: number
          audio_format: string
          original_text: string
          detected_language: string
          confidence_score: number | null
          needs_translation: boolean
          translated_text: string | null
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          audio_duration: number
          audio_size: number
          audio_format?: string
          original_text: string
          detected_language: string
          confidence_score?: number | null
          needs_translation?: boolean
          translated_text?: string | null
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          audio_duration?: number
          audio_size?: number
          audio_format?: string
          original_text?: string
          detected_language?: string
          confidence_score?: number | null
          needs_translation?: boolean
          translated_text?: string | null
          created_at?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "voice_transcriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_transcriptions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      label_type_enum: "standard" | "large" | "small"
      notification_frequency_enum: "instant" | "daily" | "weekly"
      photo_compression_enum: "none" | "low" | "medium" | "high"
      qr_error_correction_level_enum: "L" | "M" | "Q" | "H"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      label_type_enum: ["standard", "large", "small"],
      notification_frequency_enum: ["instant", "daily", "weekly"],
      photo_compression_enum: ["none", "low", "medium", "high"],
      qr_error_correction_level_enum: ["L", "M", "Q", "H"],
    },
  },
} as const 