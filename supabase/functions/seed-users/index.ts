
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cette fonction génère des utilisateurs fictifs avec plus de données pour les profils
function generateFakeUsers(count: number) {
  const users = [];
  const firstNames = ["Jean", "Marie", "Pierre", "Sophie", "Thomas", "Émilie", "Lucas", "Julie", "Antoine", "Chloé", 
                     "Nicolas", "Laura", "Alexandre", "Camille", "Maxime", "Léa", "Hugo", "Manon", "Louis", "Sarah"];
  const lastNames = ["Martin", "Dubois", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Moreau", "Simon",
                     "Laurent", "Michel", "Lefebvre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard"];
  const cities = ["Paris", "Lyon", "Marseille", "Bordeaux", "Lille", "Toulouse", "Nantes", "Strasbourg", "Montpellier", "Nice"];
  const bios = [
    "Passionné de confitures artisanales depuis toujours.",
    "Je collectionne et teste des confitures du monde entier.",
    "Créateur de confitures aux saveurs exotiques.",
    "Fan de fruits de saison et confitures maison.",
    "À la recherche des meilleures confitures locales.",
    "J'aime expérimenter des recettes de grand-mère revisitées.",
    "Confitures bio et éco-responsables sont ma priorité.",
  ];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    const city = cities[Math.floor(Math.random() * cities.length)];
    const bio = bios[Math.floor(Math.random() * bios.length)];
    const credits = Math.floor(Math.random() * 500) + 50; // Entre 50 et 550 crédits
    
    users.push({
      email: `${username}@example.com`,
      password: `Password123!`,
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
        username: username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        bio: bio,
        address: `${Math.floor(Math.random() * 100) + 1} rue des Confitures, ${city}`,
        credits: credits,
      },
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
    // Récupérer les variables d'environnement pour Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Les variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises");
    }
    
    // Créer un client Supabase avec les permissions admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Récupérer les données de la requête
    const requestData = await req.json();
    const count = requestData.count || 20; // Par défaut, créer 20 utilisateurs
    
    const usersToCreate = generateFakeUsers(count);
    const createdUsers = [];
    
    console.log(`Création de ${usersToCreate.length} utilisateurs fictifs...`);
    
    // Créer chaque utilisateur
    for (const userData of usersToCreate) {
      try {
        // Créer l'utilisateur avec email confirmé
        const { data: user, error: createError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: userData.user_metadata,
          email_confirm: true,
        });
        
        if (createError) {
          console.error(`Erreur lors de la création de l'utilisateur ${userData.email}:`, createError);
          continue;
        }
        
        console.log(`Utilisateur créé: ${userData.email} (${user.user.id})`);
        
        // Mettre à jour le profil avec des données additionnelles
        if (user && user.user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              bio: userData.user_metadata.bio,
              address: userData.user_metadata.address,
              credits: userData.user_metadata.credits,
              avatar_url: userData.user_metadata.avatar_url
            })
            .eq('id', user.user.id);
          
          if (updateError) {
            console.error(`Erreur lors de la mise à jour du profil pour ${userData.email}:`, updateError);
          } else {
            console.log(`Profil mis à jour pour ${userData.email}`);
          }
        }
        
        createdUsers.push({
          id: user.user.id,
          email: userData.email,
          username: userData.user_metadata.username,
          full_name: userData.user_metadata.full_name,
          bio: userData.user_metadata.bio,
          address: userData.user_metadata.address,
          credits: userData.user_metadata.credits,
          avatar_url: userData.user_metadata.avatar_url
        });
      } catch (error) {
        console.error(`Erreur lors de la création de l'utilisateur ${userData.email}:`, error);
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, users: createdUsers, count: createdUsers.length }),
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
