
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getTypedSupabaseQuery } from '@/utils/supabaseHelpers';
import { JamType } from '@/types/supabase';

import {
  ChevronLeft,
  Star,
  Heart,
  ShoppingCart,
  AlertTriangle,
  Info,
  MessageSquare,
  Share2,
  Printer
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

const JamDetails = () => {
  const { jamId } = useParams<{ jamId: string }>();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  
  const { data: jam, isLoading, error } = useQuery({
    queryKey: ['jam', jamId],
    queryFn: async () => {
      const { data, error } = await getTypedSupabaseQuery('jams')
        .select(`
          *,
          jam_images (*),
          reviews (*, reviewer:reviewer_id(username, avatar_url)),
          profiles:creator_id (user_id, username, full_name, avatar_url)
        `)
        .eq('id', jamId)
        .single();

      if (error) throw error;
      
      if (user) {
        const { data: favorite } = await getTypedSupabaseQuery('favorites')
          .select('id')
          .eq('jam_id', jamId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (favorite) {
          setFavorited(true);
        }
      }
      
      return data;
    },
    enabled: !!jamId,
  });

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
          .eq('jam_id', jamId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('favorites')
          .insert([{ jam_id: jamId, user_id: user.id }]);
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

  const addToCart = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour commander",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Ajouté au panier",
      description: "Cette confiture a été ajoutée à votre panier",
    });
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

  const ratings = jam.reviews?.map((review: any) => review.rating) || [];
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
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/explore">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Retour
          </Link>
        </Button>
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
              <div className="flex items-center mt-2">
                <Link to={`/user/${jam.profiles.user_id}`} className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={jam.profiles.avatar_url} />
                    <AvatarFallback>{jam.profiles.username?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    Par {jam.profiles.full_name || jam.profiles.username}
                  </span>
                </Link>
              </div>
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
              {jam.ingredients.map((ingredient: string, index: number) => (
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
              <div className="mt-1 flex flex-wrap gap-1">
                {jam.allergens.map((allergen: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-amber-100 border-amber-200 text-amber-800">
                    {allergen}
                  </Badge>
                ))}
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
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter au panier
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="recipe">
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="recipe">Recette</TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-1">
              Avis
              {ratings.length > 0 && (
                <Badge variant="secondary" className="ml-1">{ratings.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recipe" className="pt-4">
            {jam.recipe ? (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-serif font-medium mb-4">Recette</h3>
                <div className="whitespace-pre-line">{jam.recipe}</div>
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
                {ratings.length > 0 && (
                  <span className="ml-2 text-muted-foreground">
                    (Note moyenne : {avgRating.toFixed(1)}/5)
                  </span>
                )}
              </h3>
              
              {ratings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">Aucun avis pour l'instant</h3>
                  <p className="text-muted-foreground mt-2">
                    Soyez le premier à donner votre avis sur cette confiture.
                  </p>
                  {user && (
                    <Button className="mt-4 bg-jam-raspberry hover:bg-jam-raspberry/90">
                      Laisser un avis
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {jam.reviews.map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={review.reviewer?.avatar_url} />
                            <AvatarFallback>{review.reviewer?.username?.[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.reviewer?.username}</p>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4"
                                  fill={i < review.rating ? "#FFA000" : "none"}
                                  stroke={i < review.rating ? "#FFA000" : "currentColor"}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      </div>
                      {review.comment && (
                        <div className="mt-3">
                          <p>{review.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
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
