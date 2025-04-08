import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { AdviceArticle } from '@/types/advice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const ConseilDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // État pour vérifier si le composant est monté

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['conseil', id],
    queryFn: () => supabaseDirect.getById('advice_articles', id as string, `
      *,
      author:profiles(*),
      images:advice_images(*),
      products:advice_products(*),
      comments:advice_comments(
        *,
        user:profiles(*)
      )
    `).then(res => res.data as AdviceArticle),
    enabled: !!id
  });

  useEffect(() => {
    setIsMounted(true); // Marquer le composant comme monté
    return () => setIsMounted(false); // Nettoyer lors du démontage
  }, []);

  useEffect(() => {
    if (article && article.comments) {
      setComments(article.comments);
    }
  }, [article]);

  const fetchComments = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabaseDirect.select('advice_comments', `
        *,
        user:profiles(*)
      `, `article_id=eq.${id}`);
      
      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  
  const postComment = async (parentCommentId: string | null = null) => {
    if (!user) {
      toast({
        title: "Vous devez être connecté",
        description: "Connectez-vous pour poster un commentaire",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('advice_comments' as any)
        .insert({
          content: newComment,
          article_id: id,
          user_id: user.id,
          parent_comment_id: parentCommentId
        })
        .select(`
          *,
          user:profiles(*)
        `);

      if (error) throw error;

      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la publication du commentaire",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle product click tracking
  const handleProductClick = async (productId: string, externalUrl: string) => {
    try {
      // Track the click
      await supabaseDirect.incrementProductClick(productId);
      
      // Open the external URL in a new tab
      window.open(externalUrl, '_blank');
    } catch (error) {
      console.error("Error tracking product click:", error);
    }
  };

  // Handle like/unlike for comments
  const toggleCommentLike = async (commentId: string, currentlyLiked: boolean) => {
    if (!user) {
      toast({
        title: "Vous devez être connecté",
        description: "Connectez-vous pour liker un commentaire",
        variant: "destructive"
      });
      return;
    }

    try {
      if (currentlyLiked) {
        // Remove like
        await supabase
          .from('advice_comment_likes' as any)
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
      } else {
        // Add like
        await supabase
          .from('advice_comment_likes' as any)
          .insert({
            user_id: user.id,
            comment_id: commentId
          });
      }

      // Update the likes count
      await supabaseDirect.updateCommentLikesCount(commentId);
      
      // Refresh the comments
      await fetchComments();
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  if (isLoading) return <p>Chargement...</p>;
  if (error || !article) return <p>Erreur: {error?.message || "Article non trouvé"}</p>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <div className="mb-4">
        <p className="text-gray-600">Publié le {dayjs(article.published_at).format('D MMMM YYYY')} par {article.author?.full_name}</p>
      </div>
      
      {article.images && article.images.length > 0 && (
        <img src={article.images[0].url} alt={article.title} className="w-full rounded-md mb-4" />
      )}
      
      <div className="mb-6" dangerouslySetInnerHTML={{ __html: article.content || '' }} />
      
      {article.products && article.products.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Produits associés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {article.products.map(product => (
              <div key={product.id} className="border rounded-md p-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">{product.description}</p>
                <Button variant="secondary" onClick={() => handleProductClick(product.id, product.external_url)}>
                  Voir le produit
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Commentaires</h2>
        {comments && comments.map(comment => (
          <div key={comment.id} className="mb-4 p-4 rounded-md bg-gray-50">
            <div className="flex items-start gap-2 mb-2">
              <Avatar>
                <AvatarImage src={comment.user?.avatar_url} />
                <AvatarFallback>{comment.user?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{comment.user?.full_name}</div>
                <div className="text-sm text-gray-500">{dayjs(comment.created_at).format('D MMMM YYYY, HH:mm')}</div>
              </div>
            </div>
            <p>{comment.content}</p>
            <div className="flex items-center gap-4 mt-2">
              <Button 
                variant="ghost"
                onClick={() => toggleCommentLike(comment.id, !!comment.isLiked)}
                disabled={!isMounted} // Désactiver si le composant n'est pas encore monté
              >
                <Heart className="h-4 w-4 mr-2" fill={comment.isLiked ? 'currentColor' : 'none'} />
                {comment.likes_count || 0} J'aime
              </Button>
              <Button variant="ghost">
                <MessageSquare className="h-4 w-4 mr-2" />
                Répondre
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Textarea
          placeholder="Ajouter un commentaire..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full mb-2"
        />
        <Button onClick={() => postComment()} disabled={isSubmitting}>
          {isSubmitting ? 'Envoi...' : 'Envoyer le commentaire'}
        </Button>
      </div>
    </div>
  );
};

export default ConseilDetail;
