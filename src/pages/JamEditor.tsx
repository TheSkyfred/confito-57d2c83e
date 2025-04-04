
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { JamType } from '@/types/supabase';

import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload, 
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

import BasicInfoForm from '@/components/jam-editor/BasicInfoForm';
import IngredientsForm from '@/components/jam-editor/IngredientsForm';
import ManufacturingForm from '@/components/jam-editor/ManufacturingForm';
import PricingForm from '@/components/jam-editor/PricingForm';
import RecipeForm from '@/components/jam-editor/RecipeForm';
import VisibilityForm from '@/components/jam-editor/VisibilityForm';
import JamPreview from '@/components/jam-editor/JamPreview';

// Validation schema for the jam form
const jamSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1, "L'ingrédient doit avoir un nom"),
    quantity: z.string().optional(),
    is_allergen: z.boolean().default(false),
  })),
  packaging_date: z.date().optional(),
  weight_grams: z.number().min(1, "Le poids doit être supérieur à 0"),
  available_quantity: z.number().min(0, "La quantité disponible doit être positive"),
  preservation_months: z.number().optional(),
  special_jar: z.boolean().default(false),
  price_credits: z.number().min(1, "Le prix doit être supérieur à 0"),
  recipe_steps: z.array(z.object({
    description: z.string(),
    duration_minutes: z.number().optional(),
    image_url: z.string().optional(),
  })).optional(),
  is_draft: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

type JamFormData = z.infer<typeof jamSchema>;

const JamEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("basic-info");
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<JamFormData | null>(null);
  
  // Initialize form
  const methods = useForm<JamFormData>({
    resolver: zodResolver(jamSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'classic',
      tags: [],
      ingredients: [{ name: '', quantity: '', is_allergen: false }],
      packaging_date: new Date(),
      weight_grams: 250,
      available_quantity: 1,
      preservation_months: 12,
      special_jar: false,
      price_credits: 10,
      recipe_steps: [{ description: '', duration_minutes: 0, image_url: '' }],
      is_draft: true,
      is_active: true,
    }
  });

  // Load jam data if editing
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadJamData = async () => {
      if (isEditing && id) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('jams')
            .select(`
              *,
              jam_images(*)
            `)
            .eq('id', id)
            .eq('creator_id', user.id)
            .single();

          if (error) throw error;
          if (!data) {
            toast({
              title: "Erreur",
              description: "Cette confiture n'existe pas ou ne vous appartient pas.",
              variant: "destructive"
            });
            navigate('/dashboard');
            return;
          }

          // Transform data for form
          const formData: Partial<JamFormData> = {
            name: data.name,
            description: data.description || '',
            category: data.category || 'classic',
            ingredients: data.ingredients.map((ingredient: any) => ({
              name: ingredient.name,
              quantity: ingredient.quantity || '',
              is_allergen: data.allergens?.includes(ingredient.name) || false,
            })),
            weight_grams: data.weight_grams,
            available_quantity: data.available_quantity,
            price_credits: data.price_credits,
            recipe_steps: data.recipe_steps || [],
            is_draft: !data.is_active,
            is_active: data.is_active,
          };

          // Set main image preview if it exists
          const primaryImage = data.jam_images?.find((img: any) => img.is_primary);
          if (primaryImage) {
            setMainImagePreview(primaryImage.url);
          }

          methods.reset(formData as JamFormData);
        } catch (error) {
          console.error('Error loading jam:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données de la confiture.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadJamData();
  }, [id, isEditing, user, navigate, toast, methods]);

  // Handle main image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // Calculate suggested price based on form data
  const calculateSuggestedPrice = (data: JamFormData) => {
    let basePrice = Math.floor(data.weight_grams / 50); // 1 credit per 50g
    
    // Adjust for rare or special ingredients
    const rareIngredients = ['truffe', 'safran', 'vanille', 'champagne', 'or'];
    const hasRareIngredient = data.ingredients.some(ing => 
      rareIngredients.some(rare => ing.name.toLowerCase().includes(rare))
    );
    
    if (hasRareIngredient) basePrice *= 1.5;
    
    // Adjust for special jar
    if (data.special_jar) basePrice += 5;
    
    // Adjust for complexity (based on recipe steps)
    if (data.recipe_steps && data.recipe_steps.length > 5) {
      basePrice += 2;
    }
    
    return Math.max(5, Math.round(basePrice)); // Minimum 5 credits
  };

  // Update suggested price when relevant fields change
  useEffect(() => {
    const subscription = methods.watch((data) => {
      if (data.weight_grams && data.ingredients.length > 0) {
        setSuggestedPrice(calculateSuggestedPrice(data as JamFormData));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [methods]);

  // Handle form submission
  const onSubmit = async (data: JamFormData) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une confiture.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Extract allergens from ingredients
      const allergens = data.ingredients
        .filter(ing => ing.is_allergen)
        .map(ing => ing.name);
      
      // Format ingredients for database
      const ingredients = data.ingredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity
      }));
      
      // Format recipe steps for database
      const recipe = data.recipe_steps && data.recipe_steps.length > 0 
        ? JSON.stringify(data.recipe_steps)
        : null;
      
      // Prepare jam data
      const jamData = {
        name: data.name,
        description: data.description || '',
        ingredients,
        allergens,
        weight_grams: data.weight_grams,
        available_quantity: data.available_quantity,
        price_credits: data.price_credits,
        recipe,
        is_active: !data.is_draft,
        creator_id: user.id,
      };
      
      let jamId = id;
      
      // Insert or update jam data
      if (isEditing && id) {
        const { error } = await supabase
          .from('jams')
          .update(jamData)
          .eq('id', id);
          
        if (error) throw error;
      } else {
        const { data: newJam, error } = await supabase
          .from('jams')
          .insert(jamData)
          .select('id')
          .single();
          
        if (error) throw error;
        jamId = newJam.id;
      }
      
      // Handle image upload if new image is selected
      if (mainImage && jamId) {
        // Create a unique file name
        const fileExt = mainImage.name.split('.').pop();
        const fileName = `${jamId}-main-${Date.now()}.${fileExt}`;
        const filePath = `jam-images/${fileName}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase
          .storage
          .from('jams')
          .upload(filePath, mainImage);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase
          .storage
          .from('jams')
          .getPublicUrl(filePath);
          
        const imageUrl = publicUrlData.publicUrl;
        
        // Update or insert the image record in jam_images table
        if (isEditing) {
          // Check if primary image already exists
          const { data: existingImages } = await supabase
            .from('jam_images')
            .select('id')
            .eq('jam_id', jamId)
            .eq('is_primary', true);
            
          if (existingImages && existingImages.length > 0) {
            // Update existing primary image
            await supabase
              .from('jam_images')
              .update({ url: imageUrl })
              .eq('id', existingImages[0].id);
          } else {
            // Insert new primary image
            await supabase
              .from('jam_images')
              .insert({
                jam_id: jamId,
                url: imageUrl,
                is_primary: true
              });
          }
        } else {
          // Insert new primary image for new jam
          await supabase
            .from('jam_images')
            .insert({
              jam_id: jamId,
              url: imageUrl,
              is_primary: true
            });
        }
      }
      
      toast({
        title: isEditing ? "Confiture mise à jour !" : "Confiture créée !",
        description: data.is_draft 
          ? "Votre confiture a été enregistrée comme brouillon." 
          : "Votre confiture a été publiée avec succès.",
        variant: "default"
      });
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error saving jam:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle preview generation
  const handlePreview = () => {
    const currentData = methods.getValues();
    setPreviewData(currentData);
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="font-serif text-3xl font-bold">
          {isEditing ? "Modifier la confiture" : "Créer une nouvelle confiture"}
        </h1>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="editor">Éditeur</TabsTrigger>
          <TabsTrigger value="preview" onClick={handlePreview}>Aperçu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <Accordion
                type="single"
                collapsible
                defaultValue={activeSection}
                onValueChange={setActiveSection}
                className="w-full"
              >
                <AccordionItem value="basic-info">
                  <AccordionTrigger>Informations de base</AccordionTrigger>
                  <AccordionContent>
                    <BasicInfoForm 
                      mainImagePreview={mainImagePreview}
                      handleImageChange={handleImageChange}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ingredients">
                  <AccordionTrigger>Ingrédients</AccordionTrigger>
                  <AccordionContent>
                    <IngredientsForm />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="manufacturing">
                  <AccordionTrigger>Données de fabrication</AccordionTrigger>
                  <AccordionContent>
                    <ManufacturingForm />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pricing">
                  <AccordionTrigger>Prix</AccordionTrigger>
                  <AccordionContent>
                    <PricingForm suggestedPrice={suggestedPrice} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="recipe">
                  <AccordionTrigger>Recette (facultatif)</AccordionTrigger>
                  <AccordionContent>
                    <RecipeForm />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="visibility">
                  <AccordionTrigger>Visibilité et publication</AccordionTrigger>
                  <AccordionContent>
                    <VisibilityForm />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => navigate('/dashboard')}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isLoading}
                  onClick={() => {
                    methods.setValue("is_draft", true);
                    methods.handleSubmit(onSubmit)();
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer en brouillon
                </Button>
                <Button
                  type="submit"
                  className="bg-jam-raspberry hover:bg-jam-raspberry/90"
                  disabled={isLoading}
                  onClick={() => {
                    methods.setValue("is_draft", false);
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-pulse mr-2">⏳</span>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Publier
                    </>
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </TabsContent>
        
        <TabsContent value="preview">
          {previewData ? (
            <JamPreview data={previewData} imageUrl={mainImagePreview} />
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg">Aucun aperçu disponible. Veuillez remplir le formulaire d'abord.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JamEditor;
