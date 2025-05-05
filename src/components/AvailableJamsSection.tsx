
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import { JamType } from '@/types/supabase';
import JamCard from './JamCard';

const AvailableJamsSection = () => {
  const { data: availableJams, isLoading } = useQuery({
    queryKey: ['availableJams'],
    queryFn: async () => {
      // Utiliser cover_image_url au lieu de jam_images
      const { data, error } = await supabase
        .from('jams')
        .select(`
          *,
          profiles:creator_id (*)
        `)
        .eq('status', 'approved')
        .eq('is_active', true)
        .gt('available_quantity', 0)
        .limit(4);

      if (error) throw error;
      return data as unknown as JamType[];
    }
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-serif font-bold mb-8">Confitures disponibles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />
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
    <section className="py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold">Confitures disponibles</h2>
          <Button variant="outline" asChild>
            <Link to="/explore">
              Voir toutes
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableJams.map((jam) => (
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
