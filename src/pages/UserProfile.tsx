import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatProfileData } from '@/utils/profileHelpers';
import { ProfileType } from '@/types/supabase';

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

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
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
        .single();

      if (error) throw error;
      
      // Format the profile data
      return formatProfileData(data);
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
        .eq('is_active', true)
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
                  <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-serif font-bold">{profile.full_name || profile.username}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                  
                  {isOwnProfile && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/settings">
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier le profil
                      </Link>
                    </Button>
                  )}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

          {/* Content Tabs */}
          <Tabs defaultValue="jams">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="jams">Confitures</TabsTrigger>
              <TabsTrigger value="reviews">Avis reçus</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jams" className="mt-6">
              {loadingJams ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
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
              ) : userJams?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "Vous n'avez pas encore créé de confiture"
                      : "Ce confiturier n'a pas encore partagé de confiture"}
                  </p>
                  
                  {isOwnProfile && (
                    <Button className="mt-4" asChild>
                      <Link to="/myjams/create">Ajouter une confiture</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {userJams?.map((jam: any) => (
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
                          <div className="space-y-2">
                            <h3 className="font-medium">{jam.name}</h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-jam-honey fill-jam-honey mr-1" />
                                <span className="text-sm">
                                  {jam.avgRating > 0 ? jam.avgRating.toFixed(1) : 'N/A'}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                • {jam.price_credits} crédits
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
            
            <TabsContent value="reviews" className="mt-6">
              {loadingReviews ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16 mt-1" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userReviews?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "Vous n'avez pas encore reçu d'avis"
                      : "Ce confiturier n'a pas encore reçu d'avis"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReviews?.map((review: any) => (
                    <Card key={review.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                              <AvatarFallback>{review.reviewer?.username?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.reviewer?.username}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(review.created_at), 'd MMMM yyyy', { locale: fr })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4"
                                fill={i < review.rating ? "#FFA000" : "none"}
                                stroke={i < review.rating ? "#FFA000" : "currentColor"}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {review.comment ? (
                          <p>{review.comment}</p>
                        ) : (
                          <p className="text-muted-foreground text-sm">Aucun commentaire</p>
                        )}
                        <p className="mt-2 text-sm">
                          Pour la confiture: <Link to={`/jam/${review.jam_id}`} className="font-medium hover:underline">{review.jam.name}</Link>
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="badges" className="mt-6">
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
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
