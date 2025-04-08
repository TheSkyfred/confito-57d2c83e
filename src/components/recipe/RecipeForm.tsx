
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RecipeType, RecipeStatus } from '@/types/recipes';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash, Plus, Save } from 'lucide-react';

// Schema for validating the form data
const formSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères" }),
  jam_id: z.string().optional().nullable(),
  prep_time_minutes: z.number().min(1, { message: "Le temps de préparation doit être au moins 1 minute" }),
  difficulty: z.enum(["facile", "moyen", "avancé"]),
  image_url: z.string().optional().nullable(),
  instructions: z.array(z.object({
    step: z.number(),
    description: z.string().min(5, { message: "L'étape doit contenir au moins 5 caractères" })
  })).min(1, { message: "Au moins une étape est requise" }),
  season: z.enum(["printemps", "été", "automne", "hiver", "toutes_saisons"]),
  style: z.enum(["fruitée", "épicée", "sans_sucre", "traditionnelle", "exotique", "bio"]),
  ingredients: z.array(z.object({
    name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
    base_quantity: z.number().min(0, { message: "La quantité doit être positive" }),
    unit: z.string().min(1, { message: "L'unité est requise" }),
    is_allergen: z.boolean().default(false)
  })).min(1, { message: "Au moins un ingrédient est requis" }),
  tags: z.array(z.object({
    tag: z.string().min(2, { message: "Le tag doit contenir au moins 2 caractères" })
  })).default([]),
  status: z.enum(["brouillon", "pending"]).default("brouillon")
});

type FormValues = z.infer<typeof formSchema>;

interface RecipeFormProps {
  recipeId?: string;  // If editing an existing recipe
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipeId }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch jams for the dropdown
  const { data: jams } = useQuery({
    queryKey: ['userJams'],
    queryFn: async () => {
      if (!session?.user) return [];
      
      const { data } = await supabase
        .from('jams')
        .select('id, name')
        .eq('creator_id', session.user.id)
        .eq('is_active', true);
        
      return data || [];
    },
    enabled: !!session?.user
  });
  
  // Fetch recipe data if editing
  const { data: existingRecipe, isLoading: isLoadingRecipe } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      if (!recipeId) return null;
      
      const { data: recipe } = await supabase
        .from('recipes')
        .select(`
          *,
          ingredients:recipe_ingredients(*),
          tags:recipe_tags(*)
        `)
        .eq('id', recipeId)
        .single();
        
      return recipe;
    },
    enabled: !!recipeId
  });
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      jam_id: null,
      prep_time_minutes: 30,
      difficulty: "facile" as const,
      image_url: "",
      instructions: [{ step: 1, description: "" }],
      season: "toutes_saisons" as const,
      style: "fruitée" as const,
      ingredients: [{ name: "", base_quantity: 0, unit: "g", is_allergen: false }],
      tags: [],
      status: "brouillon" as const
    },
  });
  
  // Set up field arrays for instructions, ingredients and tags
  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction
  } = useFieldArray({
    name: "instructions",
    control: form.control
  });
  
  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient
  } = useFieldArray({
    name: "ingredients",
    control: form.control
  });
  
  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag
  } = useFieldArray({
    name: "tags",
    control: form.control
  });
  
  // Update form values when editing an existing recipe
  useEffect(() => {
    if (existingRecipe) {
      // Map the recipe data to the form values
      const formData = {
        ...existingRecipe,
        instructions: existingRecipe.instructions || [{ step: 1, description: "" }],
        ingredients: existingRecipe.ingredients || [{ name: "", base_quantity: 0, unit: "g", is_allergen: false }],
        tags: existingRecipe.tags || []
      };
      
      // Reset the form with the existing recipe data
      form.reset(formData);
    }
  }, [existingRecipe, form]);
  
  const onSubmit = async (data: FormValues) => {
    if (!session?.user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer ou modifier une recette",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the data for submission
      const recipeData = {
        ...data,
        author_id: session.user.id
      };
      
      let recipeId: string;
      
      if (existingRecipe) {
        // Update existing recipe
        const { data: updatedRecipe, error } = await supabase
          .from('recipes')
          .update({
            title: recipeData.title,
            jam_id: recipeData.jam_id,
            prep_time_minutes: recipeData.prep_time_minutes,
            difficulty: recipeData.difficulty,
            image_url: recipeData.image_url,
            instructions: recipeData.instructions,
            season: recipeData.season,
            style: recipeData.style,
            status: recipeData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecipe.id)
          .select('id')
          .single();
          
        if (error) throw error;
        recipeId = existingRecipe.id;
        
        // Delete existing ingredients and tags to replace them
        await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
        await supabase.from('recipe_tags').delete().eq('recipe_id', recipeId);
      } else {
        // Insert new recipe
        const { data: newRecipe, error } = await supabase
          .from('recipes')
          .insert({
            title: recipeData.title,
            jam_id: recipeData.jam_id,
            author_id: session.user.id,
            prep_time_minutes: recipeData.prep_time_minutes,
            difficulty: recipeData.difficulty,
            image_url: recipeData.image_url,
            instructions: recipeData.instructions,
            season: recipeData.season,
            style: recipeData.style,
            status: recipeData.status
          })
          .select('id')
          .single();
          
        if (error) throw error;
        recipeId = newRecipe.id;
      }
      
      // Insert ingredients
      if (recipeData.ingredients.length > 0) {
        const ingredientsToInsert = recipeData.ingredients.map(ingredient => ({
          recipe_id: recipeId,
          name: ingredient.name,
          base_quantity: ingredient.base_quantity,
          unit: ingredient.unit,
          is_allergen: ingredient.is_allergen
        }));
        
        await supabase.from('recipe_ingredients').insert(ingredientsToInsert);
      }
      
      // Insert tags
      if (recipeData.tags.length > 0) {
        const tagsToInsert = recipeData.tags.map(tag => ({
          recipe_id: recipeId,
          tag: tag.tag
        }));
        
        await supabase.from('recipe_tags').insert(tagsToInsert);
      }
      
      toast({
        title: "Succès",
        description: existingRecipe 
          ? "La recette a été mise à jour avec succès"
          : "La recette a été créée avec succès",
      });
      
      // Redirect to the recipe page if submitted for review, otherwise stay on the form
      if (data.status === 'pending') {
        navigate(`/recipes/${recipeId}`);
      } else {
        // If saving as draft, reset the form if it's a new recipe, or show a toast if editing
        if (!existingRecipe) {
          form.reset();
        }
      }
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de la recette",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const [newTag, setNewTag] = useState('');
  
  const handleAddTag = () => {
    if (newTag.trim()) {
      appendTag({ tag: newTag.trim() });
      setNewTag('');
    }
  };
  
  if (!session?.user) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg">Vous devez être connecté pour créer ou modifier une recette.</p>
        <Button className="mt-4" onClick={() => navigate('/auth')}>Se connecter</Button>
      </div>
    );
  }
  
  if (recipeId && isLoadingRecipe) {
    return <div className="p-6 text-center">Chargement de la recette...</div>;
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la recette*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Confiture de fraises maison" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="jam_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Basée sur une confiture (optionnel)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une confiture" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      {jams?.map((jam: any) => (
                        <SelectItem key={jam.id} value={jam.id}>{jam.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prep_time_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temps de préparation (minutes)*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
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
                    <FormLabel>Difficulté*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="facile">Facile</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="avancé">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saison*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="printemps">Printemps</SelectItem>
                        <SelectItem value="été">Été</SelectItem>
                        <SelectItem value="automne">Automne</SelectItem>
                        <SelectItem value="hiver">Hiver</SelectItem>
                        <SelectItem value="toutes_saisons">Toutes saisons</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fruitée">Fruitée</SelectItem>
                        <SelectItem value="épicée">Épicée</SelectItem>
                        <SelectItem value="sans_sucre">Sans sucre</SelectItem>
                        <SelectItem value="traditionnelle">Traditionnelle</SelectItem>
                        <SelectItem value="exotique">Exotique</SelectItem>
                        <SelectItem value="bio">Bio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l'image (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Tags section */}
            <div className="space-y-2">
              <FormLabel>Tags (ingrédients principaux)</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {tagFields.map((field, index) => (
                  <div key={field.id} className="flex items-center bg-secondary rounded-full px-3 py-1">
                    <span className="text-sm">{form.watch(`tags.${index}.tag`)}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 rounded-full h-4 w-4 flex items-center justify-center bg-secondary-foreground text-secondary hover:bg-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Ingrédients*</h3>
              <div className="space-y-4">
                {ingredientFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-8 gap-2 items-center">
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Nom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.base_quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Quantité" 
                                min="0" 
                                step="0.1"
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Unité" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="col-span-1 flex items-center justify-center">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.is_allergen`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  id={`allergen-${index}`}
                                />
                                <label htmlFor={`allergen-${index}`} className="ml-1 text-xs">
                                  Allergène
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeIngredient(index)}
                        className="h-8 w-8 p-0"
                        disabled={ingredientFields.length <= 1}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => appendIngredient({ name: "", base_quantity: 0, unit: "g", is_allergen: false })}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter un ingrédient
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Étapes de préparation*</h3>
              <div className="space-y-4">
                {instructionFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center">
                      {index + 1}
                    </div>
                    
                    <div className="flex-grow">
                      <FormField
                        control={form.control}
                        name={`instructions.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder={`Étape ${index + 1}`} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeInstruction(index)}
                      className="h-8 w-8 p-0 flex-shrink-0"
                      disabled={instructionFields.length <= 1}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                    
                    <input 
                      type="hidden" 
                      {...form.register(`instructions.${index}.step`)} 
                      value={index + 1} 
                    />
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => appendInstruction({ step: instructionFields.length + 1, description: "" })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter une étape
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form actions */}
        <Card className="mt-8">
          <CardContent className="py-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium">Statut de la recette</h4>
              <p className="text-sm text-muted-foreground">
                Enregistrez comme brouillon ou soumettez pour approbation
              </p>
            </div>
            <div className="space-x-3">
              <Button 
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  form.setValue("status", "brouillon");
                  form.handleSubmit(onSubmit)();
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer comme brouillon
              </Button>
              
              <Button 
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  form.setValue("status", "pending");
                  form.handleSubmit(onSubmit)();
                }}
              >
                Soumettre pour approbation
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default RecipeForm;
