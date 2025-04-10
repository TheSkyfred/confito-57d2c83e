
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getProfileInitials, safeAccess } from '@/utils/supabaseHelpers';
import {
  User,
  Edit,
  MapPin,
  Globe,
  Mail,
  Phone,
  Award,
  Star,
  Settings,
  Loader2,
  ShoppingBag,
  Package,
  MessageCircle,
  Trophy,
  BookOpen,
  Lightbulb,
  CheckCircle,
  XCircle
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditBadge } from '@/components/ui/credit-badge';
import { useToast } from '@/hooks/use-toast';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOwnProfile = user && (id === user.id || !id);
  const profileId = id || user?.id;
  
  // Fetch profile data
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['userProfile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });
  
  // Fetch user jams
  const { data: userJams, isLoading: loadingJams } = useQuery({
    queryKey: ['profileJams', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('jams')
        .select(`
          *,
          jam_images (url, is_primary),
          reviews (rating)
        `)
        .eq('creator_id', profileId)
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
    enabled: !!profileId,
  });
  
  // Fetch user reviews
  const { data: userReviews, isLoading: loadingReviews } = useQuery({
    queryKey: ['profileReviews', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id (username, avatar_url),
          jam:jam_id (name)
        `)
        .eq('jam:jam_id.creator_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });
  
  // Fetch user badges
  const { data: userBadges, isLoading: loadingBadges } = useQuery({
    queryKey: ['profileBadges', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
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
        .eq('user_id', profileId)
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  // Fetch jam badges
  const { data: jamBadges, isLoading: loadingJamBadges } = useQuery({
    queryKey: ['jamBadges', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      // Since badges are stored in the "badges" array field on jams,
      // we need to fetch all jams by this creator that have badges
      const { data, error } = await supabase
        .from('jams')
        .select(`
          id,
          name,
          badges
        `)
        .eq('creator_id', profileId)
        .not('badges', 'is', null)
        .not('badges', 'eq', '{}');

      if (error) throw error;
      
      // Get all unique badge names
      const uniqueBadges = new Set<string>();
      data.forEach((jam) => {
        if (jam.badges && jam.badges.length > 0) {
          jam.badges.forEach((badge: string) => uniqueBadges.add(badge));
        }
      });
      
      return Array.from(uniqueBadges).map(badge => ({
        name: badge,
        count: data.filter(jam => jam.badges?.includes(badge)).length
      }));
    },
    enabled: !!profileId,
  });
  
  // Fetch user recipes
  const { data: userRecipes, isLoading: loadingRecipes } = useQuery({
    queryKey: ['profileRecipes', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          ratings:recipe_ratings (rating)
        `)
        .eq('author_id', profileId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process recipes to add average rating
      return data.map((recipe: any) => {
        const ratings = recipe.ratings?.map((r: any) => r.rating) || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
          : 0;
          
        return {
          ...recipe,
          avgRating
        };
      });
    },
    enabled: !!profileId,
  });
  
  // Fetch user advice articles
  const { data: userAdvice, isLoading: loadingAdvice } = useQuery({
    queryKey: ['profileAdvice', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('advice_articles')
        .select('*')
        .eq('author_id', profileId)
        .eq('visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });
  
  // Fetch user statistics
  const { data: userStats, isLoading: loadingStats } = useQuery({
    queryKey: ['profileStats', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      // Parallel requests for different statistics
      const [soldJamsResult, wonBattlesResult, reviewsLeftResult] = await Promise.all([
        // Count jams sold
        supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .eq('seller_id', profileId)
          .in('status', ['accepted', 'shipped', 'delivered']),
          
        // Count battle victories
        supabase
          .from('battle_results')
          .select('id', { count: 'exact' })
          .eq('winner_id', profileId),
          
        // Count reviews left
        supabase
          .from('reviews')
          .select('id', { count: 'exact' })
          .eq('reviewer_id', profileId)
      ]);
      
      if (soldJamsResult.error || wonBattlesResult.error || reviewsLeftResult.error) {
        throw new Error('Error fetching user statistics');
      }
      
      return {
        soldJamsCount: soldJamsResult.count || 0,
        wonBattlesCount: wonBattlesResult.count || 0,
        reviewsLeftCount: reviewsLeftResult.count || 0
      };
    },
    enabled: !!profileId,
  });

  const handleContactClick = () => {
    toast({
      title: "Fonctionnalité en cours de développement",
      description: "La messagerie sera bientôt disponible.",
    });
  };

  if (!profileId) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl mb-4">Veuillez vous connecter pour accéder aux profils</h2>
            <Button asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const calculateAverageRating = () => {
    if (!userReviews || userReviews.length === 0) return 0;
    
    const totalRating = userReviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    return totalRating / userReviews.length;
  };
  
  const avgRating = calculateAverageRating();
  const jamCount = userJams?.length || 0;
  const reviewCount = userReviews?.length || 0;
  const badgeCount = userBadges?.length || 0;
  const availableJams = userJams?.filter((jam: any) => jam.is_active && jam.available_quantity > 0) || [];
  const unavailableJams = userJams?.filter((jam: any) => !jam.is_active || jam.available_quantity <= 0) || [];

  return (
    <div className="container py-8">
      {loadingProfile ? (
        <div className="space-y-8">
          {/* Loading skeleton for profile header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2 text-center">
                  <Skeleton className="h-7 w-40 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : !profile ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl mb-4">Utilisateur introuvable</h2>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>{getProfileInitials(profile.username)}</AvatarFallback>
                </Avatar>
                
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-serif font-bold">{profile.full_name || profile.username}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                  
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {isOwnProfile && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/settings">
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier le profil
                        </Link>
                      </Button>
                    )}
                    
                    {!isOwnProfile && (
                      <Button variant="outline" size="sm" onClick={handleContactClick}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contacter
                      </Button>
                    )}
                  </div>
                </div>
                
                {profile.bio && (
                  <p className="text-center max-w-lg mt-2">
                    {profile.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {profile.address && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                  
                  {profile.website && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {profile.website.replace(/(^\w+:|^)\/\//, '')}
                      </a>
                    </div>
                  )}
                  
                  {isOwnProfile && user?.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  
                  {profile.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <User className="h-8 w-8 text-jam-raspberry mb-2" />
                <p className="text-2xl font-bold">{profile.role}</p>
                <p className="text-sm text-muted-foreground">Rôle</p>
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
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Star className="h-8 w-8 text-jam-apricot mb-2 fill-jam-apricot" />
                <p className="text-2xl font-bold">
                  {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
              </CardContent>
            </Card>
          </div>

          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Performances et activité sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-3 border rounded-md">
                    <ShoppingBag className="h-8 w-8 text-jam-raspberry mb-2" />
                    <p className="text-xl font-bold">{userStats?.soldJamsCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Confitures vendues</p>
                  </div>
                  <div className="flex flex-col items-center p-3 border rounded-md">
                    <Trophy className="h-8 w-8 text-jam-honey mb-2" />
                    <p className="text-xl font-bold">{userStats?.wonBattlesCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Batailles remportées</p>
                  </div>
                  <div className="flex flex-col items-center p-3 border rounded-md">
                    <MessageCircle className="h-8 w-8 text-jam-leaf mb-2" />
                    <p className="text-xl font-bold">{userStats?.reviewsLeftCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Avis laissés</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="jams">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="jams">Confitures</TabsTrigger>
              <TabsTrigger value="recipes">Recettes</TabsTrigger>
              <TabsTrigger value="advice">Conseils</TabsTrigger>
              <TabsTrigger value="user-badges">Badges Utilisateur</TabsTrigger>
              <TabsTrigger value="jam-badges">Badges Confitures</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jams" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Confitures disponibles
                  </h3>
                  {loadingJams ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-0">
                            <Skeleton className="h-[200px] w-full" />
                          </CardContent>
                          <CardFooter className="p-4">
                            <div className="w-full space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : availableJams.length === 0 ? (
                    <div className="text-center py-6 bg-muted/50 rounded-md">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Aucune confiture disponible actuellement</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {availableJams.map((jam: any) => (
                        <Link to={`/jam/${jam.id}`} key={jam.id}>
                          <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                            <CardContent className="p-0">
                              {jam.primaryImage ? (
                                <img 
                                  src={jam.primaryImage} 
                                  alt={jam.name} 
                                  className="h-[200px] w-full object-cover"
                                />
                              ) : (
                                <div className="h-[200px] w-full bg-muted flex items-center justify-center">
                                  <p className="text-muted-foreground">Aucune image</p>
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="p-4">
                              <div className="space-y-2 w-full">
                                <h3 className="font-medium">{jam.name}</h3>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-jam-honey fill-jam-honey mr-1" />
                                    <span className="text-sm">
                                      {jam.avgRating > 0 ? jam.avgRating.toFixed(1) : 'N/A'}
                                    </span>
                                  </div>
                                  <CreditBadge amount={jam.price_credits} size="md" />
                                </div>
                              </div>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <XCircle className="mr-2 h-5 w-5 text-jam-raspberry" />
                    Confitures non disponibles
                  </h3>
                  {loadingJams ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {[...Array(2)].map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-0">
                            <Skeleton className="h-[200px] w-full" />
                          </CardContent>
                          <CardFooter className="p-4">
                            <div className="w-full space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : unavailableJams.length === 0 ? (
                    <div className="text-center py-6 bg-muted/50 rounded-md">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Aucune confiture épuisée</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {unavailableJams.map((jam: any) => (
                        <Link to={`/jam/${jam.id}`} key={jam.id}>
                          <Card className="overflow-hidden h-full transition-all hover:shadow-md opacity-70">
                            <div className="absolute top-2 right-2 bg-jam-raspberry text-white px-2 py-1 rounded text-xs">
                              Non disponible
                            </div>
                            <CardContent className="p-0">
                              {jam.primaryImage ? (
                                <img 
                                  src={jam.primaryImage} 
                                  alt={jam.name} 
                                  className="h-[200px] w-full object-cover"
                                />
                              ) : (
                                <div className="h-[200px] w-full bg-muted flex items-center justify-center">
                                  <p className="text-muted-foreground">Aucune image</p>
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="p-4">
                              <div className="space-y-2 w-full">
                                <h3 className="font-medium">{jam.name}</h3>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-jam-honey fill-jam-honey mr-1" />
                                    <span className="text-sm">
                                      {jam.avgRating > 0 ? jam.avgRating.toFixed(1) : 'N/A'}
                                    </span>
                                  </div>
                                  <CreditBadge amount={jam.price_credits} size="md" />
                                </div>
                              </div>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recipes" className="mt-6">
              {loadingRecipes ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <Skeleton className="h-[200px] w-full" />
                      </CardContent>
                      <CardFooter className="p-4">
                        <div className="w-full space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : userRecipes?.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "Vous n'avez pas encore publié de recette"
                      : "Ce confiturier n'a pas encore publié de recette"}
                  </p>
                  
                  {isOwnProfile && (
                    <Button className="mt-4" asChild>
                      <Link to="/recipes/create">Ajouter une recette</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {userRecipes?.map((recipe: any) => (
                    <Link to={`/recipes/${recipe.id}`} key={recipe.id}>
                      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                        <CardContent className="p-0">
                          {recipe.image_url ? (
                            <img 
                              src={recipe.image_url} 
                              alt={recipe.title} 
                              className="h-[200px] w-full object-cover"
                            />
                          ) : (
                            <div className="h-[200px] w-full bg-muted flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">{recipe.title}</h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-jam-honey fill-jam-honey mr-1" />
                                <span className="text-sm">
                                  {recipe.avgRating > 0 ? recipe.avgRating.toFixed(1) : 'N/A'}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                • {recipe.prep_time_minutes} min
                              </span>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="advice" className="mt-6">
              {loadingAdvice ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <Skeleton className="h-[200px] w-full" />
                      </CardContent>
                      <CardFooter className="p-4">
                        <div className="w-full space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : userAdvice?.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "Vous n'avez pas encore publié de conseils"
                      : "Ce confiturier n'a pas encore publié de conseils"}
                  </p>
                  
                  {isOwnProfile && (
                    <Button className="mt-4" asChild>
                      <Link to="/conseils/create">Ajouter un conseil</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userAdvice?.map((advice: any) => (
                    <Link to={`/conseils/${advice.id}`} key={advice.id}>
                      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                        <CardContent className="p-0">
                          {advice.cover_image_url ? (
                            <img 
                              src={advice.cover_image_url} 
                              alt={advice.title} 
                              className="h-[200px] w-full object-cover"
                            />
                          ) : (
                            <div className="h-[200px] w-full bg-muted flex items-center justify-center">
                              <Lightbulb className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">{advice.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(advice.published_at), 'd MMMM yyyy', { locale: fr })}
                              {advice.tags && advice.tags.length > 0 && (
                                <>
                                  <span className="mx-1">•</span>
                                  {advice.tags.slice(0, 2).join(', ')}
                                  {advice.tags.length > 2 && '...'}
                                </>
                              )}
                            </p>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="user-badges" className="mt-6">
              {loadingBadges ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userBadges?.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "Vous n'avez pas encore obtenu de badges"
                      : "Ce confiturier n'a pas encore obtenu de badges"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {userBadges?.map((badgeEntry: any) => (
                    <Card key={badgeEntry.badge.id}>
                      <CardContent className="flex items-center gap-4 p-4">
                        {badgeEntry.badge.image_url ? (
                          <img 
                            src={badgeEntry.badge.image_url}
                            alt={badgeEntry.badge.name}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Award className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{badgeEntry.badge.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {badgeEntry.badge.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Obtenu le {format(new Date(badgeEntry.awarded_at), 'd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="jam-badges" className="mt-6">
              {loadingJamBadges ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !jamBadges || jamBadges.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "Vos confitures n'ont pas encore obtenu de badges"
                      : "Les confitures de ce confiturier n'ont pas encore obtenu de badges"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {jamBadges?.map((badge: any) => (
                    <Card key={badge.name}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="h-12 w-12 rounded-full bg-jam-apricot/20 flex items-center justify-center">
                          <Award className="h-6 w-6 text-jam-apricot" />
                        </div>
                        <div>
                          <h3 className="font-medium">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Obtenu sur {badge.count} {badge.count > 1 ? 'confitures' : 'confiture'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
