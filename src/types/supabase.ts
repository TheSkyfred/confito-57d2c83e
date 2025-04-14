
// This file contains TypeScript types for the Supabase database

export type ProfileType = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  address: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  phone: string | null;
  website: string | null;
  credits: number;
  role: 'user' | 'moderator' | 'admin' | 'pro';
  created_at: string;
  updated_at: string;
  is_active: boolean;
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
  price_euros?: number | null;
  available_quantity: number;
  recipe: string | null;
  recipe_steps?: any[];
  type?: string;
  badges?: string[];
  production_date?: string;
  shelf_life_months?: number;
  special_edition?: boolean;
  is_active: boolean;
  is_pro?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
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

export type DetailedReviewType = {
  id: string;
  jam_id: string;
  reviewer_id: string;
  taste_rating: number;
  texture_rating: number;
  originality_rating: number;
  balance_rating: number;
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

export type OrderType = {
  id: string;
  buyer_id: string;
  seller_id: string;
  jam_id: string;
  quantity: number;
  shipping_address: string;
  total_credits: number;
  status: "pending" | "cancelled" | "accepted" | "shipped" | "delivered";
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  buyer?: ProfileType;
  seller?: ProfileType;
  jam?: JamType;
};

// Nouveaux types pour le système de Battle

export type BattleStatus = 'inscription' | 'selection' | 'production' | 'envoi' | 'vote' | 'termine';

export type NewBattleType = {
  id: string;
  theme: string;
  constraints: Record<string, any>;
  max_price_credits: number;
  min_jams_required: number;
  max_judges: number;
  judge_discount_percent: number;
  reward_credits: number;
  reward_description: string | null;
  registration_start_date: string;
  registration_end_date: string;
  production_end_date: string;
  voting_end_date: string;
  status: BattleStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  battle_participants?: BattleParticipantType[];
  battle_judges?: BattleJudgeType[];
  battle_candidates?: BattleCandidateType[];
  battle_results?: BattleResultType | null;
  participant_count?: number;
  judge_count?: number;
  candidate_count?: number;
};

export type BattleCandidateType = {
  id: string;
  battle_id: string;
  user_id: string;
  motivation: string;
  reference_jam_id: string | null;
  is_selected: boolean | null;
  created_at: string;
  profile?: ProfileType;
  reference_jam?: JamType;
};

export type BattleParticipantType = {
  id: string;
  battle_id: string;
  user_id: string;
  jam_id: string | null;
  created_at: string;
  profile?: ProfileType;
  jam?: JamType;
};

export type BattleJudgeType = {
  id: string;
  battle_id: string;
  user_id: string;
  has_ordered: boolean;
  has_received: boolean;
  is_validated?: boolean;
  created_at: string;
  profile?: ProfileType;
};

export type BattleCriteriaType = {
  id: string;
  name: string;
  description: string;
  weight: number;
  created_at: string;
};

export type BattleVoteDetailedType = {
  id: string;
  battle_id: string;
  judge_id: string;
  participant_id: string;
  criteria_id: string;
  score: number;
  created_at: string;
  updated_at: string;
  judge?: ProfileType;
  participant?: ProfileType;
  criteria?: BattleCriteriaType;
};

export type BattleVoteCommentType = {
  id: string;
  battle_id: string;
  judge_id: string;
  participant_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  is_draft: boolean;
  judge?: ProfileType;
  participant?: ProfileType;
};

export type BattleResultType = {
  id: string;
  battle_id: string;
  winner_id: string;
  participant_a_id: string;
  participant_a_score: number;
  participant_b_id: string;
  participant_b_score: number;
  reward_distributed: boolean;
  created_at: string;
  updated_at: string;
  winner?: ProfileType;
  participant_a?: ProfileType;
  participant_b?: ProfileType;
  battle?: NewBattleType;
};

export type BattleStarsType = {
  id: string;
  user_id: string;
  participations: number;
  victories: number;
  total_score: number;
  last_battle_date: string | null;
  created_at: string;
  updated_at: string;
  profile?: ProfileType;
};
