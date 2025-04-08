import { ProfileType } from './supabase';

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
  jam_id: string | null;
  campaign_type: 'pro' | 'sponsored';
  redirect_url: string | null;
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
