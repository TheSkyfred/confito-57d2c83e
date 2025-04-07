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
      badges: {
        Row: {
          category: Database["public"]["Enums"]["badge_category"]
          created_at: string
          description: string
          id: string
          image_url: string
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["badge_category"]
          created_at?: string
          description: string
          id?: string
          image_url: string
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["badge_category"]
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      battle_votes: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          user_id: string
          voted_for_jam_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          user_id: string
          voted_for_jam_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          user_id?: string
          voted_for_jam_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_votes_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "jam_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_votes_voted_for_jam_id_fkey"
            columns: ["voted_for_jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          related_order_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          related_order_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          related_order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          jam_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jam_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jam_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_battles: {
        Row: {
          end_date: string
          id: string
          is_active: boolean
          jam_a_id: string
          jam_b_id: string
          start_date: string
          votes_for_a: number
          votes_for_b: number
        }
        Insert: {
          end_date: string
          id?: string
          is_active?: boolean
          jam_a_id: string
          jam_b_id: string
          start_date?: string
          votes_for_a?: number
          votes_for_b?: number
        }
        Update: {
          end_date?: string
          id?: string
          is_active?: boolean
          jam_a_id?: string
          jam_b_id?: string
          start_date?: string
          votes_for_a?: number
          votes_for_b?: number
        }
        Relationships: [
          {
            foreignKeyName: "jam_battles_jam_a_id_fkey"
            columns: ["jam_a_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jam_battles_jam_b_id_fkey"
            columns: ["jam_b_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_images: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          jam_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          jam_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          jam_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "jam_images_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
        ]
      }
      jams: {
        Row: {
          allergens: string[] | null
          available_quantity: number
          created_at: string
          creator_id: string
          description: string
          id: string
          ingredients: string[]
          is_active: boolean
          name: string
          price_credits: number
          recipe: string | null
          sugar_content: number | null
          updated_at: string
          weight_grams: number
        }
        Insert: {
          allergens?: string[] | null
          available_quantity?: number
          created_at?: string
          creator_id: string
          description: string
          id?: string
          ingredients: string[]
          is_active?: boolean
          name: string
          price_credits: number
          recipe?: string | null
          sugar_content?: number | null
          updated_at?: string
          weight_grams: number
        }
        Update: {
          allergens?: string[] | null
          available_quantity?: number
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          ingredients?: string[]
          is_active?: boolean
          name?: string
          price_credits?: number
          recipe?: string | null
          sugar_content?: number | null
          updated_at?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "jams_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          jam_id: string
          quantity: number
          seller_id: string
          shipping_address: string
          status: Database["public"]["Enums"]["order_status"]
          total_credits: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          jam_id: string
          quantity?: number
          seller_id: string
          shipping_address: string
          status?: Database["public"]["Enums"]["order_status"]
          total_credits: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          jam_id?: string
          quantity?: number
          seller_id?: string
          shipping_address?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_credits?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits: number
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username: string
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          jam_id: string
          rating: number
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          jam_id: string
          rating: number
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          jam_id?: string
          rating?: number
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_jam_id_fkey"
            columns: ["jam_id"]
            isOneToOne: false
            referencedRelation: "jams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_fruits: {
        Row: {
          apr: boolean
          aug: boolean
          conservation_tips: string | null
          created_at: string
          dec: boolean
          description: string | null
          feb: boolean
          id: string
          image_url: string | null
          jan: boolean
          jul: boolean
          jun: boolean
          mar: boolean
          may: boolean
          name: string
          nov: boolean
          oct: boolean
          sep: boolean
          updated_at: string
        }
        Insert: {
          apr?: boolean
          aug?: boolean
          conservation_tips?: string | null
          created_at?: string
          dec?: boolean
          description?: string | null
          feb?: boolean
          id?: string
          image_url?: string | null
          jan?: boolean
          jul?: boolean
          jun?: boolean
          mar?: boolean
          may?: boolean
          name: string
          nov?: boolean
          oct?: boolean
          sep?: boolean
          updated_at?: string
        }
        Update: {
          apr?: boolean
          aug?: boolean
          conservation_tips?: string | null
          created_at?: string
          dec?: boolean
          description?: string | null
          feb?: boolean
          id?: string
          image_url?: string | null
          jan?: boolean
          jul?: boolean
          jun?: boolean
          mar?: boolean
          may?: boolean
          name?: string
          nov?: boolean
          oct?: boolean
          sep?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      badge_category: "achievement" | "specialty" | "community"
      order_status:
        | "pending"
        | "accepted"
        | "shipped"
        | "delivered"
        | "cancelled"
      user_role: "user" | "moderator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
