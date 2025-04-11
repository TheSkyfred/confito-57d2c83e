
import { ProfileType } from './supabase';

export type AdviceType = 'fruits' | 'cuisson' | 'recette' | 'conditionnement' | 'sterilisation' | 'materiel';

export interface AdviceArticle {
  id: string;
  title: string;
  author_id: string;
  cover_image_url: string | null;
  video_url: string | null;
  content: string | null;
  type: AdviceType;
  tags: string[];
  visible: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  status?: 'pending' | 'approved' | 'rejected';
  
  // Relations
  author?: ProfileType;
  images?: AdviceImage[];
  products?: AdviceProduct[];
  comments?: AdviceComment[];
  
  // Calculated fields
  has_video?: boolean;
  has_products?: boolean;
  comments_count?: number;
}

export interface AdviceImage {
  id: string;
  article_id: string;
  image_url: string;  // Utiliser image_url au lieu de url
  description: string | null;
  created_at: string;
}

export interface AdviceProduct {
  id: string;
  article_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  external_url: string | null;
  is_sponsored: boolean;
  promo_code?: string | null;
  click_count: number;
  conversion_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdviceComment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: ProfileType;
  replies?: AdviceComment[];
  
  // UI state
  is_replying?: boolean;
  is_liked?: boolean;
  isLiked?: boolean;
}

export interface AdviceCommentLike {
  id: string;
  user_id: string;
  comment_id: string;
  created_at: string;
}

export interface AdviceFilters {
  type?: AdviceType[];
  hasVideo?: boolean;
  hasProducts?: boolean;
  searchTerm?: string;
  sortBy?: 'date' | 'popularity' | 'clicks';
}

export interface ProductFormData {
  name: string;
  description: string;
  image_url: string;
  external_url: string;
  promo_code?: string;
  is_sponsored: boolean;
}
