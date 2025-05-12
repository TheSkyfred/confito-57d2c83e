
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Jam } from '@/types/jam';
import {
  Star,
  Heart,
  ShoppingCart,
  AlertTriangle,
  Info,
  PlusCircle
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import JamCard from '@/components/JamCard';

const Explore = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState('');
  const queryClient = useQueryClient();
  
  const { data: jams, isLoading, error } = useQuery({
    queryKey: ['jams', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jams')
        .select(`
          *,
          profiles:creator_id (id, username, full_name, avatar_url, role),
          reviews (*, reviewer:reviewer_id(username, avatar_url))
        `)
        .eq('status', 'approved')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching jams:', error);
        throw error;
      }
      
      console.log('Fetched jams:', data);
      
      // Map the data to the correct structure
      const mappedJams = data ? data.map(jam => {
        // Calculate average rating
        const avgRating = calculateAverageRating(jam.reviews);
        return {
          ...jam,
          avgRating
        };
      }) : [];
      
      return mappedJams as Jam[];
    }
  });

  // Fetch user's favorites
  const { data: userFavorites } = useQuery({
    queryKey: ['userFavorites'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select('jam_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }
      
      return data.map(fav => fav.jam_id);
    },
    enabled: !!user
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ jamId, isFavorite }: { jamId: string, isFavorite: boolean }) => {
      if (!user) {
        throw new Error('Vous devez être connecté pour ajouter des favoris');
      }

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('jam_id', jamId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, jam_id: jamId }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  });

  // Handle toggling a favorite
  const handleToggleFavorite = (jamId: string, isFavorite: boolean) => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour ajouter des favoris',
        variant: 'default',
      });
      return;
    }
    
    toggleFavoriteMutation.mutate({ jamId, isFavorite });
    
    toast({
      title: isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris',
      description: isFavorite
        ? 'Cette confiture a été retirée de vos favoris.'
        : 'Cette confiture a été ajoutée à vos favoris.',
    });
  };

  // Calculate average rating from reviews
  const calculateAverageRating = (reviews: any[] | null | undefined) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return totalRating / reviews.length;
  };

  // Filter jams by name or description
  const filteredJams = jams?.filter(jam => {
    if (!filters) return true;
    const searchTerm = filters.toLowerCase();
    return (
      jam.name.toLowerCase().includes(searchTerm) || 
      jam.description.toLowerCase().includes(searchTerm) ||
      (jam.ingredients && jam.ingredients.some(ingredient => 
        typeof ingredient === 'string' && ingredient.toLowerCase().includes(searchTerm)
      ))
    );
  });

  console.log('Filtered jams:', filteredJams);

  if (error) {
    console.error("Error loading jams:", error);
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger les confitures. Veuillez réessayer plus tard.",
      variant: "destructive",
    });
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="font-serif text-3xl font-bold">
            Explorez les confitures
          </h1>
          <p className="text-muted-foreground mt-2">
            Découvrez de nouvelles saveurs et soutenez les créateurs de confitures !
          </p>
        </div>
        <Input 
          type="search" 
          placeholder="Rechercher une confiture..." 
          className="max-w-md"
          value={filters}
          onChange={(e) => setFilters(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle><Skeleton className="h-5 w-3/4" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-full mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJams && filteredJams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredJams.map((jam) => (
            <Card key={jam.id}>
              <CardHeader>
                <CardTitle>{jam.name}</CardTitle>
                <CardDescription>
                  {jam.description.substring(0, 50)}...
                </CardDescription>
              </CardHeader>
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={jam.cover_image_url || '/placeholder.svg'}
                  alt={jam.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{jam.avgRating?.toFixed(1) || 'Pas d\'avis'}</span>
                </div>
                <div className="flex items-center mt-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={jam.profiles?.avatar_url || undefined} />
                    <AvatarFallback>{jam.profiles?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    Par {jam.profiles?.username}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold">{jam.price_credits}</span>
                  <span className="ml-1 text-muted-foreground">crédits</span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleToggleFavorite(
                      jam.id, 
                      userFavorites?.includes(jam.id) || false
                    )}
                    disabled={toggleFavoriteMutation.isPending}
                  >
                    {userFavorites?.includes(jam.id) ? (
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    ) : (
                      <Heart className="h-5 w-5" />
                    )}
                  </Button>
                  <Button asChild>
                    <Link to={`/jam/${jam.id}`}>
                      Voir plus
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Info className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Aucune confiture trouvée</h2>
          <p className="mt-2 text-muted-foreground">
            Essayez de modifier vos critères de recherche.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/jam/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Proposer une confiture
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Explore;
