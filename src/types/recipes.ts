
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
