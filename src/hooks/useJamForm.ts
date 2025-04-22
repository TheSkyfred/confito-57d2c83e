
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { RecipeStep } from "@/components/jam-editor/RecipeForm";

interface Ingredient {
  name: string;
  quantity: string;
  is_allergen?: boolean;
}

export interface JamFormData {
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
  price_euros?: number | null; // Added price_euros field for pro jams
  recipe_steps: RecipeStep[];
  is_active: boolean;
  images: File[];
  main_image_index: number;
  is_pro?: boolean; // Added is_pro flag
  cover_image_url?: string | null; // Added cover_image_url field
}

export interface UseJamFormProps {
  initialJamId?: string;
  jamCreatorId?: string | null;
  isProJam?: boolean;
  isAdmin?: boolean;
}

export const useJamForm = ({ 
  initialJamId, 
  jamCreatorId, 
  isProJam = false, 
  isAdmin = false 
}: UseJamFormProps = {}) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  
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
    price_euros: isProJam ? 10 : null, // Initialize price_euros if pro
    recipe_steps: [],
    is_active: false,
    images: [],
    main_image_index: 0,
    is_pro: isProJam, // Initialize with the provided value
    cover_image_url: null, // Initialize cover_image_url field
  });

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // If updating cover_image_url, also update the main image preview
    if (key === 'cover_image_url' && typeof value === 'string') {
      setMainImagePreview(value);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setMainImagePreview(imageUrl);
      
      updateFormData('images', [file]);
      updateFormData('main_image_index', 0);
      
      // Clear the cover_image_url when a new file is uploaded
      // The new URL will be set after upload
      updateFormData('cover_image_url', null);
    }
  };

  const handleImageUpload = async (jamId: string) => {
    try {
      // If a new image is uploaded, update the cover_image_url
      if (formData.images.length > 0) {
        const file = formData.images[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${jamId}_cover.${fileExt}`;
        const filePath = `jams/covers/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('jam-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('jam-images')
          .getPublicUrl(filePath);

        if (!publicUrlData.publicUrl) {
          throw new Error('Failed to get public URL');
        }

        // Update cover_image_url in the jams table
        const { error: updateError } = await supabase
          .from('jams')
          .update({ cover_image_url: publicUrlData.publicUrl })
          .eq('id', jamId);

        if (updateError) {
          throw updateError;
        }

        return publicUrlData.publicUrl;
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image de couverture",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSubmit = async (publish: boolean = false) => {
    try {
      setSaving(true);
      
      const ingredientsForStorage = formData.ingredients.map(
        ing => `${ing.name}|${ing.quantity}`
      );
      
      const recipeString = JSON.stringify(formData.recipe_steps);
      
      // Ensure both price fields are included, but one will be null based on is_pro
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
        price_credits: formData.is_pro ? null : formData.price_credits,
        price_euros: formData.is_pro ? formData.price_euros || formData.price_credits : null,
        recipe: recipeString,
        is_active: publish,
        is_pro: formData.is_pro,
        cover_image_url: formData.cover_image_url, // Include cover_image_url in the update
      };
      
      let jam_id = initialJamId;
      
      if (initialJamId) {
        const { error: updateError } = await supabase
          .from("jams")
          .update(jamData)
          .eq("id", initialJamId);
          
        if (updateError) throw updateError;
      } else {
        const { data: newJam, error: insertError } = await supabase
          .from("jams")
          .insert({
            ...jamData,
            creator_id: jamCreatorId,
          })
          .select();
          
        if (insertError) throw insertError;
        if (newJam && newJam.length > 0) {
          jam_id = newJam[0].id;
        }
      }
      
      // Handle the cover image upload if there are new images
      if (formData.images.length > 0 && jam_id) {
        const uploadedImageUrl = await handleImageUpload(jam_id);
        if (uploadedImageUrl) {
          // Update the form data with the new URL
          updateFormData('cover_image_url', uploadedImageUrl);
        }
      }

      toast({
        title: initialJamId ? "Modifications enregistrées" : "Confiture créée",
        description: publish 
          ? "Votre confiture est maintenant publiée" 
          : "Votre confiture a été enregistrée en brouillon",
      });
      
      if (isAdmin) {
        navigate(`/admin/jams`);
      } else {
        navigate(publish ? `/jam/${jam_id}` : "/dashboard");
      }
      return true;
    } catch (error: any) {
      console.error("Error saving jam:", error);
      toast({
        title: "Erreur d'enregistrement",
        description: error.message || "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    updateFormData,
    handleSubmit,
    saving,
    mainImagePreview,
    handleImageChange,
  };
};
