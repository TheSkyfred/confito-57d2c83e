
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { getProfileUsername } from '@/utils/profileTypeGuards';

const TopJamsSection = () => {
  const { data: topJams, isLoading } = useQuery({
    queryKey: ['topJams'],
    queryFn: async () => {
      const { data, error } = await supabaseDirect.select(
        'jams', 
        `
          id,
          name,
          price_credits,
          creator_id,
          profiles (username),
          jam_images (url, is_primary),
          jam_reviews (taste_rating, texture_rating, originality_rating, balance_rating)
        `
      );
      
      if (error) throw error;
      
      // Calculer la note moyenne pour chaque confiture en excluant les zéros
      const jamsWithRatings = data.map(jam => {
        // Calculate average rating for each review
        const reviewScores = jam.jam_reviews ? jam.jam_reviews.map(review => {
          const ratings = [
            review.taste_rating || 0,
            review.texture_rating || 0, 
            review.originality_rating || 0,
            review.balance_rating || 0
          ].filter(r => r > 0);
          
          return ratings.length > 0 ? 
            ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        }).filter(score => score > 0) : [];
        
        // Calculate overall average from review scores
        const avgRating = reviewScores.length > 0 ?
          reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length : 0;
        
        // Find primary image or use the first one
        const primaryImage = jam.jam_images && jam.jam_images.length > 0
          ? (jam.jam_images.find(img => img.is_primary)?.url || jam.jam_images[0]?.url)
          : null;
        
        return {
          ...jam,
          avgRating,
          primaryImage,
          reviews: jam.jam_reviews || []
        };
      });
      
      // Trier par note moyenne et ne garder que les 4 meilleures
      return jamsWithRatings
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 4);
    },
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold">Confitures les mieux notées</h2>
          <Button variant="outline" asChild>
            <Link to="/explore">
              Voir toutes les confitures
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <CardContent className="pt-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : topJams && topJams.length > 0 ? (
            topJams.map(jam => (
              <Card key={jam.id} className="overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={jam.primaryImage || '/placeholder.svg'} 
                    alt={jam.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-medium">{jam.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    par {getProfileUsername(jam.profiles)}
                  </p>
                  <div className="flex items-center mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${
                          star <= Math.round(jam.avgRating) 
                            ? 'fill-jam-honey text-jam-honey' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs ml-2">
                      ({jam.reviews ? jam.reviews.length : 0})
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="font-medium">{jam.price_credits} crédits</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/jam/${jam.id}`}>Voir détails</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Aucune confiture disponible pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopJamsSection;
