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
  battle_results?: BattleResultType;
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
  is_draft: boolean;
  created_at: string;
  updated_at: string;
  judge?: ProfileType;
  participant?: ProfileType;
};

export type BattleShipmentType = {
  id: string;
  battle_id: string;
  sender_id: string;
  recipient_id: string;
  shipped_at: string | null;
  tracking_code: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  sender?: ProfileType;
  recipient?: ProfileType;
};

export type BattleResultType = {
  id: string;
  battle_id: string;
  winner_id: string | null;
  participant_a_id: string;
  participant_b_id: string;
  participant_a_score: number | null;
  participant_b_score: number | null;
  reward_distributed: boolean;
  created_at: string;
  updated_at: string;
  winner?: ProfileType;
  participant_a?: ProfileType;
  participant_b?: ProfileType;
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

export type AllergenType = {
  id: string;
  name: string;
  category: string;
  severity: number;
  description: string;
  created_at: string;
  updated_at: string;
};

// Types pour les recettes
export type RecipeDifficulty = 'facile' | 'moyen' | 'avancé';
export type RecipeStatus = 'brouillon' | 'pending' | 'approved' | 'rejected';
export type RecipeStyle = 'fruitée' | 'épicée' | 'sans_sucre' | 'traditionnelle' | 'exotique' | 'bio';
export type RecipeSeason = 'printemps' | 'été' | 'automne' | 'hiver' | 'toutes_saisons';

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  name: string;
  base_quantity: number;
  unit: string;
  is_allergen: boolean;
  created_at: string;
};

export type RecipeStep = {
  step: number;
  description: string;
};

export type RecipeType = {
  id: string;
  title: string;
  jam_id: string | null;
  author_id: string;
  prep_time_minutes: number;
  difficulty: RecipeDifficulty;
  instructions: RecipeStep[];
  image_url: string | null;
  created_at: string;
  updated_at: string;
  status: RecipeStatus;
  rejection_reason: string | null;
  season: RecipeSeason;
  style: RecipeStyle;
  
  // Relations
  ingredients?: RecipeIngredient[];
  tags?: { id: string; tag: string }[];
  ratings?: RecipeRating[];
  comments?: RecipeComment[];
  badges?: RecipeBadgeAssignment[];
  author?: ProfileType;
  jam?: any; // Using the existing jam type
  
  // Calculated fields
  average_rating?: number;
  is_favorite?: boolean;
};

export type RecipeRating = {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number;
  created_at: string;
};

export type RecipeComment = {
  id: string;
  recipe_id: string;
  user_id: string;
  content: string;
  is_helpful: boolean;
  created_at: string;
  user?: ProfileType;
};

export type RecipeBadge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
};

export type RecipeBadgeAssignment = {
  id: string;
  recipe_id: string;
  badge_id: string;
  created_at: string;
  badge?: RecipeBadge;
};

export type RecipeFilters = {
  ingredients?: string[];
  allergens?: boolean;
  minRating?: number;
  maxPrepTime?: number;
  difficulty?: RecipeDifficulty[];
  season?: RecipeSeason[];
  style?: RecipeStyle[];
  search?: string;
};

// Nouvelles types pour la publicité
export type AdsCampaignType = {
  id: string;
  name: string;
  jam_id: string;
  campaign_type: 'pro' | 'sponsored';
  planned_impressions: number;
  display_frequency: number;
  budget_euros: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'pending' | 'completed';
  is_visible: boolean;
  billing_type: 'fixed' | 'cpc' | 'cpm';
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // Relations
  jam?: any; // Using the existing jam type
  creator?: ProfileType;
  clicks?: AdsClickType[];
  conversions?: AdsConversionType[];
  invoices?: AdsInvoiceType[];
  
  // Métriques calculées
  impressions_count?: number;
  clicks_count?: number;
  conversions_count?: number;
  ctr?: number; // Click-through rate
  conversion_rate?: number;
};

export type AdsClickType = {
  id: string;
  campaign_id: string;
  user_id: string | null;
  clicked_at: string;
  source_page: string;
  ip_address: string | null;
  user_agent: string | null;
  
  // Relations
  campaign?: AdsCampaignType;
  user?: ProfileType;
};

export type AdsConversionType = {
  id: string;
  click_id: string | null;
  campaign_id: string;
  user_id: string | null;
  conversion_type: 'purchase' | 'profile_view' | 'external_click';
  conversion_value: number | null;
  converted_at: string;
  
  // Relations
  campaign?: AdsCampaignType;
  click?: AdsClickType;
  user?: ProfileType;
};

export type AdsInvoiceType = {
  id: string;
  campaign_id: string;
  amount_euros: number;
  status: 'pending' | 'paid' | 'cancelled';
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  payment_date: string | null;
  payment_method: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  campaign?: AdsCampaignType;
};

export type ProProfileType = {
  id: string;
  company_name: string;
  logo_url: string | null;
  description: string | null;
  story: string | null;
  business_email: string;
  phone: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  billing_address: string | null;
  vat_number: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  profile?: ProfileType;
};

export type ProAccessory = {
  id: string;
  name: string;
  brand: string;
  short_description: string;
  image_url: string | null;
  external_url: string | null;
  click_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  creator?: ProfileType;
};
