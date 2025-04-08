
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { parseRecipeInstructions } from '@/utils/supabaseHelpers';

// Schema Zod pour la validation des données
const recipeFormSchema = z.object({
  title: z.string().min(5, 'Le titre doit avoir au moins 5 caractères'),
  prep_time_minutes: z.coerce.number().min(1, 'Le temps de préparation est requis'),
  difficulty: z.enum(['facile', 'moyen', 'avancé']),
  season: z.enum(['printemps', 'été', 'automne', 'hiver', 'toutes_saisons']),
  style: z.enum(['fruitée', 'épicée', 'sans_sucre', 'traditionnelle', 'exotique', 'bio']),
  instructions: z.string().min(10, 'Les instructions doivent être détaillées'),
  // Autres champs selon besoin
});

interface RecipeFormProps {
  recipeId?: string;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipeId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const navigate = useNavigate();
  const isEditing = !!recipeId;
  
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [parsedInstructions, setParsedInstructions] = useState<string>('');
  
  const form = useForm<z.infer<typeof recipeFormSchema>>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: '',
      prep_time_minutes: 15,
      difficulty: 'facile' as const,
      season: 'toutes_saisons' as const,
      style: 'fruitée' as const,
      instructions: '',
    },
  });
  
  // Charger la recette existante si en mode édition
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger cette recette",
          variant: "destructive",
        });
        navigate('/recipes');
        return;
      }
      
      setRecipe(data);
      
      // Parse and convert the instructions
      let instructionsText = '';
      if (data.instructions) {
        const steps = parseRecipeInstructions(data.instructions);
        instructionsText = steps
          .map((step: any) => `${step.step}. ${step.description}`)
          .join('\n');
      }
      
      setParsedInstructions(instructionsText);
      
      // Remplir le formulaire
      form.reset({
        title: data.title,
        prep_time_minutes: data.prep_time_minutes,
        difficulty: data.difficulty,
        season: data.season,
        style: data.style,
        instructions: instructionsText,
      });
      
      setLoading(false);
    };
    
    fetchRecipe();
  }, [recipeId, form, toast, navigate]);
  
  // Convertir le texte des instructions en format JSON pour la BD
  const parseInstructions = (instructionsText: string) => {
    // Diviser par lignes et créer des objets d'étapes
    return instructionsText.split('\n')
      .filter(line => line.trim())
      .map((line, index) => {
        // Si la ligne commence déjà par un nombre, l'utiliser comme numéro d'étape
        const stepMatch = line.match(/^(\d+)\.\s*(.*)/);
        
        if (stepMatch) {
          return {
            step: parseInt(stepMatch[1]),
            description: stepMatch[2].trim()
          };
        }
        
        // Sinon, générer un numéro d'étape automatiquement
        return {
          step: index + 1,
          description: line.trim()
        };
      });
  };
  
  const onSubmit = async (values: z.infer<typeof recipeFormSchema>) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour publier une recette",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const instructionsJson = parseInstructions(values.instructions);
      
      // Déterminer si la publication directe est autorisée (pour admin/modo)
      const status = (isAdmin || isModerator) ? 'approved' : 'pending';
      
      const recipeData = {
        title: values.title,
        prep_time_minutes: values.prep_time_minutes,
        difficulty: values.difficulty,
        season: values.season,
        style: values.style,
        instructions: instructionsJson,
        author_id: user.id,
        status: isEditing ? recipe.status : status,
      };
      
      let result;
      
      if (isEditing) {
        // Mode édition
        result = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', recipeId);
      } else {
        // Nouvelle recette
        result = await supabase
          .from('recipes')
          .insert(recipeData)
          .select();
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: isEditing ? "Recette mise à jour" : "Recette créée",
        description: isEditing 
          ? "Votre recette a été mise à jour avec succès" 
          : (isAdmin || isModerator)
            ? "Votre recette a été publiée"
            : "Votre recette a été soumise pour approbation",
      });
      
      // Rediriger vers la page des recettes ou la page de détail
      if (!isEditing && result.data && result.data[0]?.id) {
        navigate(`/recipes/${result.data[0].id}`);
      } else {
        navigate('/recipes');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de la recette</FormLabel>
              <FormControl>
                <Input placeholder="Une délicieuse confiture de..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="prep_time_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temps de préparation (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulté</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="facile">Facile</option>
                    <option value="moyen">Moyen</option>
                    <option value="avancé">Avancé</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="season"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saison</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="printemps">Printemps</option>
                    <option value="été">Été</option>
                    <option value="automne">Automne</option>
                    <option value="hiver">Hiver</option>
                    <option value="toutes_saisons">Toutes saisons</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Style</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  <option value="fruitée">Fruitée</option>
                  <option value="épicée">Épicée</option>
                  <option value="sans_sucre">Sans sucre</option>
                  <option value="traditionnelle">Traditionnelle</option>
                  <option value="exotique">Exotique</option>
                  <option value="bio">Bio</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Détaillez les étapes de préparation..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground mt-1">
                Écrivez une instruction par ligne. Vous pouvez numéroter les étapes (exemple: "1. Préparer les fruits").
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Chargement...' : isEditing ? 'Mettre à jour' : 'Publier'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RecipeForm;
