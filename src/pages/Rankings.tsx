
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Trophy,
  Award,
  Medal,
  Star,
  ArrowUpRight,
  ShoppingCart,
  Heart,
  Loader2
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

type User = {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  jam_count: number;
  review_count: number;
  avg_rating: number;
}

type Jam = {
  id: string;
  name: string;
  creator_id: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
  jam_images: Array<{
    url: string;
  }>;
  review_count: number;
  avg_rating: number;
  sale_count: number;
}

const Rankings = () => {
  const [selectedTab, setSelectedTab] = useState('jams');
  
  // Fetch top jams
  const { data: topJams, isLoading: isLoadingJams } = useQuery({
    queryKey: ['topJams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jams')
        .select(`
          id,
          name,
          creator_id,
          jam_images (url),
          profiles:creator_id (username, avatar_url),
          reviews (rating)
        `)
        .eq('is_active', true);

      if (error) throw error;
      
      // Process and calculate metrics
      const processedJams = data.map((jam: any) => {
        const ratings = jam.reviews?.map((r: any) => r.rating) || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
          : 0;
          
        return {
          ...jam,
          profile: jam.profiles,
          review_count: ratings.length,
          avg_rating: avgRating,
          // In a real app, you'd have a proper orders count
          sale_count: Math.floor(Math.random() * 50) + 1, // Simulated for demo
        };
      });

      // Sort by average rating
      return processedJams.sort((a: Jam, b: Jam) => b.avg_rating - a.avg_rating).slice(0, 10);
    },
  });

  // Fetch top users
  const { data: topUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['topUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          full_name
        `);

      if (error) throw error;
      
      // In a real app, you'd join with reviews, jams, etc.
      // Here we're simulating metrics for demo purposes
      const processedUsers = data.map((user: any) => ({
        ...user,
        jam_count: Math.floor(Math.random() * 20) + 1,
        review_count: Math.floor(Math.random() * 30) + 1,
        avg_rating: (Math.random() * 3) + 2, // Random rating between 2-5
      }));

      // Sort by jam count (simulated metric)
      return processedUsers.sort((a: User, b: User) => b.jam_count - a.jam_count).slice(0, 10);
    },
  });
  
  const getJamRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <Badge variant="outline">{index + 1}</Badge>;
    }
  };
  
  const getUserRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <Badge variant="outline">{index + 1}</Badge>;
    }
  };

  // Safe toFixed function to handle undefined/null values
  const safeToFixed = (value: number | undefined | null, digits: number = 1): string => {
    if (value === undefined || value === null) return '0.0';
    return value.toFixed(digits);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-2">
          <Award className="h-8 w-8 text-jam-honey" />
          <h1 className="font-serif text-3xl font-bold">
            Classements
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Découvrez les meilleures confitures et les confituriers les plus populaires
        </p>
      </div>

      <Tabs defaultValue="jams" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="jams" className="flex-1">Meilleures confitures</TabsTrigger>
          <TabsTrigger value="users" className="flex-1">Meilleurs confituriers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jams">
          {isLoadingJams ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
            </div>
          ) : (
            <div className="space-y-6">
              {topJams?.map((jam: Jam, index: number) => (
                <Card key={jam.id} className={index < 3 ? "border-jam-honey" : ""}>
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <div className="flex items-center justify-center w-10 mr-4">
                        {getJamRankBadge(index)}
                      </div>
                      <div className="flex-shrink-0 mr-4">
                        <img 
                          src={jam.jam_images?.[0]?.url || '/placeholder.svg'} 
                          alt={jam.name}
                          className="h-16 w-16 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{jam.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Avatar className="h-4 w-4 mr-1">
                            <AvatarImage src={jam.profile?.avatar_url || undefined} />
                            <AvatarFallback>{jam.profile?.username?.[0]?.toUpperCase() || 'J'}</AvatarFallback>
                          </Avatar>
                          <span>{jam.profile?.username || 'Utilisateur'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center mb-1">
                          <Star className="h-4 w-4 text-jam-honey fill-jam-honey mr-1" />
                          <span className="font-medium">{safeToFixed(jam.avg_rating)}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({jam.review_count || 0})
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          <span>{jam.sale_count} vendu{jam.sale_count > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild className="ml-2">
                        <Link to={`/jam/${jam.id}`}>
                          <ArrowUpRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users">
          {isLoadingUsers ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
            </div>
          ) : (
            <div className="space-y-6">
              {topUsers?.map((user: User, index: number) => (
                <Card key={user.id} className={index < 3 ? "border-jam-honey" : ""}>
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <div className="flex items-center justify-center w-10 mr-4">
                        {getUserRankBadge(index)}
                      </div>
                      <Avatar className="h-16 w-16 mr-4">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{(user.username?.[0] || 'U').toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <h3 className="font-medium">{user.full_name || user.username}</h3>
                        <div className="text-sm text-muted-foreground">
                          @{user.username}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div className="font-medium">{user.jam_count}</div>
                          <div className="text-xs text-muted-foreground">Confitures</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center">
                            <Star className="h-3 w-3 text-jam-honey fill-jam-honey mr-1" />
                            <span className="font-medium">{safeToFixed(user.avg_rating)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Note moy.</div>
                        </div>
                        <div>
                          <div className="font-medium">{user.review_count}</div>
                          <div className="text-xs text-muted-foreground">Avis</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild className="ml-2">
                        <Link to={`/profile/${user.id}`}>
                          <ArrowUpRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rankings;
