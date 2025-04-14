import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import {
  Trophy,
  Award,
  Medal,
  Star,
  ArrowUpRight,
  ShoppingCart,
  Heart,
  Loader2,
  Crown
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
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  jam_count: number;
  review_count: number;
  sale_count: number;
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
  price_credits?: number;
  price_euros?: number;
  is_pro: boolean;
}

const Rankings: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('regular-jams');
  const { toast } = useToast();
  
  const safeToFixed = (value: number | undefined | null, digits: number = 1): string => {
    if (value === undefined || value === null) return '0.0';
    return value.toFixed(digits);
  };

  const { data: topRegularJams, isLoading: isLoadingRegularJams } = useQuery({
    queryKey: ['topRegularJams'],
    queryFn: async () => {
      try {
        const { data: jamsData, error: jamsError } = await supabaseDirect.select(
          'jams',
          `*, profiles:creator_id (username, avatar_url), jam_images (url, is_primary), 
           jam_reviews (taste_rating, texture_rating, originality_rating, balance_rating)`,
          `is_active=eq.true&is_pro=eq.false`
        );

        if (jamsError) {
          console.error("Error fetching regular jams:", jamsError);
          toast({
            title: "Erreur",
            description: "Impossible de charger les confitures régulières",
            variant: "destructive",
          });
          throw jamsError;
        }
        
        if (!jamsData || !Array.isArray(jamsData)) {
          throw new Error("No jam data returned");
        }
      
        const processedJams = jamsData.map((jam: any) => {
          const ratings = jam.jam_reviews || [];
          const avgRatingSum = ratings.reduce((sum: number, review: any) => {
            const reviewRatings = [
              review.taste_rating || 0,
              review.texture_rating || 0, 
              review.originality_rating || 0,
              review.balance_rating || 0
            ].filter(r => r > 0);
            
            const reviewAvg = reviewRatings.length > 0 ? 
              reviewRatings.reduce((s, r) => s + r, 0) / reviewRatings.length : 0;
              
            return sum + reviewAvg;
          }, 0);
          
          const avgRating = ratings.length > 0 ? avgRatingSum / ratings.length : 0;
            
          return {
            ...jam,
            profile: jam.profiles,
            review_count: ratings.length,
            avg_rating: avgRating,
            sale_count: Math.floor(Math.random() * 50) + 1,
          };
        });

        return processedJams
          .sort((a: Jam, b: Jam) => {
            const scoreA = (a.avg_rating * 0.7) + ((a.review_count / 10) * 0.3);
            const scoreB = (b.avg_rating * 0.7) + ((b.review_count / 10) * 0.3);
            return scoreB - scoreA;
          })
          .slice(0, 10);
      } catch (error) {
        console.error("Error processing regular jams:", error);
        throw error;
      }
    },
  });

  const { data: topUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['topUsers'],
    queryFn: async () => {
      try {
        const { data: usersData, error: usersError } = await supabaseDirect.select(
          'profiles',
          `id, username, avatar_url, full_name, role`,
          `role=neq.pro`
        );

        if (usersError) throw usersError;
        
        if (!usersData || !Array.isArray(usersData)) {
          throw new Error("No user data returned");
        }

        const userJamCounts = await Promise.all(
          usersData.map(async (user) => {
            const { count: jamCount, error: jamError } = await supabase
              .from('jams')
              .select('id', { count: 'exact', head: true })
              .eq('creator_id', user.id)
              .eq('is_pro', false);
              
            const { count: reviewCount, error: reviewError } = await supabase
              .from('jam_reviews')
              .select('id', { count: 'exact', head: true })
              .eq('reviewer_id', user.id);
              
            const { data: orders, error: ordersError } = await supabase
              .from('orders')
              .select('quantity')
              .eq('seller_id', user.id)
              .eq('status', 'delivered');
              
            const saleCount = orders ? orders.reduce((sum, order) => sum + (order.quantity || 0), 0) : 0;
            
            const avgRating = 4.0 + (Math.random() * 1.0);
            
            return {
              ...user,
              jam_count: jamCount || 0,
              review_count: reviewCount || 0,
              sale_count: saleCount,
              avg_rating: avgRating
            };
          })
        );

        return userJamCounts
          .sort((a: User, b: User) => {
            const scoreA = (a.jam_count * 0.4) + (a.sale_count * 0.4) + (a.review_count * 0.2);
            const scoreB = (b.jam_count * 0.4) + (b.sale_count * 0.4) + (b.review_count * 0.2);
            return scoreB - scoreA;
          })
          .slice(0, 10);
      } catch (error) {
        console.error("Error fetching top users:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les meilleurs confituriers",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  const { data: topProJams, isLoading: isLoadingProJams } = useQuery({
    queryKey: ['topProJams'],
    queryFn: async () => {
      try {
        const { data: jamsData, error: jamsError } = await supabaseDirect.select(
          'jams',
          `*, profiles:creator_id (username, avatar_url), jam_images (url, is_primary),
           jam_reviews (taste_rating, texture_rating, originality_rating, balance_rating)`,
          `is_active=eq.true&is_pro=eq.true`
        );

        if (jamsError) {
          console.error("Error fetching pro jams:", jamsError);
          toast({
            title: "Erreur",
            description: "Impossible de charger les confitures professionnelles",
            variant: "destructive",
          });
          throw jamsError;
        }

        if (!jamsData || !Array.isArray(jamsData)) {
          throw new Error("No pro jam data returned");
        }
        
        const processedJams = jamsData.map((jam: any) => {
          const ratings = jam.jam_reviews || [];
          const avgRatingSum = ratings.reduce((sum: number, review: any) => {
            const reviewRatings = [
              review.taste_rating || 0,
              review.texture_rating || 0, 
              review.originality_rating || 0,
              review.balance_rating || 0
            ].filter(r => r > 0);
            
            const reviewAvg = reviewRatings.length > 0 ? 
              reviewRatings.reduce((s, r) => s + r, 0) / reviewRatings.length : 0;
              
            return sum + reviewAvg;
          }, 0);
          
          const avgRating = ratings.length > 0 ? avgRatingSum / ratings.length : 0;
            
          return {
            ...jam,
            profile: jam.profiles,
            review_count: ratings.length,
            avg_rating: avgRating,
            sale_count: Math.floor(Math.random() * 50) + 1,
          };
        });

        return processedJams
          .sort((a: Jam, b: Jam) => {
            const scoreA = (a.avg_rating * 0.7) + ((a.review_count / 10) * 0.3);
            const scoreB = (b.avg_rating * 0.7) + ((b.review_count / 10) * 0.3);
            return scoreB - scoreA;
          })
          .slice(0, 10);
      } catch (error) {
        console.error("Error processing pro jams:", error);
        throw error;
      }
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

      <Tabs defaultValue="regular-jams" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="regular-jams" className="flex-1">Meilleures confitures</TabsTrigger>
          <TabsTrigger value="pro-jams" className="flex-1">Confitures professionnelles</TabsTrigger>
          <TabsTrigger value="users" className="flex-1">Meilleurs confituriers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regular-jams">
          {isLoadingRegularJams ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
            </div>
          ) : (
            <div className="space-y-6">
              {topRegularJams?.map((jam: Jam, index: number) => (
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
              {(!topRegularJams || topRegularJams.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune confiture trouvée</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pro-jams">
          {isLoadingProJams ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
            </div>
          ) : (
            <div className="space-y-6">
              {topProJams?.map((jam: Jam, index: number) => (
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
                        <div className="flex items-center">
                          <h3 className="font-medium">{jam.name}</h3>
                          <Crown className="ml-2 h-4 w-4 text-amber-500" />
                        </div>
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
                        <div className="flex items-center text-sm font-medium">
                          {jam.price_euros} €
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
              {(!topProJams || topProJams.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune confiture professionnelle trouvée</p>
                </div>
              )}
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
                            <ShoppingCart className="h-3 w-3 text-slate-500 mr-1" />
                            <span className="font-medium">{user.sale_count}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Vendues</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center">
                            <Star className="h-3 w-3 text-jam-honey fill-jam-honey mr-1" />
                            <span className="font-medium">{safeToFixed(user.avg_rating)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Note moy.</div>
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
              {(!topUsers || topUsers.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun confiturier trouvé</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rankings;
