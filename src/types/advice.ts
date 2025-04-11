
// If this file doesn't exist, create it
export type AdviceType = 'fruits' | 'cuisson' | 'recette' | 'conditionnement' | 'sterilisation' | 'materiel';

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
