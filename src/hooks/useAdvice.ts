
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdviceArticle, AdviceFilters } from '@/types/advice';
import { useAuth } from '@/contexts/AuthContext';

export const useAdvice = (filters?: AdviceFilters) => {
  const { profile } = useAuth();
  const [filteredAdvice, setFilteredAdvice] = useState<AdviceArticle[]>([]);

  const fetchAdviceArticles = async () => {
    console.log('Fetching advice articles...');
    
    let query = supabase
      .from('advice_articles')
      .select(`
        *
      `);
    
    // Si l'utilisateur n'est pas admin ou modérateur, ne montrer que les articles approuvés
    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      query = query.eq('status', 'approved');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des conseils:', error);
      throw error;
    }
    
    console.log('Advice articles received:', data);
    
    const authorIds = data?.map(article => article.author_id) || [];
    const uniqueAuthorIds = [...new Set(authorIds)];
    
    let authorProfiles: Record<string, any> = {};
    
    if (uniqueAuthorIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uniqueAuthorIds);
        
      if (!profilesError && profilesData) {
        authorProfiles = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
      }
    }
    
    return data?.map((article: any): AdviceArticle => ({
      ...article,
      has_video: Boolean(article.video_url),
      has_products: false,
      comments_count: 0,
      author: authorProfiles[article.author_id] || null
    })) || [];
  };
  
  const { data: advice, isLoading, error, refetch } = useQuery({
    queryKey: ['advice', profile?.role],
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
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)))
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
    error,
    refetch
  };
};

// Add the useAdviceArticle hook to fetch a specific article by ID
export const useAdviceArticle = (id: string) => {
  const { profile } = useAuth();
  
  const fetchAdviceArticle = async () => {
    console.log('Fetching single advice article with ID:', id);
    
    let query = supabase
      .from('advice_articles')
      .select(`
        *,
        comments:advice_comments(
          *,
          user:profiles(*)
        ),
        products:advice_products(*)
      `)
      .eq('id', id);
    
    // If user is not admin or moderator, only show approved articles
    // or articles authored by the current user
    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      query = query.or(`status.eq.approved,author_id.eq.${profile?.id || ''}`);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      console.error('Error fetching advice article:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Article not found');
    }
    
    // Fetch author information
    const { data: authorData, error: authorError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.author_id)
      .single();
      
    if (authorError) {
      console.error('Error fetching author:', authorError);
    }
    
    // Check if the current user has liked any comments
    let userLikedComments: Record<string, boolean> = {};
    
    if (profile && data.comments && data.comments.length > 0) {
      const commentIds = data.comments.map((comment: any) => comment.id);
      
      const { data: likesData, error: likesError } = await supabase
        .from('advice_comment_likes')
        .select('comment_id')
        .eq('user_id', profile.id)
        .in('comment_id', commentIds);
        
      if (!likesError && likesData) {
        userLikedComments = likesData.reduce((acc, like) => {
          acc[like.comment_id] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }
    }
    
    // Add isLiked property to each comment
    const commentsWithLikes = data.comments ? data.comments.map((comment: any) => ({
      ...comment,
      isLiked: userLikedComments[comment.id] || false
    })) : [];
    
    return {
      ...data,
      has_video: Boolean(data.video_url),
      has_products: data.products && data.products.length > 0,
      comments: commentsWithLikes,
      comments_count: commentsWithLikes.length,
      author: authorData || null
    };
  };
  
  return useQuery({
    queryKey: ['advice', id, profile?.id, profile?.role],
    queryFn: fetchAdviceArticle,
    enabled: !!id
  });
};
