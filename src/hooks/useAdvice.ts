
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdviceArticle, AdviceFilters } from '@/types/advice';

export const useAdvice = (filters?: AdviceFilters) => {
  const [filteredAdvice, setFilteredAdvice] = useState<AdviceArticle[]>([]);

  const fetchAdviceArticles = async () => {
    // Vérifier la requête pour voir s'il y a une erreur
    console.log('Fetching advice articles...');
    
    // Modified query to use author_id instead of trying to join with profiles
    let query = supabase
      .from('advice_articles')
      .select(`
        *
      `)
      .eq('visible', true);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des conseils:', error);
      throw error;
    }
    
    console.log('Advice articles received:', data);
    
    // Après avoir récupéré les données des articles, récupérer les profils des auteurs
    const authorIds = data?.map(article => article.author_id) || [];
    const uniqueAuthorIds = [...new Set(authorIds)];
    
    // Récupérer les profils des auteurs uniquement si nous avons des articles
    let authorProfiles: Record<string, any> = {};
    
    if (uniqueAuthorIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uniqueAuthorIds);
        
      if (!profilesError && profilesData) {
        // Créer un dictionnaire des profils par ID
        authorProfiles = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
      }
    }
    
    // Transformer les données pour ajouter des champs calculés et associer les auteurs
    return data?.map((article: any): AdviceArticle => ({
      ...article,
      has_video: Boolean(article.video_url),
      has_products: false, // Nous mettrons à jour cela plus tard si nécessaire
      comments_count: 0, // Nous mettrons à jour cela plus tard si nécessaire
      author: authorProfiles[article.author_id] || null
    })) || [];
  };
  
  const { data: advice, isLoading, error, refetch } = useQuery({
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

export const useAdviceArticle = (articleId: string) => {
  const fetchAdviceArticle = async () => {
    if (!articleId) throw new Error("Article ID est requis");
    
    // Modification de la requête pour éviter les jointures qui ne fonctionnent pas
    const { data: articleData, error: articleError } = await supabase
      .from('advice_articles')
      .select('*')
      .eq('id', articleId)
      .eq('visible', true)
      .single();
    
    if (articleError) {
      console.error('Erreur lors de la récupération du conseil:', articleError);
      throw articleError;
    }
    
    if (!articleData) {
      throw new Error('Article non trouvé');
    }
    
    // Récupérer l'auteur séparément
    const { data: authorData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', articleData.author_id)
      .single();
    
    // Récupérer les images séparément
    const { data: imagesData } = await supabase
      .from('advice_images')
      .select('*')
      .eq('article_id', articleId);
    
    // Récupérer les produits séparément
    const { data: productsData } = await supabase
      .from('advice_products')
      .select('*')
      .eq('article_id', articleId);
    
    // Compter les commentaires séparément
    const { count: commentsCount } = await supabase
      .from('advice_comments')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);
    
    // Assembler toutes les données
    return {
      ...articleData,
      has_video: Boolean(articleData.video_url),
      has_products: productsData && productsData.length > 0,
      comments_count: commentsCount || 0,
      author: authorData || null,
      images: imagesData || [],
      products: productsData || [],
      comments: [] // Nous ne chargeons pas les commentaires pour l'instant
    } as AdviceArticle;
  };
  
  return useQuery({
    queryKey: ['advice', articleId],
    queryFn: fetchAdviceArticle,
    enabled: Boolean(articleId)
  });
};
