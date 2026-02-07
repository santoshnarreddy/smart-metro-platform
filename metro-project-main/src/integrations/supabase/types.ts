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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      assistance_requests: {
        Row: {
          accepted_at: string | null
          assistance_type: Database["public"]["Enums"]["assistance_type"]
          completed_at: string | null
          contact_number: string
          created_at: string
          description: string
          emergency_contact: string | null
          feedback: string | null
          id: string
          priority_level: number | null
          rating: number | null
          requester_id: string
          scheduled_time: string | null
          special_instructions: string | null
          station_name: string
          status: Database["public"]["Enums"]["assistance_status"]
          updated_at: string
          volunteer_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          assistance_type: Database["public"]["Enums"]["assistance_type"]
          completed_at?: string | null
          contact_number: string
          created_at?: string
          description: string
          emergency_contact?: string | null
          feedback?: string | null
          id?: string
          priority_level?: number | null
          rating?: number | null
          requester_id: string
          scheduled_time?: string | null
          special_instructions?: string | null
          station_name: string
          status?: Database["public"]["Enums"]["assistance_status"]
          updated_at?: string
          volunteer_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          assistance_type?: Database["public"]["Enums"]["assistance_type"]
          completed_at?: string | null
          contact_number?: string
          created_at?: string
          description?: string
          emergency_contact?: string | null
          feedback?: string | null
          id?: string
          priority_level?: number | null
          rating?: number | null
          requester_id?: string
          scheduled_time?: string | null
          special_instructions?: string | null
          station_name?: string
          status?: Database["public"]["Enums"]["assistance_status"]
          updated_at?: string
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistance_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "assistance_requests_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_response: string | null
          admin_user_id: string | null
          category: Database["public"]["Enums"]["feedback_category"]
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id: string
          priority_level: number | null
          resolved_at: string | null
          screenshot_url: string | null
          station_name: string | null
          status: Database["public"]["Enums"]["feedback_status"]
          subject: string
          tracking_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          admin_user_id?: string | null
          category: Database["public"]["Enums"]["feedback_category"]
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id?: string
          priority_level?: number | null
          resolved_at?: string | null
          screenshot_url?: string | null
          station_name?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          subject: string
          tracking_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          admin_user_id?: string | null
          category?: Database["public"]["Enums"]["feedback_category"]
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          feedback_type?: Database["public"]["Enums"]["feedback_type"]
          id?: string
          priority_level?: number | null
          resolved_at?: string | null
          screenshot_url?: string | null
          station_name?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          subject?: string
          tracking_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_stalls: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          opening_hours: string | null
          rating: number | null
          station_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          opening_hours?: string | null
          rating?: number | null
          station_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          opening_hours?: string | null
          rating?: number | null
          station_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lost_and_found: {
        Row: {
          admin_notes: string | null
          admin_verified: boolean | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          date_incident: string
          description: string
          id: string
          image_url: string | null
          item_type: Database["public"]["Enums"]["item_type"]
          keywords: string[] | null
          report_type: Database["public"]["Enums"]["report_type"]
          resolved_with: string | null
          station_name: string
          status: Database["public"]["Enums"]["item_status"]
          time_incident: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          admin_verified?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_incident: string
          description: string
          id?: string
          image_url?: string | null
          item_type: Database["public"]["Enums"]["item_type"]
          keywords?: string[] | null
          report_type: Database["public"]["Enums"]["report_type"]
          resolved_with?: string | null
          station_name: string
          status?: Database["public"]["Enums"]["item_status"]
          time_incident?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          admin_verified?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_incident?: string
          description?: string
          id?: string
          image_url?: string | null
          item_type?: Database["public"]["Enums"]["item_type"]
          keywords?: string[] | null
          report_type?: Database["public"]["Enums"]["report_type"]
          resolved_with?: string | null
          station_name?: string
          status?: Database["public"]["Enums"]["item_status"]
          time_incident?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          preparation_time: number | null
          price: number
          stall_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          preparation_time?: number | null
          price: number
          stall_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          preparation_time?: number | null
          price?: number
          stall_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_stall_id_fkey"
            columns: ["stall_id"]
            isOneToOne: false
            referencedRelation: "food_stalls"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_tickets: {
        Row: {
          created_at: string
          destination_station: string
          expires_at: string
          fare_amount: number
          id: string
          is_validated: boolean
          passenger_count: number
          qr_data: string
          source_station: string
          ticket_id: string
          travel_date: string
          travel_time: string
          user_id: string | null
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          destination_station: string
          expires_at: string
          fare_amount: number
          id?: string
          is_validated?: boolean
          passenger_count?: number
          qr_data: string
          source_station: string
          ticket_id: string
          travel_date: string
          travel_time: string
          user_id?: string | null
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          destination_station?: string
          expires_at?: string
          fare_amount?: number
          id?: string
          is_validated?: boolean
          passenger_count?: number
          qr_data?: string
          source_station?: string
          ticket_id?: string
          travel_date?: string
          travel_time?: string
          user_id?: string | null
          validated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          order_id: string
          price: number
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_station: string
          estimated_delivery: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          stall_id: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_station: string
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          stall_id: string
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_station?: string
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          stall_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_stall_id_fkey"
            columns: ["stall_id"]
            isOneToOne: false
            referencedRelation: "food_stalls"
            referencedColumns: ["id"]
          },
        ]
      }
      parking_availability: {
        Row: {
          date: string
          id: string
          occupied_slots: number
          station_id: string
          station_name: string
          total_slots: number
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          date?: string
          id?: string
          occupied_slots?: number
          station_id: string
          station_name: string
          total_slots: number
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          date?: string
          id?: string
          occupied_slots?: number
          station_id?: string
          station_name?: string
          total_slots?: number
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      parking_bookings: {
        Row: {
          amount: number
          booking_date: string
          created_at: string
          end_time: string
          id: string
          payment_status: string
          slot_number: number
          start_time: string
          station_id: string
          station_name: string
          status: string
          updated_at: string
          user_id: string
          vehicle_type: string
        }
        Insert: {
          amount: number
          booking_date: string
          created_at?: string
          end_time: string
          id?: string
          payment_status?: string
          slot_number: number
          start_time: string
          station_id: string
          station_name: string
          status?: string
          updated_at?: string
          user_id: string
          vehicle_type: string
        }
        Update: {
          amount?: number
          booking_date?: string
          created_at?: string
          end_time?: string
          id?: string
          payment_status?: string
          slot_number?: number
          start_time?: string
          station_id?: string
          station_name?: string
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability_status: boolean | null
          created_at: string
          emergency_contact: string | null
          full_name: string
          id: string
          is_verified_volunteer: boolean | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          specializations: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_status?: boolean | null
          created_at?: string
          emergency_contact?: string | null
          full_name: string
          id?: string
          is_verified_volunteer?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specializations?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_status?: boolean | null
          created_at?: string
          emergency_contact?: string | null
          full_name?: string
          id?: string
          is_verified_volunteer?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specializations?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      virtual_card_transactions: {
        Row: {
          amount: number
          card_id: string
          created_at: string
          description: string | null
          id: string
          payment_method: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          card_id: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_card_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "virtual_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_cards: {
        Row: {
          balance: number
          card_number: string
          created_at: string
          holder_name: string
          id: string
          linked_smart_card: string | null
          profile_image_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          card_number: string
          created_at?: string
          holder_name: string
          id?: string
          linked_smart_card?: string | null
          profile_image_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          card_number?: string
          created_at?: string
          holder_name?: string
          id?: string
          linked_smart_card?: string | null
          profile_image_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          purpose: string
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          purpose: string
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          purpose?: string
          transaction_type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_matching_reports: {
        Args: { report_id: string }
        Returns: {
          created_at: string
          description: string
          id: string
          match_score: number
          report_type: Database["public"]["Enums"]["report_type"]
          station_name: string
          title: string
        }[]
      }
      generate_keywords: {
        Args: { description: string; title: string }
        Returns: string[]
      }
      generate_tracking_id: { Args: never; Returns: string }
    }
    Enums: {
      assistance_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      assistance_type:
        | "wheelchair"
        | "visual_impairment"
        | "hearing_impairment"
        | "mobility_aid"
        | "elderly_support"
        | "other"
      feedback_category:
        | "metro_service"
        | "station_facilities"
        | "ticketing"
        | "cleanliness"
        | "accessibility"
        | "safety_security"
        | "parking"
        | "food_services"
        | "technical_issues"
        | "staff_behavior"
        | "other"
      feedback_status:
        | "pending"
        | "in_review"
        | "under_investigation"
        | "resolved"
        | "closed"
      feedback_type: "complaint" | "suggestion" | "compliment"
      item_status: "active" | "claimed" | "resolved" | "expired"
      item_type:
        | "electronics"
        | "clothing"
        | "documents"
        | "jewelry"
        | "bags"
        | "books"
        | "keys"
        | "mobile_phone"
        | "wallet"
        | "other"
      report_type: "lost" | "found"
      user_role: "passenger" | "volunteer" | "admin"
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
      assistance_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      assistance_type: [
        "wheelchair",
        "visual_impairment",
        "hearing_impairment",
        "mobility_aid",
        "elderly_support",
        "other",
      ],
      feedback_category: [
        "metro_service",
        "station_facilities",
        "ticketing",
        "cleanliness",
        "accessibility",
        "safety_security",
        "parking",
        "food_services",
        "technical_issues",
        "staff_behavior",
        "other",
      ],
      feedback_status: [
        "pending",
        "in_review",
        "under_investigation",
        "resolved",
        "closed",
      ],
      feedback_type: ["complaint", "suggestion", "compliment"],
      item_status: ["active", "claimed", "resolved", "expired"],
      item_type: [
        "electronics",
        "clothing",
        "documents",
        "jewelry",
        "bags",
        "books",
        "keys",
        "mobile_phone",
        "wallet",
        "other",
      ],
      report_type: ["lost", "found"],
      user_role: ["passenger", "volunteer", "admin"],
    },
  },
} as const
