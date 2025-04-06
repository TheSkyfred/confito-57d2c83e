
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Helper function to safely type Supabase queries
export const getTypedSupabaseQuery = <T extends keyof Database['public']['Tables']>(table: T) => {
  return supabase.from(table);
};

// Vérifier si le client Supabase est correctement initialisé
export const checkSupabaseConnection = async () => {
  try {
    console.log("Tentative de connexion à Supabase...");
    
    // Vérifions d'abord que le client Supabase existe
    if (!supabase) {
      console.error("Client Supabase non initialisé");
      return { success: false, error: "Client Supabase non initialisé" };
    }
    
    // Test simple pour vérifier si la connexion fonctionne
    const { data, error } = await supabase.from('jams').select('id').limit(1);
    
    if (error) {
      console.error("Erreur lors de la vérification de la connexion Supabase:", error);
      return { success: false, error };
    }
    
    console.log("Connexion Supabase OK. Donnée test:", data);
    return { success: true, data };
  } catch (e) {
    console.error("Exception lors de la vérification de la connexion Supabase:", e);
    return { success: false, error: e };
  }
};

// Récupérer une confiture par son ID
export const getJamById = async (jamId: string) => {
  try {
    if (!jamId) {
      console.error("[getJamById] ID de confiture manquant");
      return { jam: null, error: "ID de confiture manquant" };
    }
    
    console.log(`[getJamById] Récupération de la confiture avec ID: ${jamId}`);
    
    // Requête avec relations
    const { data, error } = await supabase
      .from('jams')
      .select(`
        *,
        jam_images (*),
        reviews (*, reviewer:profiles(id, username, full_name, avatar_url)),
        profiles:creator_id (id, username, full_name, avatar_url)
      `)
      .eq('id', jamId)
      .maybeSingle();
    
    if (error) {
      console.error(`[getJamById] Erreur: ${error.message}`);
      return { jam: null, error };
    }
    
    if (!data) {
      console.log(`[getJamById] Aucune confiture trouvée avec l'ID ${jamId}`);
      return { jam: null, error: null };
    }
    
    console.log(`[getJamById] Confiture trouvée:`, data);
    return { jam: data, error: null };
  } catch (e) {
    console.error(`[getJamById] Exception: ${e}`);
    return { jam: null, error: e };
  }
};

// Récupérer toutes les confitures avec filtres
export const getJams = async (filters = {}) => {
  try {
    console.log("[getJams] Récupération de toutes les confitures avec filtres:", filters);
    
    let query = supabase
      .from('jams')
      .select(`
        *,
        jam_images (*),
        profiles:creator_id (id, username, full_name, avatar_url),
        reviews (rating)
      `)
      .eq('is_active', true);
    
    // Application des filtres si nécessaire
    // À adapter selon la structure de votre objet filters
    
    const { data, error } = await query;
    
    if (error) {
      console.error("[getJams] Erreur:", error.message);
      return { jams: null, error };
    }
    
    if (!data || data.length === 0) {
      console.log("[getJams] Aucune confiture trouvée");
      return { jams: [], error: null };
    }
    
    console.log(`[getJams] ${data.length} confitures trouvées`);
    
    // Calculer les moyennes des notes pour chaque confiture
    const processedJams = data.map(jam => {
      const ratings = jam.reviews?.map(review => review.rating) || [];
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;
      
      return {
        ...jam,
        avgRating
      };
    });
    
    return { jams: processedJams, error: null };
  } catch (e) {
    console.error("[getJams] Exception:", e);
    return { jams: null, error: e };
  }
};
