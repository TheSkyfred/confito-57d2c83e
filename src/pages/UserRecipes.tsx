
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RecipeType } from '@/types/recipes';
import { Book, Plus, ClipboardEdit, Star, Clock } from 'lucide-react';
import { getProfileInitials } from '@/utils/supabaseHelpers';

const UserRecipes = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('myrecipes');
  
  // Safe toFixed function to handle undefined/null values
  const safeToFixed = (value: number | undefined | null, digits: number = 1): string => {
    if (value === undefined || value === null) return '0.0';
    return value.toFixed(digits);
  };
  
  // Fetch user's recipes
  const { data: myRecipes, isLoading: isLoadingMyRecipes } = useQuery({
    queryKey: ['userRecipes', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [];
      
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          ratings:recipe_ratings (*),
          ingredients:recipe_ingredients (*)
        `)
        .eq('author_id', session.user.id);
        
      if (error) throw error;
      
      // Calculate average rating for each recipe
      return data.map(recipe => {
        const ratings = recipe.ratings || [];
        const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
        const average_rating = ratings.length > 0 ? totalRating / ratings.length : 0;
        
        return {
          ...recipe,
          average_rating
        };
      });
    },
    enabled: !!session?.user
  });
  
  // Fetch user's favorite recipes
  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['userFavoriteRecipes', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [];
      
      const { data, error } = await supabase
        .from('recipe_favorites')
        .select(`
          id,
          recipe:recipes (
            id, title, image_url, difficulty, prep_time_minutes, status,
            author:profiles!recipes_author_id_fkey (username, avatar_url),
            ratings:recipe_ratings (*),
            ingredients:recipe_ingredients (*)
          )
        `)
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      // Calculate average rating for each recipe
      return data
        .filter(item => item.recipe) // Filter out any null recipes
        .map(item => {
          const recipe = item.recipe;
          const ratings = recipe.ratings || [];
          const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
          const average_rating = ratings.length > 0 ? totalRating / ratings.length : 0;
          
          return {
            ...recipe,
            average_rating,
            favorite_id: item.id
          };
        });
    },
    enabled: !!session?.user
  });
  
  // Map status to display values
  const statusDisplay = {
    'brouillon': { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
    'pending': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    'approved': { label: 'Approuvée', color: 'bg-green-100 text-green-800' },
    'rejected': { label: 'Rejetée', color: 'bg-red-100 text-red-800' },
  };
  
  if (!session?.user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <Book className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-medium mb-2">Mes recettes</h1>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour voir vos recettes.
          </p>
          <Button asChild>
            <Link to="/auth">Se connecter</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold">Mes recettes</h1>
        <Button asChild>
          <Link to="/recipes/create">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle recette
          </Link>
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="myrecipes">Mes recettes</TabsTrigger>
          <TabsTrigger value="favorites">Mes favoris</TabsTrigger>
        </TabsList>
        
        <TabsContent value="myrecipes" className="mt-6">
          {isLoadingMyRecipes ? (
            <div className="text-center py-8">Chargement de vos recettes...</div>
          ) : myRecipes && myRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRecipes.map((recipe: RecipeType) => (
                <Card key={recipe.id} className="overflow-hidden">
                  <div className="h-48 relative">
                    <img 
                      src={recipe.image_url || '/placeholder.svg'} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${statusDisplay[recipe.status].color}`}
                    >
                      {statusDisplay[recipe.status].label}
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm">
                          {safeToFixed(recipe.average_rating)}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({recipe.ratings ? recipe.ratings.length : 0})
                          </span>
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">{recipe.prep_time_minutes} min</span>
                      </div>
                    </div>
                    
                    {recipe.status === 'rejected' && recipe.rejection_reason && (
                      <div className="bg-red-50 p-2 rounded-md mb-2 text-xs">
                        <strong>Motif de rejet:</strong> {recipe.rejection_reason}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <div className="flex justify-between items-center w-full">
                      <Link
                        to={`/recipes/${recipe.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Voir la recette
                      </Link>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/recipes/edit/${recipe.id}`}>
                          <ClipboardEdit className="h-3.5 w-3.5 mr-1" />
                          Modifier
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Book className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucune recette</h3>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore créé de recettes.
              </p>
              <Button asChild>
                <Link to="/recipes/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer ma première recette
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-6">
          {isLoadingFavorites ? (
            <div className="text-center py-8">Chargement de vos favoris...</div>
          ) : favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((recipe: any) => (
                <Card key={recipe.id} className="overflow-hidden">
                  <div className="h-48 relative">
                    <img 
                      src={recipe.image_url || '/placeholder.svg'} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                    />
                    {recipe.status !== 'approved' && (
                      <Badge 
                        className={`absolute top-2 right-2 ${statusDisplay[recipe.status].color}`}
                      >
                        {statusDisplay[recipe.status].label}
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm">
                          {safeToFixed(recipe.average_rating)}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({recipe.ratings ? recipe.ratings.length : 0})
                          </span>
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">{recipe.prep_time_minutes} min</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={recipe.author?.avatar_url} alt={recipe.author?.username || ""} />
                        <AvatarFallback>{getProfileInitials(recipe.author?.username)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        par {recipe.author?.username || "Utilisateur inconnu"}
                      </span>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Link
                      to={`/recipes/${recipe.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Voir la recette
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucun favori</h3>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore ajouté de recettes à vos favoris.
              </p>
              <Button asChild variant="outline">
                <Link to="/recipes">
                  Découvrir des recettes
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserRecipes;
