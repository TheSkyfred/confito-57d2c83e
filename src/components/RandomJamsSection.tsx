
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import JamCard from '@/components/JamCard';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { JamType } from '@/types/supabase';

const RandomJamsSection = () => {
  const { data: randomJams, isLoading } = useQuery({
    queryKey: ['randomJams'],
    queryFn: async () => {
      const { data, error } = await supabaseDirect.select(
        'jams', 
        `
          id,
          name,
          description,
          price_credits,
          ingredients,
          available_quantity,
          creator_id,
          profiles:creator_id (username),
          jam_images!left (url, is_primary)
        `
      );
      
      if (error) throw error;
      
      // Mélanger les confitures et n'en prendre que 4 aléatoires
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      const selectedJams = shuffled.slice(0, 4);
      
      return selectedJams.map(jam => ({
        ...jam,
        avgRating: 0, // On n'a pas besoin des ratings pour l'affichage aléatoire
      })) as JamType[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-serif font-bold mb-8">Découvrir des confitures</h2>
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

  if (!randomJams || randomJams.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold">Découvrir des confitures</h2>
          <Button variant="outline" asChild>
            <Link to="/explore">
              Explorer toutes les confitures
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {randomJams.map(jam => (
            <Link key={jam.id} to={`/jam/${jam.id}`} className="block group">
              <JamCard jam={jam} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RandomJamsSection;
