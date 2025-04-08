
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { adaptDbRecipeToRecipeType } from '@/utils/supabaseHelpers';
import RecipeCard from '@/components/recipe/RecipeCard';
import { RecipeType } from '@/types/recipes';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const UserRecipes = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['userRecipes', user?.id, activeTab],
    queryFn: async () => {
      if (!user) return [];
      
      // Use supabaseDirect to avoid type errors
      let filter: Record<string, any> = { author_id: user.id };
      
      if (activeTab === 'published') {
        filter.status = 'approved';
      } else if (activeTab === 'pending') {
        filter.status = 'pending';
      } else if (activeTab === 'drafts') {
        filter.status = 'brouillon';
      }
      
      const { data, error } = await supabaseDirect.select(
        'recipes',
        `
          *,
          author:profiles!recipes_author_id_fkey (username, avatar_url),
          ingredients:recipe_ingredients(*),
          ratings:recipe_ratings(*)
        `,
        filter
      );
      
      if (error) throw error;
      
      // Convert the raw recipes to RecipeType[]
      const typedRecipes = (data || []).map(recipe => adaptDbRecipeToRecipeType(recipe));
      
      return typedRecipes;
    },
    enabled: !!user,
  });

  // Filter recipes by search term
  const filteredRecipes = recipes && searchTerm 
    ? recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recipes;

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Mes recettes</h1>
          <p className="mb-6">Vous devez être connecté pour voir vos recettes.</p>
          <Button asChild>
            <Link to="/auth">Se connecter</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Mes recettes</h1>
          <p className="text-muted-foreground">
            Gérez vos recettes de confitures
          </p>
        </div>
        
        <Button asChild>
          <Link to="/recipes/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer une recette
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par titre..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="published">Publiées</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="drafts">Brouillons</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))
            ) : filteredRecipes && filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe: RecipeType) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <ListFilter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucune recette trouvée</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore créé de recettes
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/recipes/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer ma première recette
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="published" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))
            ) : filteredRecipes && filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe: RecipeType) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium mb-2">Aucune recette publiée</h3>
                <p className="text-muted-foreground">
                  Vos recettes approuvées apparaîtront ici
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))
            ) : filteredRecipes && filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe: RecipeType) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium mb-2">Aucune recette en attente</h3>
                <p className="text-muted-foreground">
                  Les recettes soumises pour approbation apparaîtront ici
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="drafts" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))
            ) : filteredRecipes && filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe: RecipeType) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium mb-2">Aucun brouillon</h3>
                <p className="text-muted-foreground">
                  Vos recettes en cours de rédaction apparaîtront ici
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserRecipes;
