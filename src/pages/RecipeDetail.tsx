import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { parseRecipeInstructions, adaptDbRecipeToRecipeType, getProfileInitials } from '@/utils/supabaseHelpers';
import AdminActionButtons from '@/components/AdminActionButtons';
import RecipeAdminActions from '@/components/recipe/RecipeAdminActions';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Star, Clock, ChefHat, ArrowLeft, Heart, Edit, Trash, Download, BookmarkPlus } from 'lucide-react';
import IngredientCalculator from '@/components/recipe/IngredientCalculator';
import RecipeRating from '@/components/recipe/RecipeRating';
import RecipeComments from '@/components/recipe/RecipeComments';
import RecipePDFGenerator from '@/components/recipe/RecipePDFGenerator';
import { RecipeType } from '@/types/recipes';

const difficultyConfig = {
  'facile': { label: 'Facile', color: 'bg-green-100 text-green-800' },
  'moyen': { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
  'avancé': { label: 'Avancé', color: 'bg-red-100 text-red-800' },
};

const RecipeDetail = () => {
  const { id } = useParams();
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, isModerator } = useUserRole();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const safeToFixed = (value: number | undefined | null, digits: number = 1): string => {
    if (value === undefined || value === null) return '0.0';
    return value.toFixed(digits);
  };
  
  const getAuthorProperty = (author: any, property: string, fallback: string = ''): string => {
    if (!author) return fallback;
    return author[property] || fallback;
  };
  
  const { data: recipe, isLoading, error, refetch } = useQuery({
    queryKey: ['recipeDetail', id],
    queryFn: async () => {
      if (!id) throw new Error('Recipe ID is required');
      
      const { data: recipeData, error } = await supabase
        .from('recipes')
        .select(`
          *,
          ingredients:recipe_ingredients (*),
          tags:recipe_tags (*),
          ratings:recipe_ratings (*),
          badges:recipe_badge_assignments (
            id, 
            badge_id,
            badge:recipe_badges!recipe_badge_assignments_badge_id_fkey (*)
          ),
          jam:jams!recipes_jam_id_fkey (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!recipeData) {
        throw new Error('Recipe not found');
      }
      
      let author = null;
      if (recipeData.author_id) {
        const { data: authorData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', recipeData.author_id)
          .single();
          
        author = authorData;
      }
      
      const ratings = recipeData.ratings || [];
      const totalRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
      const average_rating = ratings.length > 0 ? totalRating / ratings.length : 0;
      
      let is_favorite = false;
      if (session?.user) {
        const { data: favorites } = await supabase
          .from('recipe_favorites')
          .select('id')
          .eq('recipe_id', id)
          .eq('user_id', session.user.id);
          
        is_favorite = favorites && favorites.length > 0;
        setIsFavorite(is_favorite);
      }
      
      const typedRecipe = adaptDbRecipeToRecipeType({
        ...recipeData,
        author,
        average_rating,
        is_favorite
      });
      
      return typedRecipe;
    },
    enabled: !!id
  });
  
  const { data: userRating } = useQuery({
    queryKey: ['userRecipeRating', id, session?.user?.id],
    queryFn: async () => {
      if (!id || !session?.user) return null;
      
      const { data } = await supabase
        .from('recipe_ratings')
        .select('rating')
        .eq('recipe_id', id)
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      return data;
    },
    enabled: !!id && !!session?.user
  });
  
  const { data: userComment } = useQuery({
    queryKey: ['userRecipeComment', id, session?.user?.id],
    queryFn: async () => {
      if (!id || !session?.user) return null;
      
      const { data } = await supabase
        .from('recipe_comments')
        .select('content')
        .eq('recipe_id', id)
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      return data;
    },
    enabled: !!id && !!session?.user
  });
  
  const { data: similarRecipes } = useQuery({
    queryKey: ['similarRecipes', id, recipe?.tags],
    queryFn: async () => {
      if (!id || !recipe?.tags || recipe.tags.length === 0) return [];
      
      const recipeTags = recipe.tags.map(tag => tag.tag);
      
      const { data } = await supabase
        .from('recipes')
        .select(`
          id, title, image_url, difficulty, author_id,
          tags:recipe_tags (tag)
        `)
        .eq('status', 'approved')
        .neq('id', id)
        .limit(3);
        
      if (!data) return [];
      
      const enhancedData = await Promise.all(
        data.map(async (r) => {
          let author = null;
          if (r.author_id) {
            const { data: authorData } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', r.author_id)
              .single();
            author = authorData;
          }
          
          const matchingTags = r.tags
            ? r.tags.filter(t => recipeTags.includes(t.tag)).length
            : 0;
            
          return { ...r, author, relevance: matchingTags };
        })
      );
      
      return enhancedData
        .filter(r => r.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 3);
    },
    enabled: !!id && !!recipe?.tags
  });
  
  const toggleFavorite = async () => {
    if (!session?.user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter une recette à vos favoris",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isFavorite) {
        await supabase
          .from('recipe_favorites')
          .delete()
          .eq('recipe_id', id)
          .eq('user_id', session.user.id);
          
        setIsFavorite(false);
        toast({
          title: "Succès",
          description: "La recette a été retirée de vos favoris",
        });
      } else {
        await supabase
          .from('recipe_favorites')
          .insert({
            recipe_id: id!,
            user_id: session.user.id
          });
          
        setIsFavorite(true);
        toast({
          title: "Succès",
          description: "La recette a été ajoutée à vos favoris",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteRecipe = async () => {
    if (!session?.user || !recipe) return;
    
    try {
      const canDelete = 
        recipe.author_id === session.user.id || 
        isAdmin || 
        isModerator;
        
      if (!canDelete) {
        toast({
          title: "Erreur",
          description: "Vous n'avez pas les permissions pour supprimer cette recette",
          variant: "destructive",
        });
        return;
      }
      
      await supabase
        .from('recipes')
        .delete()
        .eq('id', id);
        
      toast({
        title: "Succès",
        description: "La recette a été supprimée",
      });
      
      navigate('/recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la recette",
        variant: "destructive",
      });
    }
  };
  
  const canEdit = recipe && session?.user && (
    recipe.author_id === session.user.id || 
    isAdmin || 
    isModerator
  );
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-72 md:h-96 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
            <div className="flex space-x-4 mb-6">
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-lg p-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !recipe) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Recette introuvable</h3>
          <p className="text-muted-foreground mb-6">
            La recette que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Button asChild>
            <Link to="/recipes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux recettes
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const renderAuthor = () => {
    if (!recipe?.author) return null;
    
    const authorName = getAuthorProperty(recipe.author, 'username', "Utilisateur anonyme");
    const avatarUrl = getAuthorProperty(recipe.author, 'avatar_url', '');
    
    return (
      <Link to={`/profile/${recipe.author_id}`} className="flex items-center group">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={avatarUrl} alt={authorName} />
          <AvatarFallback>{getProfileInitials(authorName)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium group-hover:underline">
          {authorName}
        </span>
      </Link>
    );
  };
  
  const renderInstructions = () => {
    if (!recipe?.instructions) return <p>Aucune instruction disponible pour cette recette.</p>;
    
    return (
      <ol className="space-y-4 list-decimal list-inside">
        {recipe.instructions.map((step, index) => (
          <li key={index} className="pl-2">
            <span className="ml-2">{step.description}</span>
          </li>
        ))}
      </ol>
    );
  };
  
  const renderSimilarRecipes = () => {
    if (!similarRecipes || similarRecipes.length === 0) {
      return null;
    }
    
    return (
      <div className="mb-8">
        <h3 className="text-xl font-medium mb-4">Recettes similaires</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {similarRecipes.map(similar => (
            <Link 
              key={similar.id} 
              to={`/recipes/${similar.id}`} 
              className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-32 overflow-hidden">
                <img 
                  src={similar.image_url || '/placeholder.svg'} 
                  alt={similar.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-medium line-clamp-1">{similar.title}</h4>
                <p className="text-sm text-muted-foreground">
                  par {getAuthorProperty(similar.author, 'username', "Inconnu")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-8">
      {isModerator && (
        <div className="mb-6">
          <RecipeAdminActions 
            recipeId={recipe.id}
            status={recipe.status}
            isActive={true}
            onStatusChange={refetch}
          />
        </div>
      )}
      
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/recipes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux recettes
          </Link>
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            onClick={toggleFavorite}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "Dans vos favoris" : "Ajouter aux favoris"}
          </Button>
          
          {canEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/recipes/edit/${recipe.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            </Button>
          )}
          
          {canEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash className="h-4 w-4 mr-2 text-red-500" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La recette sera définitivement supprimée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRecipe} className="bg-red-500 hover:bg-red-600">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative rounded-lg overflow-hidden h-72 md:h-96 mb-6">
            <img 
              src={recipe.image_url || '/placeholder.svg'} 
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            {recipe.jam_id && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-jam-honey text-white">
                  Issue d'une confiture
                </Badge>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h1 className="text-3xl font-serif font-bold mb-2">{recipe.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{safeToFixed(recipe.average_rating)}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  ({recipe.ratings ? recipe.ratings.length : 0} avis)
                </span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-1" />
                <span>{recipe.prep_time_minutes} min</span>
              </div>
              
              <Badge variant="outline" className={difficultyConfig[recipe.difficulty].color}>
                {difficultyConfig[recipe.difficulty].label}
              </Badge>
              
              <div className="flex items-center">
                <ChefHat className="h-5 w-5 text-gray-500 mr-1" />
                <span>{recipe.style}</span>
              </div>
              
              <Badge variant="secondary">
                {recipe.season}
              </Badge>
            </div>
            
            <div className="flex items-center mb-4">
              {renderAuthor()}
            </div>
            
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {recipe.badges && recipe.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.badges.map(({ id, badge }) => (
                  badge && (
                    <Badge key={id} variant="secondary">
                      {badge.name}
                    </Badge>
                  )
                ))}
              </div>
            )}
            
            {recipe.jam_id && recipe.jam && (
              <div className="mb-4">
                <Link to={`/jam/${recipe.jam_id}`} className="text-sm text-primary hover:underline">
                  Issue de la confiture : {recipe.jam.name}
                </Link>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="ingredients" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingredients">Ingrédients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ingredients" className="pt-4">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <IngredientCalculator 
                  ingredients={recipe.ingredients} 
                  baseQuantity={recipe.ingredients.reduce((sum, i) => sum + i.base_quantity, 0)}
                />
              ) : (
                <p>Aucun ingrédient listé pour cette recette.</p>
              )}
            </TabsContent>
            
            <TabsContent value="instructions" className="pt-4">
              {renderInstructions()}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between items-center mb-8">
            <RecipePDFGenerator recipe={recipe} />
            <Button variant="secondary" onClick={toggleFavorite}>
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Ajouter à ma liste
            </Button>
          </div>
          
          {renderSimilarRecipes()}
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-medium mb-4">Avis et commentaires</h3>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${
                          star <= Math.round(recipe.average_rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="font-medium">
                    {safeToFixed(recipe.average_rating)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    ({recipe.ratings ? recipe.ratings.length : 0} avis)
                  </span>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <RecipeRating 
                recipeId={recipe.id} 
                onRatingSubmit={refetch} 
                existingRating={userRating?.rating}
                existingComment={userComment?.content}
              />
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-medium mb-4">Commentaires</h3>
              <RecipeComments recipeId={recipe.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
