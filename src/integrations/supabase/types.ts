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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          address: string | null
          approved: boolean
          capacity: number | null
          category: string
          created_at: string
          currency: string
          date: string | null
          description: string | null
          id: string
          image: string | null
          organizer: string | null
          organizer_id: string | null
          organizer_name: string | null
          payment_name: string | null
          payment_operator: string | null
          payment_phone: string | null
          price: number
          status: string
          time: string | null
          title: string
        }
        Insert: {
          address?: string | null
          approved?: boolean
          capacity?: number | null
          category?: string
          created_at?: string
          currency?: string
          date?: string | null
          description?: string | null
          id: string
          image?: string | null
          organizer?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          payment_name?: string | null
          payment_operator?: string | null
          payment_phone?: string | null
          price?: number
          status?: string
          time?: string | null
          title: string
        }
        Update: {
          address?: string | null
          approved?: boolean
          capacity?: number | null
          category?: string
          created_at?: string
          currency?: string
          date?: string | null
          description?: string | null
          id?: string
          image?: string | null
          organizer?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          payment_name?: string | null
          payment_operator?: string | null
          payment_phone?: string | null
          price?: number
          status?: string
          time?: string | null
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          from_id: string
          id: string
          is_system: boolean | null
          read: boolean | null
          text: string
          to_id: string
        }
        Insert: {
          created_at?: string
          from_id: string
          id?: string
          is_system?: boolean | null
          read?: boolean | null
          text: string
          to_id: string
        }
        Update: {
          created_at?: string
          from_id?: string
          id?: string
          is_system?: boolean | null
          read?: boolean | null
          text?: string
          to_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pub_requests: {
        Row: {
          approved_at: string | null
          created_at: string
          event_address: string | null
          event_capacity: number | null
          event_category: string | null
          event_currency: string | null
          event_date: string | null
          event_description: string | null
          event_id: string | null
          event_image: string | null
          event_price: number | null
          event_time: string | null
          event_title: string | null
          id: string
          org_pay_name: string | null
          org_pay_operator: string | null
          org_pay_phone: string | null
          organizer_email: string | null
          organizer_id: string | null
          organizer_name: string | null
          organizer_phone: string | null
          pay_operator: string | null
          pay_phone: string | null
          proof_image: string | null
          rejected_at: string | null
          status: string
          tx_ref: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          event_address?: string | null
          event_capacity?: number | null
          event_category?: string | null
          event_currency?: string | null
          event_date?: string | null
          event_description?: string | null
          event_id?: string | null
          event_image?: string | null
          event_price?: number | null
          event_time?: string | null
          event_title?: string | null
          id: string
          org_pay_name?: string | null
          org_pay_operator?: string | null
          org_pay_phone?: string | null
          organizer_email?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          pay_operator?: string | null
          pay_phone?: string | null
          proof_image?: string | null
          rejected_at?: string | null
          status?: string
          tx_ref?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          event_address?: string | null
          event_capacity?: number | null
          event_category?: string | null
          event_currency?: string | null
          event_date?: string | null
          event_description?: string | null
          event_id?: string | null
          event_image?: string | null
          event_price?: number | null
          event_time?: string | null
          event_title?: string | null
          id?: string
          org_pay_name?: string | null
          org_pay_operator?: string | null
          org_pay_phone?: string | null
          organizer_email?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          pay_operator?: string | null
          pay_phone?: string | null
          proof_image?: string | null
          rejected_at?: string | null
          status?: string
          tx_ref?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          approved_at: string | null
          currency: string | null
          event_address: string | null
          event_date: string | null
          event_id: string | null
          event_time: string | null
          event_title: string | null
          id: string
          org_pay_operator: string | null
          org_pay_phone: string | null
          organizer_id: string | null
          organizer_name: string | null
          owner_email: string | null
          owner_id: string | null
          owner_name: string | null
          owner_phone: string | null
          payment_approved: boolean | null
          payment_method: string | null
          payment_phone: string | null
          payment_status: string
          price: number | null
          proof_image_url: string | null
          purchased_at: string
          rejected_at: string | null
          reversal_amount: number | null
          reversal_at: string | null
          reversal_done: boolean | null
          reversal_tx_ref: string | null
          tx_ref: string | null
          validated: boolean | null
          validated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          currency?: string | null
          event_address?: string | null
          event_date?: string | null
          event_id?: string | null
          event_time?: string | null
          event_title?: string | null
          id: string
          org_pay_operator?: string | null
          org_pay_phone?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          owner_email?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          payment_approved?: boolean | null
          payment_method?: string | null
          payment_phone?: string | null
          payment_status?: string
          price?: number | null
          proof_image_url?: string | null
          purchased_at?: string
          rejected_at?: string | null
          reversal_amount?: number | null
          reversal_at?: string | null
          reversal_done?: boolean | null
          reversal_tx_ref?: string | null
          tx_ref?: string | null
          validated?: boolean | null
          validated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          currency?: string | null
          event_address?: string | null
          event_date?: string | null
          event_id?: string | null
          event_time?: string | null
          event_title?: string | null
          id?: string
          org_pay_operator?: string | null
          org_pay_phone?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          owner_email?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          payment_approved?: boolean | null
          payment_method?: string | null
          payment_phone?: string | null
          payment_status?: string
          price?: number | null
          proof_image_url?: string | null
          purchased_at?: string
          rejected_at?: string | null
          reversal_amount?: number | null
          reversal_at?: string | null
          reversal_done?: boolean | null
          reversal_tx_ref?: string | null
          tx_ref?: string | null
          validated?: boolean | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "organizer" | "attendee"
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
  public: {
    Enums: {
      app_role: ["owner", "organizer", "attendee"],
    },
  },
} as const
