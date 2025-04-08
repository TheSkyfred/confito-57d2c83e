
import { supabase } from '@/integrations/supabase/client';

export const supabaseDirect = {
  from: (table: string) => supabase.from(table as any),
  
  /**
   * Récupère les données d'une table en contournant les vérifications de type
   * @param table Le nom de la table
   * @param query La requête (par défaut: '*')
   * @param filter Filtre optionnel pour la clause WHERE
   * @returns Un objet contenant les données ou une erreur
   */
  async select(table: string, query: string | Record<string, any> = '*', filter?: Record<string, any> | string) {
    try {
      // If the second argument is an object and no third argument is provided, treat it as a filter
      if (typeof query === 'object' && filter === undefined) {
        filter = query;
        query = '*';
      }
      
      let queryBuilder = supabase
        .from(table as any)
        .select(query as string); // Add type assertion here to fix the error
        
      if (filter) {
        if (typeof filter === 'string') {
          // Handle string filter (raw filter string like "status=eq.active")
          const parts = filter.split(',');
          for (const part of parts) {
            if (part.includes('=')) {
              const [key, value] = part.split('=');
              if (value.includes('.')) {
                const [operator, operand] = value.split('.');
                if (operator === 'eq') {
                  queryBuilder = queryBuilder.eq(key, operand);
                } else if (operator === 'neq') {
                  queryBuilder = queryBuilder.neq(key, operand);
                } else if (operator === 'gt') {
                  queryBuilder = queryBuilder.gt(key, operand);
                } else if (operator === 'lt') {
                  queryBuilder = queryBuilder.lt(key, operand);
                } else if (operator === 'gte') {
                  queryBuilder = queryBuilder.gte(key, operand);
                } else if (operator === 'lte') {
                  queryBuilder = queryBuilder.lte(key, operand);
                } else if (operator === 'in') {
                  queryBuilder = queryBuilder.in(key, operand.split('|'));
                }
              }
            }
          }
        } else {
          // Handle object filter
          Object.entries(filter).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value);
          });
        }
      }
      
      const { data, error } = await queryBuilder;
      
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
   * Récupère un élément par son ID
   * @param table Le nom de la table
   * @param id L'identifiant unique
   * @param query La requête (par défaut: '*')
   */
  async getById(table: string, id: string, query = '*') {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .select(query)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la requête GET BY ID sur ${table}:`, error);
      return { data: null, error };
    }
  },
  
  /**
   * Insère des données dans une table en contournant les vérifications de type
   * @param table Le nom de la table
   * @param values Les valeurs à insérer
   * @param options Options supplémentaires
   */
  async insert(table: string, values: any, options = {}) {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .insert(values, { returning: 'minimal', ...options } as any);
        
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la requête INSERT sur ${table}:`, error);
      return { data: null, error };
    }
  },
  
  /**
   * Insère des données dans une table et retourne les données insérées
   * @param table Le nom de la table
   * @param values Les valeurs à insérer
   */
  async insertAndReturn(table: string, values: any) {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .insert(values)
        .select();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la requête INSERT AND RETURN sur ${table}:`, error);
      return { data: null, error };
    }
  },
  
  /**
   * Met à jour des données dans une table en contournant les vérifications de type
   * @param table Le nom de la table
   * @param values Les valeurs à mettre à jour
   * @param match Les conditions de correspondance (WHERE)
   */
  async update(table: string, values: any, match: Record<string, any>) {
    try {
      let query = supabase
        .from(table as any)
        .update(values);
        
      // Appliquer les conditions
      Object.entries(match).forEach(([key, value]) => {
        query = query.eq(key, value);
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
   * @param table Le nom de la table
   * @param match Les conditions de correspondance (WHERE)
   */
  async delete(table: string, match: Record<string, any>) {
    try {
      let query = supabase
        .from(table as any)
        .delete();
        
      // Appliquer les conditions
      Object.entries(match).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
        
      const { data, error } = await query;
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la requête DELETE sur ${table}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Incrémente le compteur de clics d'un produit
   * @param productId L'ID du produit
   */
  async incrementProductClick(productId: string) {
    try {
      // Mise à jour directe au lieu d'utiliser une fonction RPC
      const { data, error } = await supabase
        .from('advice_products' as any)
        .update({ click_count: supabase.sql`click_count + 1` })
        .eq('id', productId);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de l'incrémentation du compteur de clics:`, error);
      return { data: null, error };
    }
  },

  /**
   * Met à jour le compteur de likes d'un commentaire
   * @param commentId L'ID du commentaire
   */
  async updateCommentLikesCount(commentId: string) {
    try {
      // Calculer le nombre de likes du commentaire
      const { count, error: countError } = await supabase
        .from('advice_comment_likes' as any)
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', commentId);
      
      if (countError) throw countError;
      
      // Mettre à jour le compteur de likes dans le commentaire
      const { data, error } = await supabase
        .from('advice_comments' as any)
        .update({ likes_count: count })
        .eq('id', commentId);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du compteur de likes:`, error);
      return { data: null, error };
    }
  }
};

