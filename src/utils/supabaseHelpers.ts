
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { RecipeStep, RecipeType } from '@/types/supabase';

// Helper function to safely type Supabase queries
export const getTypedSupabaseQuery = <T extends keyof Database['public']['Tables']>(table: T) => {
  return supabase.from(table);
};

// Helper function to safely handle query results and prevent null reference errors
export const safeQueryResult = <T>(data: T | null): T | null => {
  return data;
};

// Helper function to check if object is null or undefined
export const isNullOrUndefined = (obj: any): boolean => {
  return obj === null || obj === undefined;
};

// Helper function for safely accessing object properties
export const safeAccess = <T extends Record<string, any>, K extends keyof T>(
  obj: T | null | undefined, 
  key: K
): T[K] | undefined => {
  if (isNullOrUndefined(obj)) {
    return undefined;
  }
  return obj[key];
};

// Helper function to safely get profile initials from a username
export const getProfileInitials = (username: string | null | undefined): string => {
  if (!username) return 'U';
  return username.substring(0, 1).toUpperCase();
};

// Helper function to safely access nested properties
export const safeAccessNested = <T extends Record<string, any> | null | undefined>(
  obj: T,
  keys: string[]
): any => {
  let current: any = obj;
  for (const key of keys) {
    if (isNullOrUndefined(current)) {
      return undefined;
    }
    current = current[key];
  }
  return current;
};

// Helper function to parse recipe instructions from JSON to RecipeStep[]
export const parseRecipeInstructions = (instructions: any): RecipeStep[] => {
  if (!instructions) return [];
  
  if (Array.isArray(instructions)) {
    return instructions.map((item, index) => {
      if (typeof item === 'object' && item.step && item.description) {
        return item as RecipeStep;
      }
      return { step: index + 1, description: String(item) };
    });
  }
  
  try {
    // Si c'est une chaîne JSON, essayer de la parser
    if (typeof instructions === 'string') {
      const parsed = JSON.parse(instructions);
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => {
          if (typeof item === 'object' && item.step && item.description) {
            return item as RecipeStep;
          }
          return { step: index + 1, description: String(item) };
        });
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse des instructions:", error);
  }
  
  // Fallback: retourner un tableau vide
  return [];
};

// Helper function to adapt database recipe to RecipeType
export const adaptDbRecipeToRecipeType = (dbRecipe: any): RecipeType => {
  return {
    ...dbRecipe,
    instructions: parseRecipeInstructions(dbRecipe.instructions),
    // S'assurer que les autres champs nécessaires sont bien définis
    difficulty: dbRecipe.difficulty || 'facile',
    status: dbRecipe.status || 'brouillon',
    season: dbRecipe.season || 'toutes_saisons',
    style: dbRecipe.style || 'fruitée',
    average_rating: dbRecipe.average_rating || 0,
    is_favorite: dbRecipe.is_favorite || false
  };
};
