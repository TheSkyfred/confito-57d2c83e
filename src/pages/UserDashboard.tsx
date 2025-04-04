
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getTypedSupabaseQuery } from '@/utils/supabaseHelpers';
import { ProfileType } from '@/types/supabase';
import {
  LayoutDashboard,
  CreditCard,
  ShoppingCart,
  Star,
  Award,
  PlusCircle,
  Heart,
  BarChart3
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditBadge } from '@/components/ui/credit-badge';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

const UserDashboard = () => {
  const { user } = useAuth();
  
  // Fetch user profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await getTypedSupabaseQuery('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as ProfileType;
    },
    enabled: !!user,
  });
  
  // Fetch user jams
  const { data: userJams, isLoading: loadingJams } = useQuery({
    queryKey: ['userJams', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await getTypedSupabaseQuery('jams')
        .select(`
          *,
          jam_images (url, is_primary),
          reviews (rating)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process jams to add average rating
      return data.map((jam: any) => {
        const ratings = jam.reviews?.map((r: any) => r.rating) || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
          : 0;
          
        return {
          ...jam,
          avgRating,
          primaryImage: jam.jam_images.find((img: any) => img.is_primary)?.url || 
                       (jam.jam_images.length > 0 ? jam.jam_images[0].url : null)
        };
      });
    },
    enabled: !!user,
  });
  
  // Fetch user orders
  const { data: userOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['userOrders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await getTypedSupabaseQuery('orders')
        .select(`
          *,
          jam:jam_id (
            name,
            jam_images (url)
          ),
          seller:seller_id (username, avatar_url),
          buyer:buyer_id (username, avatar_url)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  // Fetch user favorites
  const { data: userFavorites, isLoading: loadingFavorites } = useQuery({
    queryKey: ['userFavorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await getTypedSupabaseQuery('favorites')
        .select(`
          jam_id,
          created_at,
          jam:jam_id (
            id,
            name,
            jam_images (url),
            profiles:creator_id (username)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user badges
  const { data: userBadges, isLoading: loadingBadges } = useQuery({
    queryKey: ['userBadges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await getTypedSupabaseQuery('user_badges')
        .select(`
          awarded_at,
          badge:badge_id (
            id,
            name,
            description,
            image_url,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl mb-4">Veuillez vous connecter pour accéder à votre tableau de bord</h2>
            <Button asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Some stats for the dashboard
  const salesCount = userOrders?.filter(
    (order: any) => order.seller_id === user.id && order.status !== 'cancelled'
  ).length || 0;
  
  const purchaseCount = userOrders?.filter(
    (order: any) => order.buyer_id === user.id && order.status !== 'cancelled'
  ).length || 0;
  
  const jamCount = userJams?.length || 0;
  const badgeCount = userBadges?.length || 0;

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <LayoutDashboard className="h-8 w-8 text-jam-honey" />
        <h1 className="font-serif text-3xl font-bold">Tableau de bord</h1>
      </div>

      {/* Profile Summary */}
      {loadingProfile ? (
        <div className="w-full h-[150px] rounded-lg border bg-card p-6 mb-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{profile?.username?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                {profile && (
                  <>
                    <p className="font-medium">{profile.full_name || profile.username}</p>
                    <p className="text-sm text-muted-foreground">{profile.username}</p>
                    <div className="mt-4 flex items-center">
                      <CreditBadge amount={profile.credits} size="lg" />
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <CreditBadge amount={profile?.credits || 0} size="lg" />
                
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/profile">
                      Voir le profil
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/credits">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Acheter des crédits
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <ShoppingCart className="h-8 w-8 text-jam-raspberry mb-2" />
            <p className="text-2xl font-bold">{salesCount}</p>
            <p className="text-sm text-muted-foreground">Ventes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <ShoppingCart className="h-8 w-8 text-jam-apricot mb-2" />
            <p className="text-2xl font-bold">{purchaseCount}</p>
            <p className="text-sm text-muted-foreground">Achats</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Star className="h-8 w-8 text-jam-honey mb-2" />
            <p className="text-2xl font-bold">{jamCount}</p>
            <p className="text-sm text-muted-foreground">Confitures</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Award className="h-8 w-8 text-jam-leaf mb-2" />
            <p className="text-2xl font-bold">{badgeCount}</p>
            <p className="text-sm text-muted-foreground">Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for my jams, orders, favorites */}
      <Tabs defaultValue="jams">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="jams">Mes confitures</TabsTrigger>
          <TabsTrigger value="orders">Mes commandes</TabsTrigger>
          <TabsTrigger value="favorites">Mes favoris</TabsTrigger>
        </TabsList>
        
        {/* My Jams Tab */}
        <TabsContent value="jams">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif">Mes confitures</h2>
            <Button asChild>
              <Link to="/myjams/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une confiture
              </Link>
            </Button>
          </div>
          
          {loadingJams ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-2 p-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : userJams?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">Vous n'avez pas encore créé de confiture.</p>
                <Button asChild>
                  <Link to="/myjams/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter ma première confiture
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userJams?.map((jam: any) => (
                <Card key={jam.id}>
                  <CardContent className="p-0">
                    {jam.primaryImage ? (
                      <img 
                        src={jam.primaryImage} 
                        alt={jam.name} 
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="h-48 w-full bg-muted flex items-center justify-center">
                        <p className="text-muted-foreground">Aucune image</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-2 p-4">
                    <div className="flex justify-between items-start w-full">
                      <h3 className="font-medium">{jam.name}</h3>
                      <Badge variant={jam.is_active ? "default" : "secondary"}>
                        {jam.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-jam-honey fill-jam-honey mr-1" />
                        <span>
                          {jam.avgRating > 0 ? jam.avgRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        Stock: {jam.available_quantity}
                      </span>
                    </div>
                    
                    <div className="flex justify-between w-full mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/jam/${jam.id}`}>
                          Voir
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link to={`/myjams/edit/${jam.id}`}>
                          Modifier
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif">Mes commandes</h2>
            <Button variant="outline" asChild>
              <Link to="/orders">
                <BarChart3 className="mr-2 h-4 w-4" />
                Historique complet
              </Link>
            </Button>
          </div>
          
          {loadingOrders ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Skeleton className="h-16 w-16" />
                    <div className="flex-grow">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userOrders?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">Vous n'avez pas encore de commandes.</p>
                <Button asChild>
                  <Link to="/explore">
                    Découvrir des confitures
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userOrders?.slice(0, 5).map((order: any) => {
                const isUserBuyer = order.buyer_id === user.id;
                const otherParty = isUserBuyer ? order.seller : order.buyer;
                const statusColors: Record<string, string> = {
                  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                  shipped: 'bg-blue-100 text-blue-800 border-blue-200',
                  delivered: 'bg-green-100 text-green-800 border-green-200',
                  completed: 'bg-green-100 text-green-800 border-green-200',
                  cancelled: 'bg-red-100 text-red-800 border-red-200'
                };
                
                return (
                  <Card key={order.id}>
                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                      <img 
                        src={order.jam.jam_images[0]?.url || '/placeholder.svg'} 
                        alt={order.jam.name}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                      
                      <div className="flex-grow">
                        <h3 className="font-medium">{order.jam.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {isUserBuyer ? 'Achetée à' : 'Vendue à'} @{otherParty.username}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">{order.quantity}x</span> pour <span className="font-medium">{order.total_credits} crédits</span>
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${statusColors[order.status]}`}>
                          {order.status === 'pending' && 'En attente'}
                          {order.status === 'shipped' && 'Expédiée'}
                          {order.status === 'delivered' && 'Livrée'}
                          {order.status === 'completed' && 'Terminée'}
                          {order.status === 'cancelled' && 'Annulée'}
                        </Badge>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/orders/${order.id}`}>
                            Détails
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {userOrders && userOrders.length > 5 && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" asChild>
                    <Link to="/orders">
                      Voir toutes mes commandes
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Favorites Tab */}
        <TabsContent value="favorites">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif">Mes favoris</h2>
          </div>
          
          {loadingFavorites ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="flex p-4 gap-4">
                    <Skeleton className="h-20 w-20" />
                    <div className="flex-grow">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userFavorites?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">Vous n'avez pas encore de favoris.</p>
                <Button asChild>
                  <Link to="/explore">
                    <Heart className="mr-2 h-4 w-4" />
                    Découvrir des confitures
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userFavorites?.map((favorite: any) => (
                <Card key={favorite.jam_id}>
                  <Link to={`/jam/${favorite.jam_id}`}>
                    <CardContent className="flex p-4 gap-4">
                      <img 
                        src={favorite.jam.jam_images[0]?.url || '/placeholder.svg'} 
                        alt={favorite.jam.name}
                        className="h-20 w-20 object-cover rounded-md flex-shrink-0"
                      />
                      <div>
                        <h3 className="font-medium">{favorite.jam.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Par @{favorite.jam.profiles?.username}
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
