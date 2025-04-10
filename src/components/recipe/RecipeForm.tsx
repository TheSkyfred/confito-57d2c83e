
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
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { parseRecipeInstructions } from '@/utils/supabaseHelpers';
import { Trash2, Plus, ArrowUp, ArrowDown, Image, Loader2 } from 'lucide-react';

// Schema Zod pour la validation des données
const recipeFormSchema = z.object({
  title: z.string().min(5, 'Le titre doit avoir au moins 5 caractères'),
  prep_time_minutes: z.coerce.number().min(1, 'Le temps de préparation est requis'),
  difficulty: z.enum(['facile', 'moyen', 'avancé']),
  season: z.enum(['printemps', 'été', 'automne', 'hiver', 'toutes_saisons']),
  style: z.enum(['fruitée', 'épicée', 'sans_sucre', 'traditionnelle', 'exotique', 'bio']),
});

interface RecipeStep {
  step: number;
  description: string;
  image_url?: string;
  duration?: string;
}

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
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([]);
  const [uploadingImage, setUploadingImage] = useState<{[key: number]: boolean}>({});
  
  const form = useForm<z.infer<typeof recipeFormSchema>>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: '',
      prep_time_minutes: 15,
      difficulty: 'facile' as const,
      season: 'toutes_saisons' as const,
      style: 'fruitée' as const,
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
      
      // Extraire les étapes de recette
      if (data.instructions) {
        const steps = parseRecipeInstructions(data.instructions);
        setRecipeSteps(steps);
      }
      
      // Remplir le formulaire
      form.reset({
        title: data.title,
        prep_time_minutes: data.prep_time_minutes,
        difficulty: data.difficulty,
        season: data.season,
        style: data.style,
      });
      
      setLoading(false);
    };
    
    fetchRecipe();
  }, [recipeId, form, toast, navigate]);
  
  // Ajouter une nouvelle étape
  const addStep = () => {
    const nextStep = recipeSteps.length + 1;
    setRecipeSteps([...recipeSteps, { 
      step: nextStep, 
      description: '', 
      image_url: undefined,
      duration: ''
    }]);
  };

  // Supprimer une étape
  const removeStep = (stepIndex: number) => {
    const newSteps = [...recipeSteps];
    newSteps.splice(stepIndex, 1);
    
    // Réindexer les étapes
    newSteps.forEach((step, idx) => {
      step.step = idx + 1;
    });
    
    setRecipeSteps(newSteps);
  };

  // Mettre à jour une étape
  const updateStep = (stepIndex: number, field: keyof RecipeStep, value: string) => {
    const newSteps = [...recipeSteps];
    newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value };
    setRecipeSteps(newSteps);
  };

  // Déplacer une étape vers le haut ou le bas
  const moveStep = (stepIndex: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && stepIndex === 0) || 
      (direction === 'down' && stepIndex === recipeSteps.length - 1)
    ) {
      return;
    }

    const newSteps = [...recipeSteps];
    const newPos = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    
    // Échanger les positions
    const temp = newSteps[stepIndex];
    newSteps[stepIndex] = newSteps[newPos];
    newSteps[newPos] = temp;
    
    // Mettre à jour les numéros d'étapes
    newSteps.forEach((step, idx) => {
      step.step = idx + 1;
    });
    
    setRecipeSteps(newSteps);
  };

  // Gérer l'upload d'image pour une étape
  const handleImageUpload = async (stepIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    setUploadingImage(prev => ({ ...prev, [stepIndex]: true }));
    
    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_step${stepIndex + 1}.${fileExt}`;
      const filePath = `recipe-steps/${fileName}`;
      
      // Uploader l'image
      const { error: uploadError } = await supabase.storage
        .from('jam-images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Récupérer l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from('jam-images')
        .getPublicUrl(filePath);
        
      // Mettre à jour l'étape avec l'URL de l'image
      updateStep(stepIndex, 'image_url', publicUrlData.publicUrl);
      
      toast({
        title: "Image téléchargée",
        description: "L'image a été ajoutée à l'étape",
      });
    } catch (error: any) {
      console.error("Erreur de téléchargement:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du téléchargement de l'image",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(prev => ({ ...prev, [stepIndex]: false }));
    }
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
    
    if (recipeSteps.length === 0) {
      toast({
        title: "Erreur",
        description: "Vous devez ajouter au moins une étape à votre recette",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Préparer les étapes pour l'enregistrement
      const formattedSteps = recipeSteps.map(({ step, description, image_url, duration }) => ({
        step,
        description,
        image_url: image_url || null,
        duration: duration || null
      }));
      
      // Déterminer si la publication directe est autorisée (pour admin/modo)
      const status = (isAdmin || isModerator) ? 'approved' : 'pending';
      
      const recipeData = {
        title: values.title,
        prep_time_minutes: values.prep_time_minutes,
        difficulty: values.difficulty,
        season: values.season,
        style: values.style,
        instructions: formattedSteps,
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
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Étapes de la recette</h3>
            <Button 
              type="button" 
              onClick={addStep}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une étape
            </Button>
          </div>
          
          {recipeSteps.length === 0 ? (
            <div className="text-center p-6 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">
                Ajoutez les étapes de préparation pour votre recette
              </p>
              <Button onClick={addStep} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Ajouter une première étape
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recipeSteps.map((step, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Étape {step.step}</h4>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span className="sr-only">Monter</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === recipeSteps.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                        <span className="sr-only">Descendre</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <FormLabel htmlFor={`step-desc-${index}`}>Description</FormLabel>
                      <Textarea
                        id={`step-desc-${index}`}
                        value={step.description}
                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                        placeholder="Décrivez cette étape..."
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel htmlFor={`step-duration-${index}`}>
                          Durée (optionnel)
                        </FormLabel>
                        <Input
                          id={`step-duration-${index}`}
                          value={step.duration || ""}
                          onChange={(e) => updateStep(index, 'duration', e.target.value)}
                          placeholder="Ex: 15 minutes"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <FormLabel htmlFor={`step-image-${index}`}>
                          Image (optionnel)
                        </FormLabel>
                        <div className="mt-1">
                          <Input
                            id={`step-image-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(index, e as React.ChangeEvent<HTMLInputElement>)}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={uploadingImage[index]}
                            onClick={() => {
                              document
                                .getElementById(`step-image-${index}`)
                                ?.click();
                            }}
                          >
                            {uploadingImage[index] ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Téléchargement...
                              </>
                            ) : (
                              <>
                                <Image className="w-4 h-4 mr-2" />
                                {step.image_url ? "Changer l'image" : "Ajouter une image"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {step.image_url && (
                      <div className="mt-2">
                        <div className="relative rounded-md overflow-hidden aspect-video w-full max-w-md mx-auto">
                          <img
                            src={step.image_url}
                            alt={`Étape ${step.step}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        
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
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? 'Mise à jour...' : 'Publication...'}
              </>
            ) : (
              isEditing ? 'Mettre à jour' : 'Publier'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RecipeForm;
