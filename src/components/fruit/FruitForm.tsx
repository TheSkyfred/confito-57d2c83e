
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  StandaloneFormLabel,
  StandaloneFormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Schéma de validation pour le formulaire
const fruitFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  image_url: z.string().url({
    message: "Entrez une URL valide pour l'image.",
  }).optional().or(z.literal('')),
  description: z.string().optional(),
  conservation_tips: z.string().optional(),
  cooking_tips: z.string().optional(),
  family: z.string().optional(),
  is_published: z.boolean().default(true),
  seasons: z.array(z.number().min(1).max(12)).optional(),
  tags: z.array(z.string()).optional(),
});

type FruitFormValues = z.infer<typeof fruitFormSchema>;

const months = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

type FruitFormProps = {
  fruit?: any;
  onSubmit: () => void;
  onCancel: () => void;
};

const FruitForm: React.FC<FruitFormProps> = ({ fruit, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Initialiser le formulaire
  const form = useForm<FruitFormValues>({
    resolver: zodResolver(fruitFormSchema),
    defaultValues: {
      name: '',
      image_url: '',
      description: '',
      conservation_tips: '',
      cooking_tips: '',
      family: '',
      is_published: true,
      seasons: [],
      tags: [],
    },
  });

  // Charger les données du fruit existant si en mode édition
  useEffect(() => {
    if (!fruit) return;

    const loadFruitData = async () => {
      try {
        // Mise à jour des valeurs de base du formulaire
        form.reset({
          name: fruit.name || '',
          image_url: fruit.image_url || '',
          description: fruit.description || '',
          conservation_tips: fruit.conservation_tips || '',
          cooking_tips: fruit.cooking_tips || '',
          family: fruit.family || '',
          is_published: fruit.is_published ?? true,
          seasons: [],
          tags: [],
        });
        
        // Update the local state separately from form
        setIsPublished(fruit.is_published ?? true);

        // Charger les saisons associées
        const { data: seasonData, error: seasonError } = await supabase
          .from('fruit_seasons')
          .select('month')
          .eq('fruit_id', fruit.id);

        if (seasonError) throw seasonError;

        if (seasonData && seasonData.length > 0) {
          const seasons = seasonData.map(s => s.month);
          setSelectedSeasons(seasons);
          form.setValue('seasons', seasons);
        }

        // Charger les tags associés
        const { data: tagData, error: tagError } = await supabase
          .from('fruit_tags')
          .select('tag')
          .eq('fruit_id', fruit.id);

        if (tagError) throw tagError;

        if (tagData && tagData.length > 0) {
          const tags = tagData.map(t => t.tag);
          setTags(tags);
          form.setValue('tags', tags);
        }
      } catch (error) {
        console.error('Error loading fruit data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du fruit.",
          variant: "destructive",
        });
      }
    };

    loadFruitData();
  }, [fruit, form, toast]);

  // Gérer les changements de saisons sélectionnées
  const handleSeasonToggle = (month: number) => {
    setSelectedSeasons(current => {
      const updated = current.includes(month)
        ? current.filter(m => m !== month)
        : [...current, month];
      
      form.setValue('seasons', updated);
      return updated;
    });
  };

  // Gérer l'ajout de tags
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
        form.setValue('tags', newTags);
      }
      setTagInput('');
    }
  };

  // Handle publish status change - completely separate from form state
  const handlePublishChange = (checked: boolean) => {
    setIsPublished(checked);
    form.setValue('is_published', checked);
  };

  // Supprimer un tag
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags);
  };

  // Soumettre le formulaire
  const onFormSubmit = async (values: FruitFormValues) => {
    setIsLoading(true);
    try {
      let fruitId = fruit?.id;

      // Ensure is_published value is taken from our local state
      values.is_published = isPublished;

      // Insérer ou mettre à jour le fruit
      if (fruitId) {
        // Mise à jour
        const { error: updateError } = await supabase
          .from('fruits')
          .update({
            name: values.name,
            image_url: values.image_url || null,
            description: values.description || null,
            conservation_tips: values.conservation_tips || null,
            cooking_tips: values.cooking_tips || null,
            family: values.family || null,
            is_published: values.is_published,
          })
          .eq('id', fruitId);

        if (updateError) throw updateError;
      } else {
        // Création
        const { data: newFruit, error: insertError } = await supabase
          .from('fruits')
          .insert({
            name: values.name,
            image_url: values.image_url || null,
            description: values.description || null,
            conservation_tips: values.conservation_tips || null,
            cooking_tips: values.cooking_tips || null,
            family: values.family || null,
            is_published: values.is_published,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        fruitId = newFruit.id;
      }

      // Gérer les saisons
      if (fruitId && selectedSeasons.length > 0) {
        // Supprimer les saisons existantes
        await supabase
          .from('fruit_seasons')
          .delete()
          .eq('fruit_id', fruitId);

        // Insérer les nouvelles saisons
        const seasonObjects = selectedSeasons.map(month => ({
          fruit_id: fruitId,
          month,
        }));

        const { error: seasonError } = await supabase
          .from('fruit_seasons')
          .insert(seasonObjects);

        if (seasonError) throw seasonError;
      }

      // Gérer les tags
      if (fruitId && tags.length > 0) {
        // Supprimer les tags existants
        await supabase
          .from('fruit_tags')
          .delete()
          .eq('fruit_id', fruitId);

        // Insérer les nouveaux tags
        const tagObjects = tags.map(tag => ({
          fruit_id: fruitId,
          tag,
        }));

        const { error: tagError } = await supabase
          .from('fruit_tags')
          .insert(tagObjects);

        if (tagError) throw tagError;
      }

      toast({
        title: fruit ? "Fruit mis à jour" : "Fruit créé",
        description: fruit 
          ? `Les informations de ${values.name} ont été mises à jour avec succès.`
          : `Le fruit ${values.name} a été ajouté au calendrier.`,
      });

      onSubmit();
    } catch (error: any) {
      console.error('Error saving fruit:', error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du fruit*</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Fraise" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="family"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Famille</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Baie, Agrume..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Catégorie ou famille du fruit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Lien vers une image du fruit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Manually rendered Switch control - completely detached from form control flow */}
              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <StandaloneFormLabel>Publier</StandaloneFormLabel>
                  <StandaloneFormDescription>
                    Rendre ce fruit visible dans le calendrier
                  </StandaloneFormDescription>
                </div>
                {/* Use the local state variable only */}
                <Switch
                  checked={isPublished}
                  onCheckedChange={handlePublishChange}
                />
              </div>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description du fruit..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conservation_tips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conseils de conservation</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Comment conserver ce fruit..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cooking_tips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conseils de préparation</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Comment préparer ce fruit pour les confitures..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <FormLabel className="block mb-3">Mois de saison</FormLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {months.map((month) => (
                <div
                  key={month.value}
                  className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer ${
                    selectedSeasons.includes(month.value)
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                  }`}
                  onClick={() => handleSeasonToggle(month.value)}
                >
                  <Checkbox
                    id={`month-${month.value}`}
                    checked={selectedSeasons.includes(month.value)}
                    onCheckedChange={() => handleSeasonToggle(month.value)}
                  />
                  <label
                    htmlFor={`month-${month.value}`}
                    className="text-sm cursor-pointer flex-grow"
                  >
                    {month.label}
                  </label>
                </div>
              ))}
            </div>
            {selectedSeasons.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Sélectionnez au moins un mois de saison pour ce fruit.
              </p>
            )}
          </div>

          <div className="border-t pt-6">
            <FormLabel className="block">Tags</FormLabel>
            <FormDescription className="mb-3">
              Ajoutez des mots-clés pour mieux catégoriser ce fruit
            </FormDescription>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1">
                  {tag}
                  <button
                    type="button"
                    className="ml-2 hover:text-destructive"
                    onClick={() => removeTag(tag)}
                  >
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Ajouter un tag (appuyez sur Entrée)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {fruit ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FruitForm;
