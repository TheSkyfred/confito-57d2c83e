
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Schéma de validation pour le formulaire
const fruitFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  description: z.string().optional(),
  image_url: z.string().url({
    message: "Entrez une URL valide pour l'image.",
  }).optional().or(z.literal('')),
  conservation_tips: z.string().optional(),
  cooking_tips: z.string().optional(),
  family: z.string().optional(),
  jan: z.boolean().default(false),
  feb: z.boolean().default(false),
  mar: z.boolean().default(false),
  apr: z.boolean().default(false),
  may: z.boolean().default(false),
  jun: z.boolean().default(false),
  jul: z.boolean().default(false),
  aug: z.boolean().default(false),
  sep: z.boolean().default(false),
  oct: z.boolean().default(false),
  nov: z.boolean().default(false),
  dec: z.boolean().default(false),
});

type FruitFormValues = z.infer<typeof fruitFormSchema>;

const months = [
  { value: 'jan', label: "Janvier" },
  { value: 'feb', label: "Février" },
  { value: 'mar', label: "Mars" },
  { value: 'apr', label: "Avril" },
  { value: 'may', label: "Mai" },
  { value: 'jun', label: "Juin" },
  { value: 'jul', label: "Juillet" },
  { value: 'aug', label: "Août" },
  { value: 'sep', label: "Septembre" },
  { value: 'oct', label: "Octobre" },
  { value: 'nov', label: "Novembre" },
  { value: 'dec', label: "Décembre" },
];

type SeasonalFruitFormProps = {
  fruit?: any;
  onSubmit: () => void;
  onCancel: () => void;
};

const SeasonalFruitForm: React.FC<SeasonalFruitFormProps> = ({ fruit, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FruitFormValues>({
    resolver: zodResolver(fruitFormSchema),
    defaultValues: {
      name: fruit?.name || '',
      description: fruit?.description || '',
      image_url: fruit?.image_url || '',
      conservation_tips: fruit?.conservation_tips || '',
      cooking_tips: fruit?.cooking_tips || '',
      family: fruit?.family || '',
      jan: fruit?.jan || false,
      feb: fruit?.feb || false,
      mar: fruit?.mar || false,
      apr: fruit?.apr || false,
      may: fruit?.may || false,
      jun: fruit?.jun || false,
      jul: fruit?.jul || false,
      aug: fruit?.aug || false,
      sep: fruit?.sep || false,
      oct: fruit?.oct || false,
      nov: fruit?.nov || false,
      dec: fruit?.dec || false,
    }
  });

  const onFormSubmit = async (values: FruitFormValues) => {
    setIsLoading(true);
    try {
      if (fruit?.id) {
        // Mise à jour d'un fruit existant
        const { error } = await supabase
          .from('seasonal_fruits')
          .update({
            name: values.name,
            description: values.description,
            image_url: values.image_url || null,
            conservation_tips: values.conservation_tips || null,
            cooking_tips: values.cooking_tips || null,
            family: values.family || null,
            jan: values.jan,
            feb: values.feb,
            mar: values.mar,
            apr: values.apr,
            may: values.may,
            jun: values.jun,
            jul: values.jul,
            aug: values.aug,
            sep: values.sep,
            oct: values.oct,
            nov: values.nov,
            dec: values.dec,
          })
          .eq('id', fruit.id);

        if (error) throw error;
        
        toast({
          title: "Fruit mis à jour",
          description: `Les informations de ${values.name} ont été mises à jour avec succès.`,
        });
      } else {
        // Création d'un nouveau fruit
        const { error } = await supabase
          .from('seasonal_fruits')
          .insert({
            name: values.name,
            description: values.description,
            image_url: values.image_url || null,
            conservation_tips: values.conservation_tips || null,
            cooking_tips: values.cooking_tips || null,
            family: values.family || null,
            jan: values.jan,
            feb: values.feb,
            mar: values.mar,
            apr: values.apr,
            may: values.may,
            jun: values.jun,
            jul: values.jul,
            aug: values.aug,
            sep: values.sep,
            oct: values.oct,
            nov: values.nov,
            dec: values.dec,
          });

        if (error) throw error;
        
        toast({
          title: "Fruit créé",
          description: `Le fruit ${values.name} a été ajouté au calendrier saisonnier.`,
        });
      }

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
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description du fruit..." className="min-h-[100px]" {...field} />
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
                      <Textarea placeholder="Comment conserver ce fruit..." className="min-h-[100px]" {...field} />
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
                      <Textarea placeholder="Comment préparer ce fruit..." className="min-h-[100px]" {...field} />
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
                <FormField
                  key={month.value}
                  control={form.control}
                  name={month.value as any}
                  render={({ field }) => (
                    <FormItem key={month.value} className="flex items-center space-x-2 rounded-md border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm cursor-pointer flex-grow m-0">
                        {month.label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
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

export default SeasonalFruitForm;
