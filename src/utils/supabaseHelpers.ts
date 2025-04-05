
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Helper function to safely type Supabase queries
export const getTypedSupabaseQuery = <T extends keyof Database['public']['Tables']>(table: T) => {
  return supabase.from(table);
};

// Vérifier si le client Supabase est correctement initialisé
export const checkSupabaseConnection = async () => {
  try {
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
    console.log(`Tentative de récupération de la confiture avec ID: ${jamId}`);
    
    const { data, error } = await supabase
      .from('jams')
      .select(`
        *,
        jam_images (*),
        reviews (*, reviewer:reviewer_id(id, username, full_name, avatar_url)),
        profiles:creator_id (id, username, full_name, avatar_url)
      `)
      .eq('id', jamId)
      .maybeSingle();
    
    if (error) {
      console.error(`Erreur lors de la récupération de la confiture ${jamId}:`, error);
      return { jam: null, error };
    }
    
    if (!data) {
      console.log(`Aucune confiture trouvée avec l'ID ${jamId}`);
      return { jam: null, error: null };
    }
    
    console.log(`Confiture ${jamId} trouvée:`, data);
    return { jam: data, error: null };
  } catch (e) {
    console.error(`Exception lors de la récupération de la confiture ${jamId}:`, e);
    return { jam: null, error: e };
  }
};
