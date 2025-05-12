
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import JamAdminBanner from '@/components/JamAdminBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { safeAccess, safeAccessNested, isNullOrUndefined } from '@/utils/supabaseHelpers';
import { JamType, ProfileType, ReviewType } from '@/types/supabase';
import {
  Star,
  Heart,
  ShoppingCart,
  AlertTriangle,
  Info,
  PlusCircle,
  Edit,
  ArrowLeft,
  Loader2,
  ShieldQuestion,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ImagePlus,
  Trash2
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ReviewWithReviewer = ReviewType & {
  reviewer: ProfileType;
};

// Function to get ingredient name based on type
const getIngredientName = (ingredient: any): string => {
  // Si c'est une chaîne simple
  if (typeof ingredient === 'string' && !ingredient.includes('{')) {
    return ingredient;
  }
  
  // Si c'est un objet
  if (typeof ingredient === 'object' && ingredient !== null) {
    if (ingredient.name) {
      // Handle nested stringified objects
      if (typeof ingredient.name === 'string' && ingredient.name.includes('{')) {
        try {
          const parsedName = JSON.parse(ingredient.name);
          if (parsedName.name) {
            if (typeof parsedName.name === 'string' && parsedName.name.includes('{')) {
              try {
                const deeperParsed = JSON.parse(parsedName.name);
                if (deeperParsed.name) {
                  return deeperParsed.name;
                }
              } catch (e) {
                return parsedName.name;
              }
            }
            return parsedName.name;
          }
        } catch (e) {
          return ingredient.name;
        }
      }
      return ingredient.name;
    }
  }
  
  // Si c'est une chaîne qui contient un objet JSON
  if (typeof ingredient === 'string' && ingredient.includes('{')) {
    try {
      const parsed = JSON.parse(ingredient);
      if (parsed.name) {
        // Handle deeper nesting
        if (typeof parsed.name === 'string' && parsed.name.includes('{')) {
          try {
            const deeperParsed = JSON.parse(parsed.name);
            if (deeperParsed.name) {
              return deeperParsed.name;
            }
          } catch (e) {
            return parsed.name;
          }
        }
        return parsed.name;
      }
    } catch (e) {
      // Si le parsing échoue, retourner la chaîne originale
    }
  }
  
  // Fallback
  return String(ingredient);
};

const JamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canManage } = useUserRole();
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isJudgeRegistering, setIsJudgeRegistering] = useState(false);
  const [formData, setFormData] = useState({
    motivation: "",
    referenceJamId: ""
  });
  
  const { data: jam, isLoading, error } = useQuery({
    queryKey: ['jam', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      
      // Modification de la requête pour ne pas utiliser jam_images
      const { data, error } = await supabase
        .from('jams')
        .select(`
          *,
          profiles:creator_id (*),
          reviews (*, reviewer:reviewer_id (*))
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('No jam found');
      
      const avgRating = calculateAverageRating(data.reviews);
      
      return {
        ...data,
        avgRating
      };
    }
  });
  
  const { data: userFavorites } = useQuery({
    queryKey: ['userFavorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select('jam_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(fav => fav.jam_id);
    },
    enabled: !!user
  });

  const isFavorite = userFavorites?.includes(jam?.id || '');

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !jam) {
        throw new Error('Vous devez être connecté pour ajouter des favoris');
      }

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('jam_id', jam.id);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, jam_id: jam.id }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites', user?.id] });
      toast({
        title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isFavorite
          ? "Cette confiture a été retirée de vos favoris."
          : "Cette confiture a été ajoutée à vos favoris.",
      });
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout/suppression des favoris.",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter des favoris.",
        variant: "default",
      });
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const calculateAverageRating = (reviews: ReviewType[] | undefined) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Chargement...</h1>
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    );
  }

  if (error || !jam) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Erreur</h1>
        <p>Impossible de charger les détails de la confiture.</p>
      </div>
    );
  }

  return (
    <>
      {canManage && <JamAdminBanner jamId={id!} />}
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <Button asChild variant="ghost">
            <Link to="/explore">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'exploration
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleToggleFavorite} 
              disabled={toggleFavoriteMutation.isPending || !user}
            >
              {isFavorite ? <Heart className="h-5 w-5 fill-red-500 text-red-500" /> : <Heart className="h-5 w-5" />}
            </Button>
            <Button variant="default">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Acheter
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{jam.name}</CardTitle>
            <CardDescription>{jam.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={jam.cover_image_url || '/placeholder.svg'}
                alt={jam.name}
                className="w-full h-64 object-cover rounded-md"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{jam.avgRating?.toFixed(1) || 'Pas d\'avis'} ({jam.reviews?.length} avis)</span>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={jam.profiles?.avatar_url || undefined} />
                  <AvatarFallback>{jam.profiles?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>Par {jam.profiles?.username}</span>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Ingrédients</h3>
                <ul>
                  {jam.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-sm">{getIngredientName(ingredient)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold">{jam.price_credits}</span>
              <span className="ml-1 text-muted-foreground">crédits</span>
            </div>
            <Button asChild>
              <Link to={`/seller/${jam.creator_id}`}>
                Voir la boutique
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Avis</h2>
          {jam.reviews && jam.reviews.length > 0 ? (
            <div className="space-y-4">
              {jam.reviews.map((review: ReviewWithReviewer) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                        <AvatarFallback>{review.reviewer?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{review.reviewer?.username}</CardTitle>
                        <CardDescription>
                          {format(new Date(review.created_at), 'PPP', { locale: fr })}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500" />
                      ))}
                    </div>
                    <p>{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Info className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Aucun avis pour le moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default JamDetails;
