import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  getTypedSupabaseQuery, 
  safeAccess, 
  getProfileInitials,
  isNullOrUndefined,
  safeAccessNested
} from '@/utils/supabaseHelpers';
import { JamType, ProfileType, ReviewType, DetailedReviewType } from '@/types/supabase';
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { useCartStore } from '@/stores/useCartStore';
import {
  getProfileUsername,
  getProfileAvatarUrl,
  isProfileType
} from '@/utils/profileTypeGuards';

import {
  ChevronLeft,
  Star,
  Heart,
  ShoppingCart,
  AlertTriangle,
  Info,
  MessageSquare,
  Share2,
  Printer,
  Clock,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { RecipeStep } from '@/components/jam-editor/RecipeForm';
import JamReviewForm from '@/components/jam-review/JamReviewForm';
import JamReviewsList from '@/components/jam-review/JamReviewsList';
import AllergensBadges from '@/components/AllergensBadges';

const JamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const { addItem } = useCartStore();
  
  const { data: jam, isLoading, error, refetch } = useQuery({
    queryKey: ['jam', id],
    queryFn: async () => {
      const { data, error } = await getTypedSupabaseQuery('jams')
        .select(`
          *,
          jam_images (*),
          reviews (*, reviewer:reviewer_id(username, avatar_url)),
          profiles:creator_id (id, username, full_name, avatar_url, role)
        `)
        .eq('id', id as string)
        .single();

      if (error) throw error;
      
      if (user) {
        const { data: favorite } = await getTypedSupabaseQuery('favorites')
          .select('id')
          .eq('jam_id', id as string)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (favorite) {
          setFavorited(true);
        }
      }
      
      return data as JamType;
    },
    enabled: !!id,
  });

  const { data: detailedReviews } = useQuery({
    queryKey: ['jam-detailed-reviews', id],
    queryFn: async () => {
      const { data, error } = await supabaseDirect.select('jam_reviews', `
        *,
        reviewer:reviewer_id (id, username, avatar_url, full_name)
      `);

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const userHasReviewed = () => {
    if (!user || !detailedReviews) return false;
    return detailedReviews.some((review: any) => review.reviewer_id === user.id);
  };

  const isCreator = user && jam && user.id === jam.creator_id;
  
  const isModerator = user && jam?.profiles?.role && ['admin', 'moderator'].includes(jam.profiles.role);

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter aux favoris",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (favorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('jam_id', id as string)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('favorites')
          .insert([{ jam_id: id as string, user_id: user.id }]);
      }
      
      setFavorited(!favorited);
      toast({
        title: favorited ? "Retiré des favoris" : "Ajouté aux favoris",
        description: favorited ? "Cette confiture a été retirée de vos favoris" : "Cette confiture a été ajoutée à vos favoris",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour commander",
        variant: "destructive"
      });
      return;
    }
    
    if (!jam) return;
    
    try {
      await addItem(jam);
      toast({
        title: "Ajouté au panier",
        description: "Cette confiture a été ajoutée à votre panier",
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter cet article au panier",
        variant: "destructive"
      });
    }
  };

  const approveJam = async () => {
    if (!user || !jam) return;
    
    try {
      const { error } = await supabaseDirect.update('jams', 
        { status: 'approved' },
        { id: jam.id }
      );
        
      if (error) throw error;
      
      toast({
        title: "Confiture approuvée",
        description: "La confiture est maintenant visible pour tous les utilisateurs",
      });
      
      refetch();
    } catch (error: any) {
      console.error('Error approving jam:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver cette confiture",
        variant: "destructive"
      });
    }
  };

  const rejectJam = async () => {
    if (!user || !jam) return;
    
    try {
      const { error } = await supabaseDirect.update('jams', 
        { 
          status: 'rejected',
          rejection_reason: "Cette confiture ne répond pas à nos critères de qualité."
        },
        { id: jam.id }
      );
        
      if (error) throw error;
      
      toast({
        title: "Confiture rejetée",
        description: "La confiture a été rejetée",
      });
      
      refetch();
    } catch (error: any) {
      console.error('Error rejecting jam:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter cette confiture",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !jam) {
    return (
      <div className="container py-8">
        <div className="text-center py-10">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-2xl font-bold">Confiture introuvable</h2>
          <p className="mt-2 text-muted-foreground">
            Cette confiture n'existe pas ou a été retirée.
          </p>
          <Button asChild className="mt-6">
            <Link to="/explore">Découvrir d'autres confitures</Link>
          </Button>
        </div>
      </div>
    );
  }

  const creatorProfile = jam.profiles || {};
  const username = safeAccess(creatorProfile as ProfileType, 'username') || 'Utilisateur';
  const fullName = safeAccess(creatorProfile as ProfileType, 'full_name') || username;
  const avatarUrl = safeAccess(creatorProfile as ProfileType, 'avatar_url');
  const profileInitial = getProfileInitials(username);
  const creatorId = safeAccess(creatorProfile as ProfileType, 'id');

  const ratings = (jam.reviews || []).map((review: ReviewType) => review.rating);
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
    : 0;

  const primaryImage = jam.jam_images.find((img: any) => img.is_primary)?.url || 
                      (jam.jam_images.length > 0 ? jam.jam_images[0].url : null);
  const secondaryImages = jam.jam_images.filter((img: any) => 
    img.url !== primaryImage
  );

  return (
    <div className="container py-8">
      {jam.status === 'pending' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-medium">Confiture en attente de validation</h3>
          </div>
          <p className="mt-1 text-sm text-yellow-600">
            Cette confiture est visible uniquement par son créateur et les modérateurs jusqu'à son approbation.
          </p>
          
          {isModerator && (
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={approveJam}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approuver
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={rejectJam}>
                <XCircle className="mr-2 h-4 w-4" />
                Rejeter
              </Button>
            </div>
          )}
        </div>
      )}
      
      {jam.status === 'rejected' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            <h3 className="font-medium">Confiture rejetée</h3>
          </div>
          <p className="mt-1 text-sm text-red-600">
            {jam.rejection_reason || "Cette confiture a été rejetée par un modérateur."}
          </p>
          
          {isModerator && (
            <Button variant="outline" size="sm" className="mt-2" onClick={approveJam}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approuver malgré tout
            </Button>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/explore">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Retour
          </Link>
        </Button>
        
        {isCreator && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/jam/edit/${jam.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier ma confiture
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {primaryImage && (
                <CarouselItem key="primary">
                  <div className="flex aspect-square items-center justify-center p-1">
                    <img 
                      src={primaryImage} 
                      alt={jam.name} 
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                </CarouselItem>
              )}
              
              {secondaryImages.map((image: any) => (
                <CarouselItem key={image.id}>
                  <div className="flex aspect-square items-center justify-center p-1">
                    <img 
                      src={image.url} 
                      alt={jam.name} 
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        <div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-3xl font-bold">{jam.name}</h1>
              {creatorId && (
                <div className="flex items-center mt-2">
                  <Link to={`/profile/${creatorId}`} className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback>{profileInitial}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      Par {fullName}
                    </span>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleFavorite}
                className={favorited ? "text-jam-raspberry" : ""}
              >
                <Heart className="h-5 w-5" fill={favorited ? "currentColor" : "none"} />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-muted-foreground">
              {jam.description}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-2">Ingrédients</h3>
            <div className="flex flex-wrap gap-2">
              {jam.ingredients && jam.ingredients.map((ingredient: string, index: number) => (
                <Badge key={index} variant="outline">{ingredient}</Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm text-muted-foreground">Poids</p>
              <p className="font-medium">{jam.weight_grams} g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teneur en sucre</p>
              <p className="font-medium">
                {jam.sugar_content ? `${jam.sugar_content}%` : 'Non spécifié'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disponibilité</p>
              <p className="font-medium">{jam.available_quantity} pot{jam.available_quantity > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de création</p>
              <p className="font-medium">
                {format(new Date(jam.created_at), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>

          {jam.allergens && jam.allergens.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                <p className="font-medium">Allergènes</p>
              </div>
              <div className="mt-1">
                <AllergensBadges allergens={jam.allergens} />
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">{jam.price_credits}</span>
              <span className="ml-1 text-muted-foreground">crédits</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="default" 
                className="bg-jam-raspberry hover:bg-jam-raspberry/90"
                onClick={addToCart}
                disabled={jam.status !== 'approved'}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter au panier
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="reviews">
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="recipe">Recette</TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-1">
              Avis
              {detailedReviews && detailedReviews.length > 0 && (
                <Badge variant="secondary" className="ml-1">{detailedReviews.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recipe" className="pt-4">
            {jam.recipe ? (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-serif font-medium mb-4">Recette</h3>
                
                {(() => {
                  try {
                    const recipeSteps = JSON.parse(jam.recipe);
                    if (Array.isArray(recipeSteps) && recipeSteps.length > 0) {
                      return (
                        <div className="space-y-6">
                          {recipeSteps.map((step: RecipeStep, i: number) => (
                            <div key={step.id} className="flex">
                              <div className="flex-shrink-0 mr-4">
                                <div className="rounded-full w-8 h-8 bg-jam-raspberry flex items-center justify-center text-white font-bold">
                                  {i + 1}
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-700">{step.description}</p>
                                {step.duration && (
                                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {step.duration}
                                  </p>
                                )}
                                
                                {step.image_url && (
                                  <img 
                                    src={step.image_url} 
                                    alt={`Étape ${i + 1}`} 
                                    className="mt-2 rounded-md max-w-[200px] max-h-[150px] object-cover"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                  } catch (e) {
                    // If JSON parsing fails, treat as regular text
                  }
                  
                  return <div className="whitespace-pre-line">{jam.recipe}</div>;
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Info className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">Pas de recette partagée</h3>
                <p className="text-muted-foreground mt-2">
                  Le créateur n'a pas souhaité partager la recette de cette confiture.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="pt-4">
            <div className="space-y-8">
              <h3 className="text-xl font-serif font-medium mb-4">
                Avis et commentaires
              </h3>
              
              {user && !userHasReviewed() && jam.status === 'approved' && (
                <JamReviewForm jamId={jam.id} onReviewSubmitted={() => refetch()} />
              )}
              
              {detailedReviews && detailedReviews.length > 0 ? (
                <JamReviewsList reviews={detailedReviews as DetailedReviewType[]} />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">Aucun avis pour l'instant</h3>
                  <p className="text-muted-foreground mt-2">
                    Soyez le premier à donner votre avis sur cette confiture.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JamDetails;
