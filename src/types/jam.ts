
export interface Jam {
  id: string;
  name: string;
  description: string;
  price_credits: number;
  created_at: string;
  is_active: boolean;
  jam_images?: { url: string }[] | any;
  cover_image_url?: string | null;
  // Add any other properties needed
  ingredients: string[];
  allergens?: string[] | null;
  weight_grams: number;
  available_quantity: number;
  creator_id: string;
  avgRating?: number;
  profiles?: {
    id?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
  reviews?: any[];
}
