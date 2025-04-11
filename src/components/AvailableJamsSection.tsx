import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import JamCard from '@/components/JamCard';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { JamType } from '@/types/supabase';
import { getProfileUsername } from '@/utils/profileTypeGuards';

const AvailableJamsSection = () => {
  const { data: availableJams, isLoading } = useQuery({
    queryKey: ['availableTopRatedJams'],
    queryFn: async () => {
      // Récupérer les confitures disponibles (avec stock > 0)
      const { data: jams, error } = await supabaseDirect.select<any>(
        'jams', 
        `
          id,
          name,
          description,
          price_credits,
          ingredients,
          available_quantity,
          creator_id,
          profiles (username),
          jam_images (url, is_primary),
          jam_reviews (taste_rating, texture_rating, originality_rating, balance_rating)
        `
      );
      
      if (error) throw error;
      
      // Filtrer les confitures avec un stock disponible
      const availableJams = jams.filter((jam: any) => jam.available_quantity > 0);
      
      // Calculer la note moyenne pour chaque confiture en excluant les zéros
      const jamsWithRatings = availableJams.map((jam: any) => {
        // Calculate average rating for each review
        const reviewScores = jam.jam_reviews ? jam.jam_reviews.map((review: any) => {
          const ratings = [
            review.taste_rating || 0,
            review.texture_rating || 0, 
            review.originality_rating || 0,
            review.balance_rating || 0
          ].filter(r => r > 0);
          
          return ratings.length > 0 ? 
            ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length : 0;
        }).filter((score: number) => score > 0) : [];
        
        // Calculate overall average from review scores
        const avgRating = reviewScores.length > 0 ?
          reviewScores.reduce((sum: number, score: number) => sum + score, 0) / reviewScores.length : 0;
        
        return {
          ...jam,
          avgRating,
          primaryImage: jam.jam_images && jam.jam_images.length > 0 
            ? (jam.jam_images.find((img: any) => img.is_primary)?.url || jam.jam_images[0]?.url)
            : '/placeholder.svg',
          reviews: jam.jam_reviews || []
        };
      });
      
      // Trier par note moyenne décroissante et ne prendre que les 4 premières
      return jamsWithRatings
        .sort((a: any, b: any) => b.avgRating - a.avgRating)
        .slice(0, 4) as unknown as JamType[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-serif font-bold mb-8">Confitures disponibles les mieux notées</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <CardContent className="pt-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!availableJams || availableJams.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold">Confitures disponibles les mieux notées</h2>
          <Button variant="outline" asChild>
            <Link to="/explore">
              Explorer toutes les confitures
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableJams.map(jam => (
            <Link key={jam.id} to={`/jam/${jam.id}`} className="block group">
              <JamCard jam={jam} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailableJamsSection;
