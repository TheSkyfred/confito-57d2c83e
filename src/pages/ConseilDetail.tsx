import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAdviceArticle } from '@/hooks/useAdvice';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdviceArticle, AdviceProduct } from '@/types/advice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import AdviceAdminActions from '@/components/advice/AdviceAdminActions';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { trackProductClick } from '@/utils/supabaseAdapter';

dayjs.locale('fr');

const ConseilDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false); 

  const { data: article, isLoading, error, refetch } = useAdviceArticle(id as string);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (article && article.comments) {
      setComments(article.comments);
    }
  }, [article]);

  const fetchComments = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('advice_comments')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('article_id', id);
      
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
        .from('advice_comments')
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
  
  const handleProductClick = async (productId: string, externalUrl: string) => {
    try {
      await trackProductClick(productId, id as string);
      window.open(externalUrl, '_blank');
    } catch (error) {
      console.error("Error tracking product click:", error);
    }
  };

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
        await supabase
          .from('advice_comment_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
      } else {
        await supabase
          .from('advice_comment_likes')
          .insert({
            user_id: user.id,
            comment_id: commentId
          });
      }

      const { count } = await supabase
        .from('advice_comment_likes')
        .select('*', { count: 'exact' })
        .eq('comment_id', commentId);
      
      await supabase
        .from('advice_comments')
        .update({ likes_count: count || 0 })
        .eq('id', commentId);
        
      await fetchComments();
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  const renderProduct = (product: AdviceProduct) => (
    <div 
      key={product.id} 
      className={`border rounded-md p-4 ${product.is_sponsored ? 'bg-amber-50 border-amber-200' : ''}`}
    >
      {product.image_url && (
        <div className="aspect-video w-full mb-3 rounded overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{product.name}</h3>
        {product.is_sponsored && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            Sponsorisé
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
      {product.promo_code && (
        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-center">
          <p className="text-sm font-semibold text-blue-700">
            Code promo: {product.promo_code}
          </p>
        </div>
      )}
      <Button 
        variant="secondary" 
        onClick={() => handleProductClick(product.id, product.external_url || '')}
        disabled={!product.external_url}
      >
        Voir le produit
      </Button>
    </div>
  );

  if (isLoading) return <p className="container mx-auto py-8">Chargement...</p>;
  if (error || !article) return <p className="container mx-auto py-8">Erreur: {error?.message || "Article non trouvé"}</p>;

  return (
    <div className="container mx-auto py-8">
      {isModerator && (
        <div className="mb-6">
          <AdviceAdminActions 
            adviceId={article.id}
            isVisible={article.visible}
            onVisibilityChange={refetch}
          />
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <div className="mb-4">
        <p className="text-gray-600">Publié le {dayjs(article.published_at).format('D MMMM YYYY')} par {article.author?.full_name}</p>
      </div>
      
      {article.cover_image_url && (
        <div className="mb-6">
          <img src={article.cover_image_url} alt={article.title} className="w-full rounded-md mb-4" />
        </div>
      )}
      
      <div className="mb-6" dangerouslySetInnerHTML={{ __html: article.content || '' }} />
      
      {article.products && article.products.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Matériel recommandé</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {article.products.map(product => (
              renderProduct(product)
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Commentaires</h2>
        {comments && comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="mb-4 p-4 rounded-md bg-gray-50">
              <div className="flex items-start gap-2 mb-2">
                <Avatar>
                  <AvatarImage src={comment.user?.avatar_url} />
                  <AvatarFallback>{comment.user?.full_name?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{comment.user?.full_name || "Utilisateur"}</div>
                  <div className="text-sm text-gray-500">{dayjs(comment.created_at).format('D MMMM YYYY, HH:mm')}</div>
                </div>
              </div>
              <p>{comment.content}</p>
              <div className="flex items-center gap-4 mt-2">
                <Button 
                  variant="ghost"
                  onClick={() => toggleCommentLike(comment.id, !!comment.isLiked)}
                  disabled={!isMounted}
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
          ))
        ) : (
          <p className="text-muted-foreground">Aucun commentaire pour le moment.</p>
        )}
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
