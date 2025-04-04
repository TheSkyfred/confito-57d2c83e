
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import JamCard from '@/components/JamCard';
import { Jam } from '@/types/database.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type JamWithDetails = Jam & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  jam_images: {
    url: string;
    is_primary: boolean;
  }[];
  average_rating?: number | null;
  badge_count?: number;
}

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFruit, setSelectedFruit] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Fruits disponibles pour le filtre
  const fruits = ['Fraise', 'Framboise', 'Abricot', 'Pomme', 'Poire', 'Orange'];

  // Récupération des confitures
  const { data: jams, isLoading, isError } = useQuery({
    queryKey: ['jams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jams')
        .select(`
          *,
          profiles:creator_id (username, avatar_url),
          jam_images (*),
          reviews:reviews (rating)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      // Transformer les données pour calculer la note moyenne
      return data.map((jam: any) => {
        const ratings = jam.reviews.map((r: any) => r.rating);
        const average_rating = ratings.length > 0 
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length 
          : null;
        
        // Simuler le nombre de badges pour l'utilisateur
        const badge_count = Math.floor(Math.random() * 5);
        
        return {
          ...jam,
          average_rating,
          badge_count
        };
      });
    },
  });

  const handleAddToCart = (jamId: string) => {
    // Implémenter l'ajout au panier
    toast.success("Confiture ajoutée au panier !");
  };

  const handleToggleFavorite = (jamId: string) => {
    // Implémenter l'ajout/retrait des favoris
    toast.success("Confiture ajoutée aux favoris !");
  };

  // Filtrer les confitures
  const filteredJams = jams?.filter((jam: JamWithDetails) => {
    // Filtrer par terme de recherche
    const matchesSearch = searchTerm === '' || 
      jam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jam.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrer par fruit
    const matchesFruit = !selectedFruit || 
      (jam.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(selectedFruit.toLowerCase())
      ));
    
    // Filtrer par prix
    const matchesPrice = jam.price_credits <= maxPrice;
    
    return matchesSearch && matchesFruit && matchesPrice;
  });

  // Trier les confitures
  const sortedJams = filteredJams ? [...filteredJams].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price_credits - b.price_credits;
      case 'price_desc':
        return b.price_credits - a.price_credits;
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  }) : [];

  return (
    <div className="container py-8">
      <h1 className="font-serif text-3xl font-bold mb-8 text-center">
        Découvrez nos <span className="text-jam-raspberry">confitures artisanales</span>
      </h1>
      
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Rechercher</label>
            <Input
              placeholder="Rechercher une confiture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Fruit principal</label>
            <Select onValueChange={(value) => setSelectedFruit(value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les fruits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les fruits</SelectItem>
                {fruits.map((fruit) => (
                  <SelectItem key={fruit} value={fruit}>{fruit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Prix maximum ({maxPrice} crédits)</label>
            <Slider
              value={[maxPrice]}
              min={1}
              max={100}
              step={1}
              onValueChange={(value) => setMaxPrice(value[0])}
              className="py-4"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Trier par</label>
            <Select defaultValue={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récentes</SelectItem>
                <SelectItem value="rating">Mieux notées</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedFruit && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="px-3 py-1">
              {selectedFruit}
              <button className="ml-2" onClick={() => setSelectedFruit(null)}>×</button>
            </Badge>
            {maxPrice < 100 && (
              <Badge variant="outline" className="px-3 py-1">
                Max {maxPrice} crédits
                <button className="ml-2" onClick={() => setMaxPrice(100)}>×</button>
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* Résultats */}
      {isLoading ? (
        <div className="text-center py-12">Chargement des confitures...</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500">
          Erreur lors du chargement des confitures.
        </div>
      ) : sortedJams.length === 0 ? (
        <div className="text-center py-12">
          Aucune confiture trouvée avec ces critères.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedJams.map((jam: JamWithDetails) => {
            // Trouver l'image principale ou prendre la première
            const primaryImage = jam.jam_images.find(img => img.is_primary)?.url || 
                               jam.jam_images[0]?.url || 
                               'https://images.unsplash.com/photo-1600853225238-63d010a87b95?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80';
            
            return (
              <JamCard
                key={jam.id}
                id={jam.id}
                name={jam.name}
                description={jam.description}
                imageUrl={primaryImage}
                price={jam.price_credits}
                rating={jam.average_rating || undefined}
                user={{
                  name: jam.profiles.username,
                  avatarUrl: jam.profiles.avatar_url || undefined,
                  badgeCount: jam.badge_count
                }}
                tags={jam.ingredients.slice(0, 3)}
                onAddToCart={() => handleAddToCart(jam.id)}
                onToggleFavorite={() => handleToggleFavorite(jam.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
