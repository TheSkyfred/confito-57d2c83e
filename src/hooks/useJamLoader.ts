import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { JamFormData } from "@/hooks/useJamForm";
import { JamType } from "@/types/supabase";
import { RecipeStep } from "@/components/jam-editor/RecipeForm";

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
    cover_image_url: null,
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
          // Enlever la référence à jam_images
          .select(`*`)
          .eq("id", jamId);
        
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

        if (error) {
          console.error("Error loading jam:", error);
          throw error;
        }
        
        if (!jam) {
          toast({
            title: "Confiture non trouvée",
            description: "Cette confiture n'existe pas ou vous n'avez pas les droits d'accès.",
            variant: "destructive",
          });
          navigate("/dashboard", { replace: true });
          return;
        }

        setJamCreatorId(jam.creator_id);
        setIsProJam(jam.is_pro || false);
        
        console.log("Loaded jam data:", jam);
        console.log("Is pro jam:", jam.is_pro);

        const jamWithTypes = jam as unknown as JamType;

        let parsedIngredients: Ingredient[] = [{ name: "", quantity: "" }];
        
        if (jamWithTypes.ingredients) {
          if (Array.isArray(jamWithTypes.ingredients) && jamWithTypes.ingredients.length > 0) {
            if (typeof jamWithTypes.ingredients[0] === 'string') {
              parsedIngredients = jamWithTypes.ingredients.map((ing: unknown) => {
                const ingString = ing as string;
                const [name, quantity] = ingString.split('|');
                return { name: name || ingString, quantity: quantity || '' };
              });
            } else {
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
        
        // Utiliser directement cover_image_url
        const mainImageUrl = jamWithTypes.cover_image_url || null;
        setMainImagePreview(mainImageUrl);
        
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
          is_pro: jamWithTypes.is_pro || false,
          cover_image_url: jamWithTypes.cover_image_url || null,
          status: jamWithTypes.status || 'pending',
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
