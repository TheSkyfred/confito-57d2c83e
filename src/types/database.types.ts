
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
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Jam = Database['public']['Tables']['jams']['Row']
export type JamImage = Database['public']['Tables']['jam_images']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type SeasonalFruit = Database['public']['Tables']['seasonal_fruits']['Row']
