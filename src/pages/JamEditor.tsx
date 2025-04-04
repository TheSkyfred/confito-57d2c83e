
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { JamType } from "@/types/supabase";
import { RecipeStep } from "@/components/jam-editor/RecipeForm";

import BasicInfoForm from "@/components/jam-editor/BasicInfoForm";
import IngredientsForm from "@/components/jam-editor/IngredientsForm";
import ManufacturingForm from "@/components/jam-editor/ManufacturingForm";
import PricingForm from "@/components/jam-editor/PricingForm";
import RecipeForm from "@/components/jam-editor/RecipeForm";
import VisibilityForm from "@/components/jam-editor/VisibilityForm";
import JamPreview from "@/components/jam-editor/JamPreview";

// Type definitions
interface Ingredient {
  name: string;
  quantity: string;
}

interface JamFormData {
  name: string;
  description: string;
  type: string;
  badges: string[];
  ingredients: Ingredient[];
  allergens: string[];
  production_date: string;
  weight_grams: number;
  available_quantity: number;
  shelf_life_months: number;
  special_edition: boolean;
  price_credits: number;
  recipe_steps: RecipeStep[];
  is_active: boolean;
  images: File[];
  main_image_index: number;
}

const JamEditor: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "basic-info",
  ]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  // Initialize form data
  const [formData, setFormData] = useState<JamFormData>({
    name: "",
    description: "",
    type: "",
    badges: [],
    ingredients: [{ name: "", quantity: "" }],
    allergens: [],
    production_date: new Date().toISOString().split("T")[0],
    weight_grams: 250,
    available_quantity: 1,
    shelf_life_months: 12,
    special_edition: false,
    price_credits: 10,
    recipe_steps: [],
    is_active: false,
    images: [],
    main_image_index: 0,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
    } else if (isEditMode) {
      loadJamData();
    } else {
      setLoading(false);
    }
  }, [user, isEditMode]);

  // Handle image upload
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setMainImagePreview(imageUrl);
      
      updateFormData('images', [file]);
      updateFormData('main_image_index', 0);
    }
  };

  // Load existing jam data for editing
  const loadJamData = async () => {
    try {
      setLoading(true);
      
      const { data: jam, error } = await supabase
        .from("jams")
        .select(`*, jam_images(*)`)
        .eq("id", id)
        .eq("creator_id", user?.id)
        .single();

      if (error) throw error;
      
      if (!jam) {
        toast({
          title: "Confiture non trouvée",
          description: "Cette confiture n'existe pas ou vous n'avez pas les droits d'accès.",
          variant: "destructive",
        });
        navigate("/dashboard", { replace: true });
        return;
      }

      // Convert ingredients from string[] to Ingredient[]
      const ingredients = jam.ingredients 
        ? typeof jam.ingredients[0] === 'string' 
          ? jam.ingredients.map((ing: string) => {
              const [name, quantity] = ing.split('|');
              return { name: name || ing, quantity: quantity || '' };
            })
          : jam.ingredients 
        : [{ name: "", quantity: "" }];

      // Format recipe steps from recipe field if available
      let recipeSteps: RecipeStep[] = [];
      
      if (jam.recipe) {
        try {
          const parsedRecipe = JSON.parse(jam.recipe);
          if (Array.isArray(parsedRecipe)) {
            recipeSteps = parsedRecipe;
          }
        } catch (e) {
          console.error("Error parsing recipe steps:", e);
        }
      }
      
      // Get image URL from jam_images
      let mainImageUrl = null;
      if (jam.jam_images && jam.jam_images.length > 0) {
        const primaryImage = jam.jam_images.find((img: any) => img.is_primary);
        if (primaryImage) {
          mainImageUrl = primaryImage.url;
        } else if (jam.jam_images[0]) {
          mainImageUrl = jam.jam_images[0].url;
        }
        setMainImagePreview(mainImageUrl);
      }
      
      setFormData({
        name: jam.name || "",
        description: jam.description || "",
        type: jam.type || "",
        badges: jam.badges || [],
        ingredients: ingredients,
        allergens: jam.allergens || [],
        production_date: jam.production_date || new Date().toISOString().split("T")[0],
        weight_grams: jam.weight_grams || 250,
        available_quantity: jam.available_quantity || 1,
        shelf_life_months: jam.shelf_life_months || 12,
        special_edition: jam.special_edition || false,
        price_credits: jam.price_credits || 10,
        recipe_steps: recipeSteps,
        is_active: jam.is_active,
        images: [],
        main_image_index: 0,
      });
      
      setLoading(false);
    } catch (error: any) {
      console.error("Error loading jam data:", error);
      toast({
        title: "Erreur de chargement",
        description: error.message || "Impossible de charger les données de la confiture",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (publish: boolean = false) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Format ingredients for storage
      const ingredientsForStorage = formData.ingredients.map(
        ing => `${ing.name}|${ing.quantity}`
      );
      
      // Format recipe steps as JSON string
      const recipeString = JSON.stringify(formData.recipe_steps);
      
      // Prepare jam data
      const jamData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        badges: formData.badges,
        ingredients: ingredientsForStorage,
        allergens: formData.allergens,
        weight_grams: formData.weight_grams,
        available_quantity: formData.available_quantity,
        production_date: formData.production_date,
        shelf_life_months: formData.shelf_life_months,
        special_edition: formData.special_edition,
        price_credits: formData.price_credits,
        recipe: recipeString,
        is_active: publish,
        creator_id: user.id,
      };

      let jam_id = id;
      
      // Create or update jam in database
      if (isEditMode) {
        const { error: updateError } = await supabase
          .from("jams")
          .update(jamData)
          .eq("id", id);
          
        if (updateError) throw updateError;
      } else {
        const { data: newJam, error: insertError } = await supabase
          .from("jams")
          .insert(jamData)
          .select();
          
        if (insertError) throw insertError;
        if (newJam && newJam.length > 0) {
          jam_id = newJam[0].id;
        }
      }
      
      // Handle image uploads
      if (formData.images.length > 0 && jam_id) {
        // Upload each image
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i];
          const isMainImage = i === formData.main_image_index;
          
          const filePath = `jams/${jam_id}/${Date.now()}_${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from("jam-images")
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: publicUrl } = supabase.storage
            .from("jam-images")
            .getPublicUrl(filePath);
            
          // Insert image reference to database
          const { error: imageInsertError } = await supabase
            .from("jam_images")
            .insert({
              jam_id: jam_id,
              url: publicUrl.publicUrl,
              is_primary: isMainImage
            });
            
          if (imageInsertError) throw imageInsertError;
        }
      }

      toast({
        title: isEditMode ? "Modifications enregistrées" : "Confiture créée",
        description: publish 
          ? "Votre confiture est maintenant publiée" 
          : "Votre confiture a été enregistrée en brouillon",
      });
      
      // Navigate to jam details or dashboard
      navigate(publish ? `/jam/${jam_id}` : "/dashboard");
    } catch (error: any) {
      console.error("Error saving jam:", error);
      toast({
        title: "Erreur d'enregistrement",
        description: error.message || "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prevSections => 
      prevSections.includes(section) 
        ? prevSections.filter(s => s !== section) 
        : [...prevSections, section]
    );
  };

  // Update form data
  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p>Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-jam-raspberry">
              {isEditMode ? "Modifier la confiture" : "Créer une confiture"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode 
                ? "Mettez à jour les informations de votre confiture" 
                : "Partagez votre délicieuse création avec la communauté"}
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Éditer</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator />

        <TabsContent value="edit" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            <div className="lg:col-span-4">
              <Accordion
                type="multiple"
                value={expandedSections}
                onValueChange={setExpandedSections}
                className="w-full"
              >
                <AccordionItem value="basic-info">
                  <AccordionTrigger>Informations de base</AccordionTrigger>
                  <AccordionContent>
                    <BasicInfoForm 
                      formData={formData} 
                      updateFormData={updateFormData}
                      mainImagePreview={mainImagePreview}
                      handleImageChange={handleImageChange}
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="ingredients">
                  <AccordionTrigger>Ingrédients</AccordionTrigger>
                  <AccordionContent>
                    <IngredientsForm 
                      formData={formData} 
                      updateFormData={updateFormData} 
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="manufacturing">
                  <AccordionTrigger>Données de fabrication</AccordionTrigger>
                  <AccordionContent>
                    <ManufacturingForm 
                      formData={formData} 
                      updateFormData={updateFormData} 
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="pricing">
                  <AccordionTrigger>Prix</AccordionTrigger>
                  <AccordionContent>
                    <PricingForm 
                      formData={formData} 
                      updateFormData={updateFormData}
                      suggestedPrice={null}
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="recipe">
                  <AccordionTrigger>Recette (facultatif)</AccordionTrigger>
                  <AccordionContent>
                    <RecipeForm 
                      formData={formData} 
                      updateFormData={updateFormData} 
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Card className="mt-6 p-4">
                <VisibilityForm 
                  saving={saving} 
                  handleSubmit={handleSubmit}
                  isEditMode={isEditMode} 
                />
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <div className="sticky top-20">
                <Card>
                  <div className="p-4">
                    <h3 className="font-medium mb-3">Aperçu</h3>
                    <JamPreview formData={formData} />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <Card>
            <div className="p-6">
              <JamPreview formData={formData} fullPreview={true} />
              
              <div className="mt-8 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setActiveTab("edit")}>
                  Retour à l'édition
                </Button>
                <Button 
                  disabled={saving} 
                  onClick={() => handleSubmit(false)}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer en brouillon
                </Button>
                <Button 
                  variant="default" 
                  disabled={saving || !formData.name} 
                  onClick={() => handleSubmit(true)}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publier
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </div>
    </div>
  );
};

export default JamEditor;
