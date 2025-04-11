import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect, trackProductClick } from '@/utils/supabaseAdapter';
import { JamType, ReviewType, ProfileType } from '@/types/supabase';
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Star,
  StarOff,
  ShoppingCart,
  Heart,
  HeartOff,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  AlertCircle,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion
} from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';

const JamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { isAdmin, isModerator, canManage } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cartStore = useCartStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const { data: jam, isLoading, isError, error } = useQuery({
    queryKey: ['jam', id],
    queryFn: async () => {
      if (!id) throw new Error("Missing jam ID");
      
      const { data, error } = await supabaseDirect.getById<JamType>('jams', id, `
        *,
        profiles:creator_id(*),
        jam_images(*)
      `);
      
      if (error) throw error;
      
      return data;
    },
  });

  const { data: reviews, isLoading: isLoadingReviews, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      if (!id) throw new Error("Missing jam ID");
      
      const { data, error } = await supabaseDirect.select<ReviewType>(
        'jam_reviews', 
        `*, reviewer:reviewer_id(*)`,
        { jam_id: id }
      );
      
      if (error) throw error;
      
      return data;
    },
  });

  const { mutate: addReview } = useMutation({
    mutationFn: async () => {
      if (!id || !user) throw new Error("Missing jam ID or user");
      
      setIsSubmittingReview(true);
      
      const { error } = await supabase
        .from('jam_reviews')
        .insert({
          jam_id: id,
          reviewer_id: user.id,
          rating: rating,
          comment: reviewText,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setIsSubmittingReview(false);
      setReviewText('');
      setRating(0);
      refetchReviews();
      toast({
        title: 'Avis ajouté',
        description: 'Votre avis a été ajouté avec succès.',
      });
    },
    onError: (error: any) => {
      setIsSubmittingReview(false);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'ajout de votre avis.',
        variant: 'destructive',
      });
    },
  });

  const { mutate: deleteReview } = useMutation({
    mutationFn: async () => {
      if (!reviewToDelete) throw new Error("Missing review ID");
      
      setIsDeletingReview(true);
      
      const { error } = await supabase
        .from('jam_reviews')
        .delete()
        .eq('id', reviewToDelete);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setIsDeletingReview(false);
      setReviewToDelete(null);
      refetchReviews();
      toast({
        title: 'Avis supprimé',
        description: 'Votre avis a été supprimé avec succès.',
      });
    },
    onError: (error: any) => {
      setIsDeletingReview(false);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la suppression de votre avis.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    const checkFavorite = async () => {
      if (!id || !user) return;
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('jam_id', id)
        .single();
      
      setIsFavorite(!!data);
      
      if (error) {
        console.error('Error checking favorite:', error);
      }
    };
    
    checkFavorite();
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!id || !user) return;
    
    const isCurrentlyFavorite = isFavorite;
    setIsFavorite(!isCurrentlyFavorite);
    
    const { error } = isCurrentlyFavorite
      ? await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('jam_id', id)
      : await supabase
          .from('user_favorites')
          .insert([{ user_id: user.id, jam_id: id }]);
    
    if (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorite(isCurrentlyFavorite);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour de vos favoris.',
        variant: 'destructive',
      });
    }
  };

  const handleAddToCart = async () => {
    if (!jam) return;
    
    setIsAddingToCart(true);
    
    try {
      cartStore.addItem(jam);
      toast({
        title: 'Confiture ajoutée',
        description: `${jam.name} a été ajouté à votre panier.`,
      });
      
      // Track product click
      trackProductClick(jam.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'ajout au panier.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!jam) return;
    
    setIsCopying(true);
    navigator.clipboard.writeText(`${window.location.origin}/jam/${jam.id}`)
      .then(() => {
        toast({
          title: 'Lien copié',
          description: 'Le lien de cette confiture a été copié dans le presse-papier.',
        });
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la copie du lien.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setTimeout(() => setIsCopying(false), 2000);
      });
  };

  if (isLoading) {
    return <div className="container py-10">Chargement de la confiture...</div>;
  }

  if (isError) {
    return <div className="container py-10">Erreur: {error.message}</div>;
  }

  if (!jam) {
    return <div className="container py-10">Confiture non trouvée.</div>;
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Section */}
        <div>
          {jam.jam_images && jam.jam_images.length > 0 ? (
            <img
              src={jam.jam_images[0].url}
              alt={jam.name}
              className="w-full h-auto rounded-lg shadow-md"
            />
          ) : (
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              Aucune image disponible
            </div>
          )}
        </div>

        {/* Details Section */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{jam.name}</h1>
          <div className="flex items-center justify-between mb-2">
            <ProfileDisplay profile={jam.profiles} showName />
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/jam/edit/${jam.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. La confiture et toutes les données associées seront définitivement supprimées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="text-gray-600 mb-4">{jam.description}</p>

          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isAddingToCart ? 'Ajout en cours...' : 'Ajouter au panier'}
            </Button>
            <Button
              variant="outline"
              onClick={toggleFavorite}
            >
              {isFavorite ? (
                <>
                  <HeartOff className="mr-2 h-4 w-4" />
                  Retirer des favoris
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Ajouter aux favoris
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="secondary"
              onClick={handleCopyToClipboard}
              disabled={isCopying}
            >
              {isCopying ? (
                <>
                  <Copy className="mr-2 h-4 w-4 animate-pulse" />
                  Copié !
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Copier le lien
                </>
              )}
            </Button>
            <a
              href={`/jam/${jam.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ouvrir dans un nouvel onglet
            </a>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger>Détails du produit</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5">
                  <li><strong>Ingrédients:</strong> {jam.ingredients?.join(', ') || 'Non spécifiés'}</li>
                  <li><strong>Poids:</strong> {jam.weight_grams}g</li>
                  <li><strong>Prix:</strong> {jam.price_credits} crédits</li>
                  <li><strong>Quantité disponible:</strong> {jam.available_quantity}</li>
                  {jam.allergens && jam.allergens.length > 0 && (
                    <li><strong>Allergènes:</strong> {jam.allergens.join(', ')}</li>
                  )}
                  {jam.production_date && (
                    <li><strong>Date de production:</strong> {new Date(jam.production_date).toLocaleDateString()}</li>
                  )}
                  {jam.shelf_life_months && (
                    <li><strong>Durée de conservation:</strong> {jam.shelf_life_months} mois</li>
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
            {jam.recipe && (
              <AccordionItem value="recipe">
                <AccordionTrigger>Recette</AccordionTrigger>
                <AccordionContent>
                  <p>{jam.recipe}</p>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Avis</h2>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-4">
                    <ProfileDisplay profile={review.reviewer} showName size="sm" />
                    <div className="flex items-center">
                      {Array.from({ length: review.rating }, (_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500" />
                      ))}
                      {Array.from({ length: 5 - review.rating }, (_, i) => (
                        <StarOff key={i} className="h-4 w-4 text-gray-300" />
                      ))}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user?.id === review.reviewer_id && (
                        <DropdownMenuItem onClick={() => setReviewToDelete(review.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                      {canManage && (
                        <DropdownMenuItem className="text-red-600">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" className="w-full justify-start">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Signaler
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Signaler cet avis aux administrateurs ?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction>Signaler</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                  <p>{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">Aucun avis pour le moment.</div>
        )}

        {/* Add Review Form */}
        {user && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">Ajouter un avis</h3>
            <div className="flex items-center mb-4">
              <Label htmlFor="rating" className="mr-2">Note:</Label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant="ghost"
                    className={`text-2xl ${rating >= value ? 'text-yellow-500' : 'text-gray-300'}`}
                    onClick={() => setRating(value)}
                  >
                    <Star className="h-6 w-6" />
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review">Votre avis:</Label>
              <Textarea
                id="review"
                placeholder="Votre avis sur cette confiture..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>
            <Button
              onClick={addReview}
              disabled={isSubmittingReview}
              className="mt-4"
            >
              {isSubmittingReview ? 'Envoi en cours...' : 'Envoyer l\'avis'}
            </Button>
          </div>
        )}

        {!user && (
          <div className="mt-8 text-center">
            <Link to="/auth" className="text-blue-500 hover:underline">
              Connectez-vous
            </Link>{' '}
            pour laisser un avis.
          </div>
        )}
      </div>

      <AlertDialog open={reviewToDelete !== null} onOpenChange={() => setReviewToDelete(null)}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'avis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteReview()}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JamDetails;
