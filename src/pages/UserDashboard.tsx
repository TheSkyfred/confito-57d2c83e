
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditBadge } from "@/components/ui/credit-badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
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

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  // Load user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  // Load user jams
  const { data: jams, isLoading: jamsLoading } = useQuery({
    queryKey: ['user-jams', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('jams')
        .select(`
          *,
          jam_images(*)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  // Load orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          jams:jam_id (*),
          seller:seller_id (username, avatar_url)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  // Load favorites
  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          jams:jam_id (*,
            profiles:creator_id (username, avatar_url),
            jam_images(*)
          )
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl font-bold">Tableau de bord</h1>
        <CreditBadge credits={profile?.credits || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="relative">
              <div className="absolute top-6 right-6">
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    Éditer
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col items-center">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>
                    {profile?.username?.substring(0, 2) || user.email?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4">
                  {profile?.username || 'Utilisateur'}
                </CardTitle>
                <CardDescription>
                  {user.email}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <nav className="space-y-1">
                <a href="#overview" className="flex items-center p-2 rounded-md bg-muted">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  <span>Vue d'ensemble</span>
                </a>
                <a href="#credits" className="flex items-center p-2 rounded-md hover:bg-muted">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>Mes crédits</span>
                </a>
                <a href="#orders" className="flex items-center p-2 rounded-md hover:bg-muted">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  <span>Mes commandes</span>
                </a>
                <a href="#sales" className="flex items-center p-2 rounded-md hover:bg-muted">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  <span>Mes ventes</span>
                </a>
                <a href="#reviews" className="flex items-center p-2 rounded-md hover:bg-muted">
                  <Star className="h-4 w-4 mr-2" />
                  <span>Mes avis</span>
                </a>
                <a href="#badges" className="flex items-center p-2 rounded-md hover:bg-muted">
                  <Award className="h-4 w-4 mr-2" />
                  <span>Mes badges</span>
                </a>
              </nav>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/jam/create">
                <Button className="w-full justify-start" variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Créer une confiture
                </Button>
              </Link>
              <Link to="/credits">
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Acheter des crédits
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          <Tabs defaultValue="myjams">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="myjams">Mes confitures</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="favorites">Favoris</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>
            
            <TabsContent value="myjams" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Mes confitures</h2>
                <Link to="/jam/create">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouvelle confiture
                  </Button>
                </Link>
              </div>
              
              {jamsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-20 w-20 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : jams?.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Vous n'avez pas encore créé de confitures.
                    </p>
                    <Link to="/jam/create">
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Créer votre première confiture
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jams?.map((jam) => {
                    const primaryImage = jam.jam_images?.find(img => img.is_primary);
                    
                    return (
                      <Card key={jam.id} className="overflow-hidden">
                        <div className="flex">
                          <div className="w-24 h-24 bg-muted overflow-hidden">
                            {primaryImage ? (
                              <img 
                                src={primaryImage.url} 
                                alt={jam.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">No image</span>
                              </div>
                            )}
                          </div>
                          
                          <CardContent className="flex-1 p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{jam.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(jam.created_at), "d MMM yyyy", { locale: fr })}
                                </p>
                              </div>
                              <Badge variant={jam.is_active ? "default" : "outline"}>
                                {jam.is_active ? "Publiée" : "Brouillon"}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2 mt-2">
                              <Link to={`/jam/${jam.id}`}>
                                <Button variant="outline" size="sm">
                                  Voir
                                </Button>
                              </Link>
                              <Link to={`/jam/edit/${jam.id}`}>
                                <Button variant="secondary" size="sm">
                                  Éditer
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <h2 className="text-xl font-medium">Mes commandes</h2>
              
              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : orders?.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Vous n'avez pas encore passé de commande.
                    </p>
                    <Link to="/explore">
                      <Button>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Explorer les confitures
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders?.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Commande #{order.id.substring(0, 8)}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.created_at), "d MMM yyyy", { locale: fr })}
                            </p>
                            <p className="text-sm mt-1">
                              {order.jams?.name} × {order.quantity}
                            </p>
                          </div>
                          <Badge>{order.status}</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={order.seller?.avatar_url || ''} />
                              <AvatarFallback>
                                {order.seller?.username?.substring(0, 2) || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{order.seller?.username}</span>
                          </div>
                          
                          <p className="font-medium">{order.total_credits} crédits</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="space-y-4">
              <h2 className="text-xl font-medium">Mes favoris</h2>
              
              {favoritesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-20 w-20 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : favorites?.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Vous n'avez pas encore ajouté de favoris.
                    </p>
                    <Link to="/explore">
                      <Button>
                        <Heart className="mr-2 h-4 w-4" />
                        Explorer les confitures
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites?.map((favorite) => {
                    const jam = favorite.jams;
                    const primaryImage = jam?.jam_images?.find(img => img.is_primary);
                    
                    return (
                      <Card key={favorite.id} className="overflow-hidden">
                        <div className="flex">
                          <div className="w-24 h-24 bg-muted overflow-hidden">
                            {primaryImage ? (
                              <img 
                                src={primaryImage.url} 
                                alt={jam?.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">No image</span>
                              </div>
                            )}
                          </div>
                          
                          <CardContent className="flex-1 p-4">
                            <h3 className="font-medium">{jam?.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={jam?.profiles?.avatar_url || ''} />
                                <AvatarFallback>
                                  {jam?.profiles?.username?.substring(0, 2) || '??'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {jam?.profiles?.username}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2">
                              <p className="font-medium">{jam?.price_credits} crédits</p>
                              <Link to={`/jam/${jam?.id}`}>
                                <Button variant="outline" size="sm">
                                  Voir
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
              <h2 className="text-xl font-medium">Statistiques</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ventes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-40 items-center justify-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      Statistiques de ventes disponibles après votre première vente
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé de l'activité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center p-3 border rounded-md">
                        <span className="text-3xl font-bold">{jams?.length || 0}</span>
                        <span className="text-sm text-muted-foreground">Confitures</span>
                      </div>
                      <div className="flex flex-col items-center p-3 border rounded-md">
                        <span className="text-3xl font-bold">{orders?.length || 0}</span>
                        <span className="text-sm text-muted-foreground">Commandes</span>
                      </div>
                      <div className="flex flex-col items-center p-3 border rounded-md">
                        <span className="text-3xl font-bold">{favorites?.length || 0}</span>
                        <span className="text-sm text-muted-foreground">Favoris</span>
                      </div>
                      <div className="flex flex-col items-center p-3 border rounded-md">
                        <span className="text-3xl font-bold">{profile?.credits || 0}</span>
                        <span className="text-sm text-muted-foreground">Crédits</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
