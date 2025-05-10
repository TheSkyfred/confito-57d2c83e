import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { RecipeStep } from "@/components/jam-editor/RecipeForm";

export interface JamFormData {
  name: string;
  description: string;
  type: string;
  ingredients: { name: string; quantity: string; is_allergen?: boolean }[];
  allergens: string[];
  weight_grams: number;
  available_quantity: number;
  price_credits: number;
  previous_price_credits?: number; // To store the previous value when switching to pro
  price_euros?: number | null;
  production_date: string;
  shelf_life_months: number;
  special_edition: boolean;
  is_active: boolean;
  recipe_steps: RecipeStep[];
  images: File[];
  main_image_index: number;
  cover_image_url?: string | null;
  badges?: string[];
  is_pro?: boolean;
  status?: string;
}

interface UseJamFormOptions {
  initialJamId?: string;
  jamCreatorId: string | null;
  isProJam?: boolean;
  isAdmin?: boolean;
}

export const useJamForm = ({
  initialJamId,
  jamCreatorId,
  isProJam = false,
  isAdmin = false,
}: UseJamFormOptions) => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
    is_pro: isProJam || false,
    status: 'pending',
  });

  const [saving, setSaving] = useState<boolean>(false);

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  const uploadImage = async (imageFile: File, jamId: string): Promise<string | null> => {
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${jamId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('jam-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return null;
      }

      const { data } = supabase.storage.from('jam-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error("Error in image upload:", error);
      return null;
    }
  };

  const handleSubmit = async (publish = false): Promise<boolean> => {
    try {
      setSaving(true);
      console.log("Submitting jam form data:", formData);
      console.log("Status being saved:", formData.status);
      console.log("Is pro:", formData.is_pro);
      console.log("Price credits:", formData.price_credits);
      console.log("Price euros:", formData.price_euros);
      console.log("Cover image URL being saved:", formData.cover_image_url);

      // Validate required fields
      if (!formData.name.trim()) {
        toast({
          title: "Champ requis",
          description: "Le nom de la confiture est obligatoire",
          variant: "destructive",
        });
        setSaving(false);
        return false;
      }

      // Format ingredients
      const formattedIngredients = formData.ingredients.filter(
        (ing) => ing.name.trim() !== ""
      );

      if (formattedIngredients.length === 0) {
        toast({
          title: "Ingrédients requis",
          description: "Veuillez ajouter au moins un ingrédient",
          variant: "destructive",
        });
        setSaving(false);
        return false;
      }

      // Format recipe steps
      const formattedRecipeSteps = formData.recipe_steps.length
        ? JSON.stringify(formData.recipe_steps)
        : null;

      // Prepare data for Supabase
      const jamData: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type || null,
        ingredients: formattedIngredients,
        allergens: formData.allergens.length ? formData.allergens : null,
        weight_grams: formData.weight_grams,
        available_quantity: formData.available_quantity,
        // For pro jams, always keep price_credits as 0 to avoid null constraint violation
        price_credits: formData.is_pro ? 0 : formData.price_credits,
        price_euros: formData.is_pro ? formData.price_euros : null,
        production_date: formData.production_date,
        shelf_life_months: formData.shelf_life_months,
        special_edition: formData.special_edition,
        recipe: formattedRecipeSteps,
        is_active: publish ? true : formData.is_active,
        badges: formData.badges,
        status: formData.status || 'pending',
        is_pro: formData.is_pro || false,
        cover_image_url: formData.cover_image_url,
      };

      console.log("Data being sent to Supabase:", jamData);

      // Different logic for create vs update
      let jamId = initialJamId;

      if (jamId) {
        // Update existing jam
        const { error } = await supabase
          .from("jams")
          .update(jamData)
          .eq("id", jamId);

        if (error) throw error;
      } else {
        // Create new jam
        jamData.creator_id = jamCreatorId;

        const { data, error } = await supabase
          .from("jams")
          .insert(jamData)
          .select("id")
          .single();

        if (error) throw error;
        jamId = data.id;
      }

      // Handle image uploads if we have new images
      if (formData.images.length > 0) {
        if (!jamId) {
          throw new Error("ID de confiture manquant pour le téléchargement d'image");
        }

        // Upload the selected main image first
        const mainImageFile = formData.images[formData.main_image_index];
        const mainImageUrl = await uploadImage(mainImageFile, jamId);

        if (mainImageUrl) {
          // Update the jam with the cover image URL
          await supabase
            .from("jams")
            .update({ cover_image_url: mainImageUrl })
            .eq("id", jamId);
        }
      }

      toast({
        title: "Succès",
        description: initialJamId
          ? "Confiture mise à jour avec succès"
          : "Confiture créée avec succès",
      });

      // Navigate to the appropriate page based on user role
      if (isAdmin) {
        navigate(`/admin/jams`);
      } else {
        navigate(`/jam/${jamId}`);
      }

      setSaving(false);
      return true;
    } catch (error: any) {
      console.error("Error saving jam:", error);
      toast({
        title: "Erreur",
        description: `Erreur lors de l'enregistrement: ${error.message}`,
        variant: "destructive",
      });
      setSaving(false);
      return false;
    }
  };

  return {
    formData,
    updateFormData,
    handleSubmit,
    saving,
    handleImageChange,
  };
};
