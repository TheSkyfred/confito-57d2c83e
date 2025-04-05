
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cette fonction génère des utilisateurs fictifs
function generateFakeUsers(count: number) {
  const users = [];
  const firstNames = ["Jean", "Marie", "Pierre", "Sophie", "Thomas", "Émilie", "Lucas", "Julie", "Antoine", "Chloé"];
  const lastNames = ["Martin", "Dubois", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Moreau", "Simon"];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    
    users.push({
      email: `${username}@example.com`,
      password: `Password123!`,
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
        username: username,
      },
      app_metadata: {},
    });
  }
  
  return users;
}

serve(async (req) => {
  // Gérer les requêtes CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Récupérer la clé d'administration et l'URL de Supabase depuis les variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Les variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises");
    }
    
    // Créer un client Supabase avec les permissions admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    const { count } = await req.json();
    const usersToCreate = generateFakeUsers(count || 5);
    const createdUsers = [];
    
    console.log(`Création de ${usersToCreate.length} utilisateurs fictifs...`);
    
    // Créer chaque utilisateur et l'ajouter à profiles
    for (const userData of usersToCreate) {
      try {
        // Créer l'utilisateur
        const { data: user, error: createError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: userData.user_metadata,
          email_confirm: true, // Confirmer l'email automatiquement
        });
        
        if (createError) throw createError;
        
        console.log(`Utilisateur créé : ${userData.email} (${user.user.id})`);
        
        // Les profils sont créés automatiquement via le trigger handle_new_user
        // Si ce n'est pas le cas, on peut les créer manuellement ici
        
        createdUsers.push({
          id: user.user.id,
          email: userData.email,
          username: userData.user_metadata.username,
          full_name: userData.user_metadata.full_name,
        });
      } catch (error) {
        console.error(`Erreur lors de la création de l'utilisateur ${userData.email}:`, error);
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, users: createdUsers }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erreur:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
