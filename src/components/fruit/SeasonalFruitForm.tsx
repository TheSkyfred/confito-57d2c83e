
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Image as ImageIcon, Upload } from "lucide-react";

// Schéma de validation pour le formulaire
const fruitFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  description: z.string().optional(),
  image_url: z.string().optional().or(z.literal('')),
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(fruit?.image_url || null);
  
  console.log("Current fruit data:", fruit);
  
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Valider le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide.",
        variant: "destructive",
      });
      return;
    }
    
    // Créer un aperçu de l'image
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setImageFile(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `fruits/${fileName}`;

      // Uploader vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      console.log("Image uploaded successfully, URL:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader l'image",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const onFormSubmit = async (values: FruitFormValues) => {
    console.log("Form submitted with values:", values);
    setIsLoading(true);
    try {
      // Si une nouvelle image a été sélectionnée, l'uploader
      let imageUrl = values.image_url;
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (imageError: any) {
          // Si l'upload d'image échoue mais que le reste du formulaire est valide,
          // on permet à l'utilisateur de continuer sans image
          toast({
            title: "Avertissement",
            description: `L'image n'a pas pu être téléchargée, mais le fruit sera créé sans image: ${imageError.message}`,
          });
        }
      }

      const fruitData = {
        name: values.name,
        description: values.description,
        image_url: imageUrl,
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
      };
      
      console.log("Data to be saved:", fruitData);

      if (fruit?.id) {
        // Mise à jour d'un fruit existant
        console.log("Updating existing fruit with ID:", fruit.id);
        const { error } = await supabase
          .from('seasonal_fruits')
          .update(fruitData)
          .eq('id', fruit.id);

        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        
        toast({
          title: "Fruit mis à jour",
          description: `Les informations de ${values.name} ont été mises à jour avec succès.`,
        });
      } else {
        // Création d'un nouveau fruit
        console.log("Creating new fruit");
        const { error } = await supabase
          .from('seasonal_fruits')
          .insert(fruitData);

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        
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

              <div className="space-y-2">
                <FormLabel>Image du fruit</FormLabel>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex flex-col items-center space-y-2">
                    {previewUrl ? (
                      <div className="relative w-full">
                        <img 
                          src={previewUrl} 
                          alt="Aperçu" 
                          className="mx-auto max-h-[200px] rounded object-cover" 
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-white dark:bg-gray-800"
                          onClick={() => {
                            setPreviewUrl(null);
                            setImageFile(null);
                            form.setValue('image_url', '');
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Choisir une image
                          </Button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            PNG, JPG ou WEBP
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
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
            <Button type="submit" disabled={isLoading || uploading}>
              {(isLoading || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {fruit ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SeasonalFruitForm;
