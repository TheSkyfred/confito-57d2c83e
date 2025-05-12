
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JamType } from '@/types/supabase';

const FavoritesSection = () => {
  const { user } = useAuth();

  const { data: favoriteJams, isLoading } = useQuery({
    queryKey: ['userFavoritesJams'],
    queryFn: async () => {
      if (!user) return [];
      
      // Récupérer d'abord les IDs des confitures favorites
      const { data: favorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('jam_id')
        .eq('user_id', user.id);
      
      if (favoritesError) throw favoritesError;
      
      if (!favorites || favorites.length === 0) return [];
      
      // Récupérer les confitures complètes
      const jamIds = favorites.map(fav => fav.jam_id);
      const { data: jams, error: jamsError } = await supabase
        .from('jams')
        .select(`
          *,
          profiles:creator_id (username, avatar_url)
        `)
        .in('id', jamIds)
        .eq('is_active', true);
      
      if (jamsError) throw jamsError;
      
      return jams as JamType[];
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!favoriteJams || favoriteJams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes favoris</CardTitle>
          <CardDescription>Vous n'avez pas encore de confitures favorites.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mb-4 stroke-[1.5]" />
            <p className="text-muted-foreground mb-4">
              Explorez notre catalogue et ajoutez des confitures à vos favoris pour les retrouver ici.
            </p>
            <Button asChild>
              <Link to="/explore">Explorer les confitures</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes favoris</CardTitle>
        <CardDescription>Les confitures que vous avez ajoutées à vos favoris.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteJams.map(jam => (
            <Card key={jam.id} className="border shadow-sm">
              <div className="flex items-center p-4">
                <div className="w-16 h-16 mr-4 overflow-hidden rounded">
                  <img 
                    src={jam.cover_image_url || '/placeholder.svg'} 
                    alt={jam.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{jam.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    Par {jam.profiles?.username}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/jam/${jam.id}`}>Voir</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full">
          <Link to="/explore">
            Explorer plus de confitures
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FavoritesSection;
