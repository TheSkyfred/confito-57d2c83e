
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { AdviceArticle, AdviceFilters } from '@/types/advice';

export const useAdvice = (filters?: AdviceFilters) => {
  const [filteredAdvice, setFilteredAdvice] = useState<AdviceArticle[]>([]);

  const fetchAdviceArticles = async () => {
    const { data, error } = await supabaseDirect.select('advice_articles', `
        *,
        author:profiles(*),
        images:advice_images(*),
        products:advice_products(*),
        comments:advice_comments(count)
      `, 'visible=eq.true');
    
    if (error) {
      console.error('Erreur lors de la récupération des conseils:', error);
      throw error;
    }
    
    // Transformer les données pour ajouter des champs calculés
    return data?.map((article: any): AdviceArticle => ({
      ...article,
      has_video: Boolean(article.video_url),
      has_products: article.products && article.products.length > 0,
      comments_count: article.comments?.[0]?.count || 0
    })) || [];
  };
  
  const { data: advice, isLoading, error } = useQuery({
    queryKey: ['advice'],
    queryFn: fetchAdviceArticles,
  });
  
  useEffect(() => {
    if (!advice) return;
    
    let result = [...advice];
    
    if (filters) {
      // Filtre par type
      if (filters.type && filters.type.length > 0) {
        result = result.filter(item => filters.type!.includes(item.type));
      }
      
      // Filtre par vidéo
      if (filters.hasVideo) {
        result = result.filter(item => item.has_video);
      }
      
      // Filtre par produits
      if (filters.hasProducts) {
        result = result.filter(item => item.has_products);
      }
      
      // Filtre par terme de recherche
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        result = result.filter(item => 
          item.title.toLowerCase().includes(searchLower) || 
          (item.content && item.content.toLowerCase().includes(searchLower)) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      // Tri
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'date':
            result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
            break;
          case 'popularity':
            result.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
            break;
          case 'clicks':
            // On pourrait implémenter ceci si on avait un compteur de clics
            break;
        }
      }
    }
    
    setFilteredAdvice(result);
  }, [advice, filters]);
  
  return {
    advice: filteredAdvice,
    isLoading,
    error
  };
};

export const useAdviceArticle = (articleId: string) => {
  const fetchAdviceArticle = async () => {
    if (!articleId) throw new Error("Article ID est requis");
    
    const { data, error } = await supabaseDirect.select('advice_articles', `
      *,
      author:profiles(*),
      images:advice_images(*),
      products:advice_products(*),
      comments:advice_comments(
        *,
        user:profiles(*)
      )
    `, `id=eq.${articleId},visible=eq.true`);
    
    if (error) {
      console.error('Erreur lors de la récupération du conseil:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Article non trouvé');
    }
    
    const article = data[0];
    
    // Transformer les commentaires pour identifier les fils de discussion
    if (article && article.comments) {
      const comments = article.comments as any[];
      const rootComments = comments.filter(c => !c.parent_comment_id);
      const commentReplies = comments.filter(c => c.parent_comment_id);
      
      rootComments.forEach(rootComment => {
        rootComment.replies = commentReplies.filter(
          reply => reply.parent_comment_id === rootComment.id
        );
      });
      
      article.comments = rootComments;
    }
    
    return {
      ...article,
      has_video: Boolean(article.video_url),
      has_products: article.products && article.products.length > 0
    } as AdviceArticle;
  };
  
  return useQuery({
    queryKey: ['advice', articleId],
    queryFn: fetchAdviceArticle,
    enabled: Boolean(articleId)
  });
};
