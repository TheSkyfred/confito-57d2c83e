
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
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          website: string | null;
          address: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
          credits: number;
          role: 'user' | 'moderator' | 'admin';
        }
      },
      jams: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string;
          recipe: string | null;
          weight_grams: number;
          price_credits: number;
          ingredients: string[];
          allergens: string[] | null;
          sugar_content: number | null;
          created_at: string;
          updated_at: string;
          available_quantity: number;
          is_active: boolean;
        }
      },
      jam_images: {
        Row: {
          id: string;
          jam_id: string;
          url: string;
          is_primary: boolean;
          created_at: string;
        }
      },
      reviews: {
        Row: {
          id: string;
          jam_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        }
      },
      seasonal_fruits: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          jan: boolean;
          feb: boolean;
          mar: boolean;
          apr: boolean;
          may: boolean;
          jun: boolean;
          jul: boolean;
          aug: boolean;
          sep: boolean;
          oct: boolean;
          nov: boolean;
          dec: boolean;
          conservation_tips: string | null;
          created_at: string;
          updated_at: string;
        }
      },
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          image_url: string;
          category: 'achievement' | 'specialty' | 'community';
          created_at: string;
        }
      },
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          awarded_at: string;
        }
      },
      jam_battles: {
        Row: {
          id: string;
          jam_a_id: string;
          jam_b_id: string;
          votes_for_a: number;
          votes_for_b: number;
          start_date: string;
          end_date: string;
          is_active: boolean;
        }
      },
      battle_votes: {
        Row: {
          id: string;
          battle_id: string;
          user_id: string;
          voted_for_jam_id: string;
          created_at: string;
        }
      },
      favorites: {
        Row: {
          id: string;
          user_id: string;
          jam_id: string;
          created_at: string;
        }
      },
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          jam_id: string;
          quantity: number;
          status: 'pending' | 'accepted' | 'shipped' | 'delivered' | 'cancelled';
          total_credits: number;
          shipping_address: string;
          tracking_number: string | null;
          created_at: string;
          updated_at: string;
        }
      },
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string;
          related_order_id: string | null;
          created_at: string;
        }
      },
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          is_read: boolean;
          link: string | null;
          created_at: string;
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Jam = Database['public']['Tables']['jams']['Row']
export type JamImage = Database['public']['Tables']['jam_images']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type SeasonalFruit = Database['public']['Tables']['seasonal_fruits']['Row']
export type Badge = Database['public']['Tables']['badges']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']
export type JamBattle = Database['public']['Tables']['jam_battles']['Row']
export type BattleVote = Database['public']['Tables']['battle_votes']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
