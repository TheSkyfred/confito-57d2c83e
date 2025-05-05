
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import { JamType } from '@/types/supabase';
import JamCard from './JamCard';

const TopJamsSection = () => {
  const { data: topJams, isLoading } = useQuery({
    queryKey: ['topJams'],
    queryFn: async () => {
      // Modification de la requête pour ne pas utiliser jam_images
      const { data, error } = await supabase
        .from('jams')
        .select(`
          *,
          reviews (*),
          profiles:creator_id (*)
        `)
        .eq('status', 'approved')
        .eq('is_active', true)
        .limit(4);

      if (error) throw error;
      
      // Calculer la note moyenne et trier les confitures
      const jamsWithRatings = data?.map(jam => {
        const reviews = jam.reviews || [];
        let avgRating = 0;
        
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc: number, review: any) => acc + (review.rating || 0), 0);
          avgRating = sum / reviews.length;
        }
        
        return {
          ...jam,
          avgRating
        };
      }).sort((a, b) => b.avgRating - a.avgRating);
      
      return jamsWithRatings?.slice(0, 4) as unknown as JamType[];
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-serif font-bold mb-8">Confitures les mieux notées</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!topJams || topJams.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold">Confitures les mieux notées</h2>
          <Button variant="outline" asChild>
            <Link to="/explore">
              Voir toutes
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topJams.map((jam) => (
            <Link key={jam.id} to={`/jam/${jam.id}`} className="block group">
              <JamCard jam={jam} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopJamsSection;
