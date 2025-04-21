
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
      if (filters.type && filters.type.length > 0) {
        result = result.filter(item => filters.type!.includes(item.type));
      }
      
      if (filters.hasVideo) {
        result = result.filter(item => item.has_video);
      }
      
      if (filters.hasProducts) {
        result = result.filter(item => item.has_products);
      }
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        result = result.filter(item => 
          item.title.toLowerCase().includes(searchLower) || 
          (item.content && item.content.toLowerCase().includes(searchLower)) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }
      
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'date':
            result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
            break;
          case 'popularity':
            result.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
            break;
          case 'clicks':
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

export const useAdviceArticle = (id: string) => {
  const { profile } = useAuth();
  
  const fetchAdviceArticle = async () => {
    // Vérifier que l'ID est valide
    if (!id || id.trim() === '') {
      throw new Error('ID de conseil invalide');
    }
    
    console.log('Fetching single advice article with ID:', id);
    
    let query = supabase
      .from('advice_articles')
      .select(`*`)
      .eq('id', id);
    
    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      query = query.or(`status.eq.approved,author_id.eq.${profile?.id || ''}`);
    }
    
    const { data: articleData, error: articleError } = await query.single();
    
    if (articleError) {
      console.error('Error fetching advice article:', articleError);
      throw articleError;
    }
    
    if (!articleData) {
      throw new Error('Article not found');
    }
    
    const { data: authorData, error: authorError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', articleData.author_id)
      .single();
      
    if (authorError) {
      console.error('Error fetching author:', authorError);
    }
    
    // Fetch comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('advice_comments')
      .select(`
        *
      `)
      .eq('article_id', id);
      
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    // Process comments and add user data
    let commentsWithUsers = [];
    if (commentsData && commentsData.length > 0) {
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      if (usersError) {
        console.error('Error fetching comment users:', usersError);
      }
      
      const usersMap = {};
      if (usersData) {
        usersData.forEach(user => {
          usersMap[user.id] = user;
        });
      }
      
      commentsWithUsers = commentsData.map(comment => ({
        ...comment,
        user: usersMap[comment.user_id] || null,
        isLiked: false
      }));
      
      // Check if current user has liked any comments
      if (profile) {
        const commentIds = commentsData.map(comment => comment.id);
        
        const { data: likesData, error: likesError } = await supabase
          .from('advice_comment_likes')
          .select('comment_id')
          .eq('user_id', profile.id)
          .in('comment_id', commentIds);
          
        if (!likesError && likesData) {
          const likedCommentIds = new Set(likesData.map(like => like.comment_id));
          
          commentsWithUsers = commentsWithUsers.map(comment => ({
            ...comment,
            isLiked: likedCommentIds.has(comment.id)
          }));
        }
      }
    }
    
    // Fetch associated products
    const { data: productsData, error: productsError } = await supabase
      .from('advice_products')
      .select('*')
      .eq('article_id', id);
      
    if (productsError) {
      console.error('Error fetching advice products:', productsError);
    }
    
    // Build complete result
    const result = {
      ...articleData,
      has_video: Boolean(articleData.video_url),
      has_products: productsData && productsData.length > 0,
      comments: commentsWithUsers || [],
      comments_count: commentsWithUsers.length,
      author: authorData || null,
      products: productsData || []
    };
    
    return result;
  };
  
  return useQuery({
    queryKey: ['advice', id, profile?.id, profile?.role],
    queryFn: fetchAdviceArticle,
    enabled: !!id && id.trim() !== '' // Ne pas exécuter la requête si l'ID est vide
  });
};
