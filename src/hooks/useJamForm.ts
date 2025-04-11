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
  });

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setMainImagePreview(imageUrl);
      
      updateFormData('images', [file]);
      updateFormData('main_image_index', 0);
    }
  };

  const handleSubmit = async (publish: boolean = false): Promise<boolean | void> => {
    try {
      setSaving(true);
      
      const ingredientsForStorage = formData.ingredients.map(
        ing => `${ing.name}|${ing.quantity}`
      );
      
      const recipeString = JSON.stringify(formData.recipe_steps);
      
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
      
      if (formData.images.length > 0 && jam_id) {
        await handleImageUpload(jam_id, formData.images, formData.main_image_index, jamCreatorId);
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
  
  const handleImageUpload = async (
    jamId: string,
    images: File[],
    mainImageIndex: number,
    creatorId: string | null
  ) => {
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const isMainImage = i === mainImageIndex;
      
      const filePath = `jams/${jamId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("jam-images")
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from("jam-images")
        .getPublicUrl(filePath);
        
      if (!publicUrlData) {
        throw new Error("Failed to get public URL for uploaded image");
      }
      
      const publicUrl = publicUrlData.publicUrl;
      
      try {
        const { error: imageInsertError } = await supabase.rpc('insert_jam_image', {
          p_jam_id: jamId,
          p_url: publicUrl,
          p_is_primary: isMainImage,
          p_creator_id: creatorId
        });
        
        if (imageInsertError && imageInsertError.message.includes('function "insert_jam_image" does not exist')) {
          const { error: directInsertError } = await supabase
            .from("jam_images")
            .insert({
              jam_id: jamId,
              url: publicUrl,
              is_primary: isMainImage
            });
            
          if (directInsertError) throw directInsertError;
        } else if (imageInsertError) {
          throw imageInsertError;
        }
      } catch (error) {
        throw error;
      }
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
