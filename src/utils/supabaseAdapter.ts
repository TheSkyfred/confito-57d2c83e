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
   * @param table Le nom de la table
   * @param query La requête (par défaut: '*')
   * @returns Un objet contenant les données ou une erreur
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
   * Filtre les résultats d'une table selon une condition d'égalité
   * @param table Le nom de la table
   * @param column La colonne à filtrer
   * @param value La valeur à rechercher
   * @param query La requête (par défaut: '*')
   */
  async selectWhere(table: string, column: string, value: any, query = '*') {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .select(query)
        .eq(column, value);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la requête SELECT WHERE sur ${table}:`, error);
      return { data: null, error };
    }
  },
  
  /**
   * Filtre les résultats d'une table selon plusieurs valeurs possibles
   * @param table Le nom de la table
   * @param column La colonne à filtrer
   * @param values Les valeurs possibles
   * @param query La requête (par défaut: '*')
   */
  async selectWhereIn(table: string, column: string, values: any[], query = '*') {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .select(query)
        .in(column, values);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la requête SELECT WHERE IN sur ${table}:`, error);
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
