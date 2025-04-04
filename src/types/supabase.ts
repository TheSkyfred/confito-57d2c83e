
// This file contains TypeScript types for the Supabase database

export type ProfileType = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  credits: number;
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  updated_at: string;
};

export type JamImageType = {
  id: string;
  jam_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
};

export type JamType = {
  id: string;
  name: string;
  creator_id: string;
  description: string;
  ingredients: string[];
  allergens: string[] | null;
  weight_grams: number;
  sugar_content: number | null;
  price_credits: number;
  available_quantity: number;
  recipe: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  jam_images: JamImageType[];
  profiles?: ProfileType;
  reviews?: ReviewType[];
  avgRating?: number;
};

export type ReviewType = {
  id: string;
  jam_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  reviewer?: ProfileType;
};

export type BattleVoteType = {
  id: string;
  battle_id: string;
  user_id: string;
  voted_for_jam_id: string;
  created_at: string;
};

export type JamBattleType = {
  id: string;
  jam_a_id: string;
  jam_b_id: string;
  votes_for_a: number;
  votes_for_b: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  jam_a: JamType;
  jam_b: JamType;
  already_voted?: boolean;
  voted_for?: string;
};

export type CreditTransactionType = {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  related_order_id: string | null;
  created_at: string;
};
