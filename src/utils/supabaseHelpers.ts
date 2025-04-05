
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
    console.log("Vérification de la connexion avec une requête simple");
    
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
    console.log(`[getJamById] Début de récupération de la confiture avec ID: ${jamId}`);
    console.log(`[getJamById] Type de l'ID: ${typeof jamId}, Valeur: "${jamId}"`);
    
    // Vérifier d'abord la connexion
    const connectionCheck = await checkSupabaseConnection();
    if (!connectionCheck.success) {
      console.error("[getJamById] Erreur de connexion Supabase:", connectionCheck.error);
      return { jam: null, error: "Erreur de connexion à la base de données" };
    }
    
    // Récupération directe par ID avec logging détaillé
    console.log(`[getJamById] Lancement de la requête pour ID: ${jamId}`);
    const { data, error, status } = await supabase
      .from('jams')
      .select(`
        *,
        jam_images (*),
        reviews (*, reviewer:reviewer_id(id, username, full_name, avatar_url)),
        profiles:creator_id (id, username, full_name, avatar_url)
      `)
      .eq('id', jamId)
      .single();
    
    console.log(`[getJamById] Statut HTTP: ${status}`);
    console.log('[getJamById] Données brutes reçues:', data);
    console.log('[getJamById] Erreur éventuelle:', error);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[getJamById] Aucune confiture trouvée avec l'ID ${jamId}`);
        return { jam: null, error: null };
      }
      
      console.error(`[getJamById] Erreur lors de la récupération de la confiture ${jamId}:`, error);
      return { jam: null, error };
    }
    
    if (!data) {
      console.log(`[getJamById] Aucune confiture trouvée avec l'ID ${jamId}`);
      return { jam: null, error: null };
    }
    
    console.log(`[getJamById] Confiture ${jamId} trouvée avec succès:`, data);
    return { jam: data, error: null };
  } catch (e) {
    console.error(`[getJamById] Exception lors de la récupération de la confiture ${jamId}:`, e);
    return { jam: null, error: e };
  }
};
