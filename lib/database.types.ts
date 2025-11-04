export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_actions: {
        Row: {
          action_type: string
          created_at: string | null
          entity_id: string | null
          error_message: string | null
          executed_at: string | null
          extracted_data: Json
          id: string
          missing_fields: string[] | null
          session_id: string
          status: string
          updated_at: string | null
          user_id: string
          validation_errors: Json | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          entity_id?: string | null
          error_message?: string | null
          executed_at?: string | null
          extracted_data?: Json
          id?: string
          missing_fields?: string[] | null
          session_id: string
          status: string
          updated_at?: string | null
          user_id: string
          validation_errors?: Json | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          entity_id?: string | null
          error_message?: string | null
          executed_at?: string | null
          extracted_data?: Json
          id?: string
          missing_fields?: string[] | null
          session_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          validation_errors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_actions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          mode: string | null
          role: string
          session_id: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mode?: string | null
          role: string
          session_id: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mode?: string | null
          role?: string
          session_id?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          mode: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mode?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mode?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json | null
          success: boolean
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          success?: boolean
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          success?: boolean
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_mode_transitions: {
        Row: {
          created_at: string | null
          from_mode: string
          id: string
          metadata: Json | null
          preserve_history: boolean | null
          session_id: string | null
          to_mode: string
          trigger_reason: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          from_mode: string
          id?: string
          metadata?: Json | null
          preserve_history?: boolean | null
          session_id?: string | null
          to_mode: string
          trigger_reason: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          from_mode?: string
          id?: string
          metadata?: Json | null
          preserve_history?: boolean | null
          session_id?: string | null
          to_mode?: string
          trigger_reason?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_mode_transitions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
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
          created_at: string | null
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
          updated_at: string | null
          user_id: string
          weight: number
        }
        Insert: {
          category: string
          created_at?: string | null
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
          updated_at?: string | null
          user_id: string
          weight: number
        }
        Update: {
          category?: string
          created_at?: string | null
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
          updated_at?: string | null
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
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
      voice_transcriptions: {
        Row: {
          audio_duration: number
          audio_format: string | null
          audio_size: number
          confidence_score: number | null
          created_at: string | null
          detected_language: string
          id: string
          metadata: Json | null
          needs_translation: boolean | null
          original_text: string
          session_id: string
          translated_text: string | null
          user_id: string
        }
        Insert: {
          audio_duration: number
          audio_format?: string | null
          audio_size: number
          confidence_score?: number | null
          created_at?: string | null
          detected_language: string
          id?: string
          metadata?: Json | null
          needs_translation?: boolean | null
          original_text: string
          session_id: string
          translated_text?: string | null
          user_id: string
        }
        Update: {
          audio_duration?: number
          audio_format?: string | null
          audio_size?: number
          confidence_score?: number | null
          created_at?: string | null
          detected_language?: string
          id?: string
          metadata?: Json | null
          needs_translation?: boolean | null
          original_text?: string
          session_id?: string
          translated_text?: string | null
          user_id?: string
        }
        Relationships: [
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
      create_invoice_with_items: {
        Args: {
          p_customer_address_snapshot: string
          p_customer_email_snapshot: string
          p_customer_id: string
          p_customer_name_snapshot: string
          p_customer_phone_snapshot: string
          p_firm_address_snapshot: string
          p_firm_gstin_snapshot: string
          p_firm_name_snapshot: string
          p_firm_phone_snapshot: string
          p_grand_total: number
          p_gst_amount: number
          p_gst_percentage: number
          p_invoice_date: string
          p_items: Json
          p_notes: string
          p_status: string
          p_subtotal: number
          p_user_id: string
        }
        Returns: {
          invoice_id: string
          invoice_number: string
        }[]
      }
      create_new_chat_session: {
        Args: { p_title: string; p_user_id: string }
        Returns: string
      }
      delete_customer_with_cleanup: {
        Args: { p_customer_id: string; p_user_id: string }
        Returns: {
          identity_doc_path: string
        }[]
      }
      delete_purchase_invoice_with_cleanup: {
        Args: { p_invoice_id: string; p_user_id: string }
        Returns: {
          file_path: string
        }[]
      }
      delete_stock_item_with_cleanup: {
        Args: { p_item_id: string; p_user_id: string }
        Returns: {
          image_paths: string[]
        }[]
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      label_type_enum: ["standard", "large", "small"],
      notification_frequency_enum: ["instant", "daily", "weekly"],
      photo_compression_enum: ["none", "low", "medium", "high"],
      qr_error_correction_level_enum: ["L", "M", "Q", "H"],
    },
  },
} as const
