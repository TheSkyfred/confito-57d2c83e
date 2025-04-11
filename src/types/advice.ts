
export type AdviceType = 'fruits' | 'cuisson' | 'recette' | 'conditionnement' | 'sterilisation' | 'materiel';

export interface AdviceFilters {
  type?: AdviceType[];
  hasVideo?: boolean;
  hasProducts?: boolean;
  searchTerm?: string;
  sortBy?: 'date' | 'popularity' | 'clicks';
}

export interface AdviceArticle {
  id: string;
  title: string;
  content?: string;
  cover_image_url?: string;
  video_url?: string;
  type: AdviceType;
  author_id: string;
  author?: {
    full_name?: string;
    avatar_url?: string;
  };
  tags?: string[];
  visible?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  products?: AdviceProduct[];
  comments?: any[];
  // Add these properties to fix the errors
  has_video?: boolean;
  has_products?: boolean;
  comments_count?: number;
}

export interface AdviceProduct {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  external_url?: string;
  is_sponsored?: boolean;
  article_id?: string;
  click_count?: number;
  conversion_count?: number;
  created_at: string;
  updated_at: string;
  promo_code?: string;
}
