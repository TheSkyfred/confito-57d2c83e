
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdviceArticle } from '@/hooks/useAdvice';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdviceComment } from '@/types/advice';
import { 
  ArrowLeft, 
  Calendar, 
  ThumbsUp, 
  MessageCircle,
  ExternalLink,
  Pencil,
  Trash,
  Send
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileDisplay } from '@/components/ProfileDisplay';

const ConseilDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const canEdit = user && (isAdmin || isModerator);
  
  const [newComment, setNewComment] = useState('');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  
  const { data: article, isLoading, refetch } = useAdviceArticle(id || '');
  
  const typeLabels: Record<string, string> = {
    'fruits': 'Fruits',
    'cuisson': 'Cuisson',
    'recette': 'Recette',
    'conditionnement': 'Conditionnement',
    'sterilisation': 'Stérilisation',
    'materiel': 'Matériel'
  };
  
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('advice_comments')
        .insert({
          article_id: id,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select('*');
        
      if (error) throw error;
      
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été publié avec succès"
      });
      
      setNewComment('');
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier votre commentaire",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent[parentId]?.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('advice_comments')
        .insert({
          article_id: id,
          user_id: user.id,
          content: replyContent[parentId].trim(),
          parent_comment_id: parentId
        })
        .select('*');
        
      if (error) throw error;
      
      toast({
        title: "Réponse ajoutée",
        description: "Votre réponse a été publiée avec succès"
      });
      
      // Réinitialiser le champ de réponse et fermer le formulaire
      setReplyContent(prev => ({ ...prev, [parentId]: '' }));
      toggleReplyForm(parentId);
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier votre réponse",
        variant: "destructive"
      });
    }
  };
  
  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) return;
    
    try {
      if (isLiked) {
        // Supprimer le like
        const { error } = await supabase
          .from('advice_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Ajouter un like
        const { error } = await supabase
          .from('advice_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
          
        if (error) throw error;
      }
      
      // Mettre à jour le compteur de likes du commentaire
      const { error } = await supabase.rpc('update_comment_likes_count', {
        p_comment_id: commentId
      });
      
      if (error) throw error;
      
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de la gestion du like:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('advice_comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      
      toast({
        title: "Commentaire supprimé",
        description: "Le commentaire a été supprimé avec succès"
      });
      
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive"
      });
    }
  };
  
  const toggleReplyForm = (commentId: string) => {
    if (article && article.comments) {
      const updatedComments = article.comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, is_replying: !comment.is_replying };
        }
        return comment;
      });
      
      refetch();
    }
  };
  
  const handleProductClick = async (productId: string) => {
    if (!id || !productId) return;
    
    try {
      // Incrémenter le compteur de clics
      const { error } = await supabase.rpc('increment_product_clicks', {
        p_product_id: productId
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors du suivi du clic:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-5/6" />
        </div>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-xl font-medium mb-2">Article introuvable</h2>
        <p className="text-muted-foreground mb-4">Ce conseil n'existe pas ou a été supprimé</p>
        <Button asChild>
          <Link to="/conseils">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux conseils
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/conseils')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux conseils
        </Button>
        
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/conseils/edit/${article.id}`}>
                <Pencil className="h-4 w-4 mr-1" />
                Modifier
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le conseil sera définitivement supprimé.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('advice_articles')
                          .delete()
                          .eq('id', article.id);
                          
                        if (error) throw error;
                        
                        toast({
                          title: "Conseil supprimé",
                          description: "Le conseil a été supprimé avec succès"
                        });
                        
                        navigate('/conseils');
                      } catch (error: any) {
                        toast({
                          title: "Erreur",
                          description: "Impossible de supprimer le conseil",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge>{typeLabels[article.type] || article.type}</Badge>
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(article.published_at), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
          
          <h1 className="text-4xl font-serif font-bold mb-4">{article.title}</h1>
          
          {article.author && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Par</span>
              <ProfileDisplay profile={article.author} showName={true} />
            </div>
          )}
        </header>
        
        {article.cover_image_url && (
          <figure className="mb-8">
            <img 
              src={article.cover_image_url} 
              alt={article.title} 
              className="w-full rounded-lg object-cover max-h-[500px]"
            />
          </figure>
        )}
        
        {article.video_url && (
          <div className="aspect-w-16 aspect-h-9 mb-8">
            <iframe
              src={article.video_url.replace('watch?v=', 'embed/')}
              title={article.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-[400px] rounded-lg"
            ></iframe>
          </div>
        )}
        
        <div className="prose max-w-none mb-8 whitespace-pre-line">
          {article.content}
        </div>
        
        {article.images && article.images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold mb-4">Galerie</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {article.images.map(image => (
                <figure key={image.id} className="relative">
                  <img 
                    src={image.image_url} 
                    alt={image.description || article.title} 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {image.description && (
                    <figcaption className="text-xs text-center mt-1 text-muted-foreground">
                      {image.description}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}
        
        {article.products && article.products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold mb-4">Produits recommandés</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.products.map(product => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium">{product.name}</h3>
                        {product.is_sponsored && (
                          <Badge variant="outline" className="text-xs">Sponsorisé</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      {product.external_url && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full" 
                          asChild
                          onClick={() => handleProductClick(product.id)}
                        >
                          <a href={product.external_url} target="_blank" rel="noopener noreferrer">
                            Voir le produit
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Separator className="my-8" />
        
        <section className="mt-8">
          <h2 className="text-2xl font-serif font-bold mb-4">Commentaires</h2>
          
          {user ? (
            <div className="mb-8">
              <Textarea 
                placeholder="Ajouter un commentaire..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="mb-2"
              />
              <div className="flex justify-end">
                <Button disabled={!newComment.trim()} onClick={handleSubmitComment}>
                  <Send className="h-4 w-4 mr-2" />
                  Publier
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-lg text-center mb-8">
              <p className="mb-2">Connectez-vous pour participer à la discussion</p>
              <Button asChild>
                <Link to="/auth">Se connecter ou s'inscrire</Link>
              </Button>
            </div>
          )}
          
          {article.comments && article.comments.length > 0 ? (
            <div className="space-y-6">
              {article.comments.map(comment => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    {comment.user && (
                      <div className="flex items-center gap-2">
                        <ProfileDisplay profile={comment.user} showName={true} />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {user && (user.id === comment.user_id || isAdmin || isModerator) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le commentaire ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  
                  <p className="my-2">{comment.content}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-1 h-8 px-2"
                        onClick={() => user && handleLikeComment(comment.id, comment.is_liked_by_user || false)}
                        disabled={!user}
                      >
                        <ThumbsUp 
                          className={`h-4 w-4 ${comment.is_liked_by_user ? 'fill-current' : ''}`} 
                        />
                        <span>{comment.likes_count || 0}</span>
                      </Button>
                      
                      {user && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="flex items-center gap-1 h-8 px-2"
                          onClick={() => toggleReplyForm(comment.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Répondre
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {comment.is_replying && user && (
                    <div className="mt-4 pl-4 border-l">
                      <Textarea 
                        placeholder="Écrire une réponse..." 
                        value={replyContent[comment.id] || ''}
                        onChange={e => setReplyContent(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        className="mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleReplyForm(comment.id)}
                        >
                          Annuler
                        </Button>
                        <Button 
                          size="sm"
                          disabled={!replyContent[comment.id]?.trim()}
                          onClick={() => handleSubmitReply(comment.id)}
                        >
                          Répondre
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l space-y-4">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="border-t pt-4">
                          <div className="flex items-center justify-between">
                            {reply.user && (
                              <div className="flex items-center gap-2">
                                <ProfileDisplay profile={reply.user} showName={true} />
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(reply.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              {user && (user.id === reply.user_id || isAdmin || isModerator) && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer la réponse ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Cette action est irréversible.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteComment(reply.id)}>
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                          
                          <p className="my-2">{reply.content}</p>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex items-center gap-1 h-8 px-2"
                            onClick={() => user && handleLikeComment(reply.id, reply.is_liked_by_user || false)}
                            disabled={!user}
                          >
                            <ThumbsUp 
                              className={`h-4 w-4 ${reply.is_liked_by_user ? 'fill-current' : ''}`} 
                            />
                            <span>{reply.likes_count || 0}</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Soyez le premier à commenter ce conseil
              </p>
            </div>
          )}
        </section>
      </article>
    </div>
  );
};

export default ConseilDetail;
