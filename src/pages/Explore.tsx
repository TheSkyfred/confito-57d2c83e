
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { JamType } from '@/types/supabase';
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
import { toast } from '@/hooks/use-toast';

const Explore = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState('');
  
  const { data: jams, isLoading } = useQuery({
    queryKey: ['jams', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jams')
        .select(`
          *,
          profiles:creator_id (id, username, full_name, avatar_url, role)
        `)
        .eq('status', 'approved')
        .eq('is_active', true);

      if (error) throw error;
      
      // Convert the data to JamType with appropriate structure
      const processedData = data.map(jam => {
        return {
          ...jam,
          reviews: [], // Initialize with empty reviews array
          avgRating: 0 // Initialize with zero rating
        } as unknown as JamType;
      });
      
      return processedData;
    }
  });

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
      ) : jams && jams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jams.map((jam) => (
            <Card key={jam.id}>
              <CardHeader>
                <CardTitle>{jam.name}</CardTitle>
                <CardDescription>
                  {jam.description.substring(0, 50)}...
                </CardDescription>
              </CardHeader>
              <img
                src={jam.cover_image_url || '/placeholder.svg'}
                alt={jam.name}
                className="w-full h-48 object-cover rounded-md"
              />
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
                  <Button variant="outline" size="icon">
                    <Heart className="h-5 w-5" />
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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Proposer une confiture
          </Button>
        </div>
      )}
    </div>
  );
};

export default Explore;
