import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { JamFormData } from "@/hooks/useJamForm";
import { JamType } from "@/types/supabase";
import { RecipeStep } from "@/components/jam-editor/RecipeForm";

// Define the Ingredient interface to ensure type consistency
interface Ingredient {
  name: string;
  quantity: string;
  is_allergen?: boolean;
}

interface UseJamLoaderProps {
  jamId?: string;
  userId?: string | null;
  isAdmin?: boolean;
  isModerator?: boolean;
}

interface UseJamLoaderResult {
  loading: boolean;
  jamCreatorId: string | null;
  isProJam: boolean;
  mainImagePreview: string | null;
  initialFormData: JamFormData;
}

export const useJamLoader = ({
  jamId,
  userId,
  isAdmin = false,
  isModerator = false,
}: UseJamLoaderProps): UseJamLoaderResult => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jamCreatorId, setJamCreatorId] = useState<string | null>(null);
  const [isProJam, setIsProJam] = useState<boolean>(false);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  
  const [initialFormData, setInitialFormData] = useState<JamFormData>({
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

  useEffect(() => {
    const loadJamData = async () => {
      if (!jamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        let query = supabase
          .from("jams")
          .select(`*, jam_images(*)`)
          .eq("id", jamId);
        
        // Modification principale : les administrateurs peuvent modifier n'importe quelle confiture
        // Les modérateurs peuvent modifier les confitures non-pro uniquement
        if (!isAdmin) {
          if (isModerator) {
            const { data: jamCheck, error: checkError } = await supabase
              .from("jams")
              .select("is_pro")
              .eq("id", jamId)
              .single();
              
            if (checkError) throw checkError;
            
            if (jamCheck.is_pro) {
              toast({
                title: "Accès refusé",
                description: "Seuls les administrateurs peuvent modifier les confitures pro.",
                variant: "destructive",
              });
              navigate("/dashboard", { replace: true });
              return;
            }
          } else {
            query = query.eq("creator_id", userId);
          }
        }
        
        const { data: jam, error } = await query.single();

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

        // Set the creator ID and isProJam flag explicitly from the jam data
        setJamCreatorId(jam.creator_id);
        setIsProJam(jam.is_pro || false);

        const jamWithTypes = jam as unknown as JamType;

        // Parse the ingredients data to ensure it's in the correct format
        let parsedIngredients: Ingredient[] = [{ name: "", quantity: "" }];
        
        if (jamWithTypes.ingredients) {
          if (Array.isArray(jamWithTypes.ingredients) && jamWithTypes.ingredients.length > 0) {
            if (typeof jamWithTypes.ingredients[0] === 'string') {
              // If they're strings, parse them into objects
              parsedIngredients = jamWithTypes.ingredients.map((ing: unknown) => {
                const ingString = ing as string;
                const [name, quantity] = ingString.split('|');
                return { name: name || ingString, quantity: quantity || '' };
              });
            } else {
              // If they're already objects, use them as-is
              parsedIngredients = jamWithTypes.ingredients as unknown as Ingredient[];
            }
          }
        }

        let recipeSteps: RecipeStep[] = [];
        
        if (jamWithTypes.recipe) {
          try {
            const parsedRecipe = JSON.parse(jamWithTypes.recipe);
            if (Array.isArray(parsedRecipe)) {
              recipeSteps = parsedRecipe;
            }
          } catch (e) {
            console.error("Error parsing recipe steps:", e);
          }
        }
        
        let mainImageUrl = null;
        if (jamWithTypes.jam_images && jamWithTypes.jam_images.length > 0) {
          const primaryImage = jamWithTypes.jam_images.find((img: any) => img.is_primary);
          if (primaryImage) {
            mainImageUrl = primaryImage.url;
          } else if (jamWithTypes.jam_images[0]) {
            mainImageUrl = jamWithTypes.jam_images[0].url;
          }
          setMainImagePreview(mainImageUrl);
        }
        
        // Make sure to retrieve the price_euros field for pro jams
        setInitialFormData({
          name: jamWithTypes.name || "",
          description: jamWithTypes.description || "",
          type: jamWithTypes.type || "",
          badges: jamWithTypes.badges || [],
          ingredients: parsedIngredients,
          allergens: jamWithTypes.allergens || [],
          production_date: jamWithTypes.production_date || new Date().toISOString().split("T")[0],
          weight_grams: jamWithTypes.weight_grams || 250,
          available_quantity: jamWithTypes.available_quantity || 1,
          shelf_life_months: jamWithTypes.shelf_life_months || 12,
          special_edition: jamWithTypes.special_edition || false,
          price_credits: jamWithTypes.price_credits || 10,
          price_euros: jamWithTypes.price_euros || null,
          recipe_steps: recipeSteps,
          is_active: jamWithTypes.is_active,
          images: [],
          main_image_index: 0,
          is_pro: jamWithTypes.is_pro || false, // Explicitly set is_pro flag from database
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
    
    loadJamData();
  }, [jamId, userId, isAdmin, isModerator, navigate]);

  return {
    loading,
    jamCreatorId,
    isProJam,
    mainImagePreview,
    initialFormData,
  };
};
