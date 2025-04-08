import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import RecipeCard from '@/components/recipe/RecipeCard';
import RecipeFilters from '@/components/recipe/RecipeFilters';
import { RecipeType } from '@/types/recipes';
import { adaptDbRecipeToRecipeType } from '@/utils/supabaseHelpers';

const Recipes = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    difficulty: [],
    season: [],
    style: [],
    minRating: 0,
    maxPrepTime: 120,
    ingredients: [],
    allergens: false
  });

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', activeTab, filters],
    queryFn: async () => {
      let query = supabase
        .from('recipes')
        .select(`
          *,
          author:profiles!recipes_author_id_fkey (username, avatar_url),
          ingredients:recipe_ingredients(*),
          ratings:recipe_ratings(*)
        `)
        .eq('status', 'approved');

      if (activeTab === 'seasonal') {
        const currentMonth = new Date().getMonth();
        let season = 'été';
        if (currentMonth >= 2 && currentMonth <= 4) season = 'printemps';
        else if (currentMonth >= 5 && currentMonth <= 7) season = 'été';
        else if (currentMonth >= 8 && currentMonth <= 10) season = 'automne';
        else season = 'hiver';
        
        query = query.or(`season.eq.${season},season.eq.toutes_saisons`);
      } else if (activeTab === 'quick') {
        query = query.lte('prep_time_minutes', 30);
      } else if (activeTab === 'popular') {
        query = query.order('average_rating', { ascending: false });
      }

      if (filters.difficulty.length > 0) {
        query = query.in('difficulty', filters.difficulty);
      }
      
      if (filters.season.length > 0) {
        query = query.in('season', filters.season);
      }
      
      if (filters.style.length > 0) {
        query = query.in('style', filters.style);
      }
      
      if (filters.maxPrepTime < 120) {
        query = query.lte('prep_time_minutes', filters.maxPrepTime);
      }
      
      if (filters.minRating > 0) {
        query = query.gte('average_rating', filters.minRating);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const typedRecipes = data.map(recipe => adaptDbRecipeToRecipeType(recipe));
      
      return typedRecipes;
    }
  });

  const filteredRecipes = recipes && searchTerm 
    ? recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients?.some(ing => 
          ing.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : recipes;

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Recettes de confitures</h1>
          <p className="text-muted-foreground">
            Découvrez des recettes délicieuses pour réaliser vos confitures maison
          </p>
        </div>
        
        {user && (
          <Button asChild>
            <Link to="/recipes/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer une recette
            </Link>
          </Button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par titre ou ingrédient..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="md:w-auto w-full"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtres
          {Object.values(filters).some(f => 
            Array.isArray(f) ? f.length > 0 : f !== false && f !== 0 && f !== 120
          ) && (
            <Badge variant="secondary" className="ml-2">
              Actifs
            </Badge>
          )}
        </Button>
      </div>
      
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <CardDescription>
              Affinez votre recherche de recettes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecipeFilters filters={filters} setFilters={setFilters} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setFilters({
                difficulty: [],
                season: [],
                style: [],
                minRating: 0,
                maxPrepTime: 120,
                ingredients: [],
                allergens: false
              })}
            >
              Réinitialiser
            </Button>
            <Button onClick={() => setShowFilters(false)}>
              Appliquer
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="seasonal">De saison</TabsTrigger>
          <TabsTrigger value="quick">Rapides</TabsTrigger>
          <TabsTrigger value="popular">Populaires</TabsTrigger>
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
              filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <ListFilter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucune recette trouvée</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="seasonal" className="mt-0">
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
              filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium mb-2">Aucune recette de saison</h3>
                <p className="text-muted-foreground">
                  Revenez plus tard ou essayez une autre catégorie
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="quick" className="mt-0">
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
              filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium mb-2">Aucune recette rapide</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos filtres
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="popular" className="mt-0">
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
              filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium mb-2">Aucune recette populaire</h3>
                <p className="text-muted-foreground">
                  Soyez le premier à noter nos recettes !
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Recipes;
