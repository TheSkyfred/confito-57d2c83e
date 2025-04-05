
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
    if (!jamId) {
      console.error("[getJamById] ID de confiture manquant");
      return { jam: null, error: "ID de confiture manquant" };
    }
    
    console.log(`[getJamById] Début de récupération de la confiture avec ID: ${jamId}`);
    console.log(`[getJamById] Type de l'ID: ${typeof jamId}, Valeur: "${jamId}"`);
    
    // Vérification approfondie de Supabase
    const supabaseInfo = {
      anon_key_length: supabase.supabaseKey ? supabase.supabaseKey.length : 'non défini',
      auth_status: supabase.auth ? 'disponible' : 'non disponible'
    };
    console.log("[getJamById] Info Supabase:", supabaseInfo);
    
    // Récupération directe par ID avec logging détaillé
    console.log(`[getJamById] Lancement de la requête pour ID: ${jamId}`);
    
    // Première tentative: requête complète avec relations
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
    
    if (error) {
      console.error(`[getJamById] Erreur lors de la récupération de la confiture ${jamId}:`, error);
      
      if (error.code === 'PGRST116') {
        console.log(`[getJamById] Aucune confiture trouvée avec l'ID ${jamId}. Tentative de requête simplifiée...`);
        
        // Deuxième tentative: requête simplifiée sans relations
        const simpleRequest = await supabase
          .from('jams')
          .select('id, name')
          .eq('id', jamId)
          .maybeSingle();
          
        console.log('[getJamById] Résultat de la requête simplifiée:', simpleRequest);
        
        if (simpleRequest.error) {
          console.error('[getJamById] Échec également avec la requête simplifiée:', simpleRequest.error);
          return { jam: null, error: simpleRequest.error };
        }
        
        if (!simpleRequest.data) {
          console.log(`[getJamById] Confiture ${jamId} définitivement introuvable`);
          return { jam: null, error: null };
        }
        
        // Si on a trouvé un enregistrement simple, essayons de récupérer les relations séparément
        console.log('[getJamById] Confiture trouvée en version simple, tentative de récupération des relations...');
        const jamData = simpleRequest.data;
        
        // Récupérer les images
        const { data: imagesData } = await supabase
          .from('jam_images')
          .select('*')
          .eq('jam_id', jamId);
          
        // Assembler un objet minimal
        const minimalJam = {
          ...jamData,
          jam_images: imagesData || [],
          reviews: [],
          profiles: null
        };
        
        console.log('[getJamById] Confiture reconstruite avec données minimales:', minimalJam);
        return { jam: minimalJam, error: null };
      }
      
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
