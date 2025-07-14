export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      claims: {
        Row: {
          claimed_at: string | null
          id: string
          lot_id: string
          maker_id: string
          notes: string | null
          picked_up_at: string | null
          pickup_scheduled_at: string | null
          return_scheduled_at: string | null
          returned_at: string | null
        }
        Insert: {
          claimed_at?: string | null
          id?: string
          lot_id: string
          maker_id: string
          notes?: string | null
          picked_up_at?: string | null
          pickup_scheduled_at?: string | null
          return_scheduled_at?: string | null
          returned_at?: string | null
        }
        Update: {
          claimed_at?: string | null
          id?: string
          lot_id?: string
          maker_id?: string
          notes?: string | null
          picked_up_at?: string | null
          pickup_scheduled_at?: string | null
          return_scheduled_at?: string | null
          returned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          category: string
          claimed_by: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_weight_kg: number | null
          expiry_date: string | null
          id: string
          images: string[] | null
          items_count: number
          pickup_date: string | null
          return_date: string | null
          status: Database["public"]["Enums"]["lot_status"]
          store_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          claimed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_weight_kg?: number | null
          expiry_date?: string | null
          id?: string
          images?: string[] | null
          items_count?: number
          pickup_date?: string | null
          return_date?: string | null
          status?: Database["public"]["Enums"]["lot_status"]
          store_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          claimed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_weight_kg?: number | null
          expiry_date?: string | null
          id?: string
          images?: string[] | null
          items_count?: number
          pickup_date?: string | null
          return_date?: string | null
          status?: Database["public"]["Enums"]["lot_status"]
          store_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          full_name: string
          id: string
          kyc_verified: boolean | null
          maker_tier: Database["public"]["Enums"]["maker_tier"] | null
          phone: string | null
          rating: number | null
          role: Database["public"]["Enums"]["user_role"]
          successful_returns: number | null
          total_claims: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          kyc_verified?: boolean | null
          maker_tier?: Database["public"]["Enums"]["maker_tier"] | null
          phone?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          successful_returns?: number | null
          total_claims?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          kyc_verified?: boolean | null
          maker_tier?: Database["public"]["Enums"]["maker_tier"] | null
          phone?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          successful_returns?: number | null
          total_claims?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      returned_products: {
        Row: {
          approved_for_sale: boolean | null
          claim_id: string
          created_at: string | null
          description: string | null
          estimated_value: number | null
          id: string
          images: string[] | null
          product_name: string
          review_status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_for_sale?: boolean | null
          claim_id: string
          created_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          images?: string[] | null
          product_name: string
          review_status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_for_sale?: boolean | null
          claim_id?: string
          created_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          images?: string[] | null
          product_name?: string
          review_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returned_products_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
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
      lot_status:
        | "available"
        | "claimed"
        | "picked_up"
        | "returned"
        | "completed"
      maker_tier: "bronze" | "silver" | "gold" | "platinum"
      user_role: "store_staff" | "maker" | "admin"
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
      lot_status: [
        "available",
        "claimed",
        "picked_up",
        "returned",
        "completed",
      ],
      maker_tier: ["bronze", "silver", "gold", "platinum"],
      user_role: ["store_staff", "maker", "admin"],
    },
  },
} as const
