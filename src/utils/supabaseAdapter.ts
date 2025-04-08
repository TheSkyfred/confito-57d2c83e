
import { supabase } from '@/integrations/supabase/client';

/**
 * Utilitaire pour effectuer des requêtes directes aux nouvelles tables de Supabase
 * sans avoir à se soucier des erreurs de type.
 * 
 * Cette classe sert d'intermédiaire temporaire en attendant que les types générés par Supabase
 * soient mis à jour.
 */
export const supabaseDirect = {
  from: (table: string) => supabase.from(table as any),
  
  /**
   * Récupère les données d'une table en contournant les vérifications de type
   */
  async select(table: string, query = '*') {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .select(query);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la requête SELECT sur ${table}:`, error);
      return { data: null, error };
    }
  },
  
  /**
   * Insère des données dans une table en contournant les vérifications de type
   */
  async insert(table: string, values: any) {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .insert(values);
        
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la requête INSERT sur ${table}:`, error);
      return { data: null, error };
    }
  },
  
  /**
   * Met à jour des données dans une table en contournant les vérifications de type
   */
  async update(table: string, values: any, match: Record<string, any>) {
    try {
      const query = supabase
        .from(table as any)
        .update(values);
        
      // Appliquer les conditions
      Object.entries(match).forEach(([key, value]) => {
        query.eq(key, value);
      });
        
      const { data, error } = await query;
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la requête UPDATE sur ${table}:`, error);
      return { data: null, error };
    }
  },
  
  /**
   * Supprime des données dans une table en contournant les vérifications de type
   */
  async delete(table: string, match: Record<string, any>) {
    try {
      const query = supabase
        .from(table as any)
        .delete();
        
      // Appliquer les conditions
      Object.entries(match).forEach(([key, value]) => {
        query.eq(key, value);
      });
        
      const { data, error } = await query;
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la requête DELETE sur ${table}:`, error);
      return { data: null, error };
    }
  }
};
