
export interface Jam {
  id: string;
  name: string;
  description: string;
  price_credits: number;
  price_euros?: number | null;
  created_at: string;
  is_active: boolean;
  is_pro?: boolean;
  cover_image_url?: string | null;
  // Add any other properties needed
  ingredients: Array<{name: string, quantity: string}> | string[];
  allergens?: string[] | null;
  weight_grams: number;
  available_quantity: number;
  creator_id: string;
  avgRating?: number;
  status?: string;
  profiles?: {
    id?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
  reviews?: any[];
}
