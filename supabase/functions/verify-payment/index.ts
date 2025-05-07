
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting verify-payment function");
    
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      throw new Error("Requête invalide : le format JSON est incorrect");
    }
    
    const { sessionId } = reqBody;
    if (!sessionId) {
      console.error("Missing sessionId in request");
      throw new Error("SessionId est requis pour vérifier le paiement");
    }
    
    console.log("Session ID received:", sessionId);
    
    // Get the Stripe secret key from environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      throw new Error("Configuration Stripe manquante côté serveur");
    }
    
    console.log("Stripe API key available");

    // Authenticate the user from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      throw new Error("Vous devez être connecté pour effectuer cette action");
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Configuration Supabase manquante côté serveur");
    }
    
    console.log("Supabase configuration available");

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, { 
      auth: { persistSession: false } 
    });

    // Get authenticated user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("User authentication error:", userError);
      throw new Error("Session utilisateur invalide ou utilisateur non trouvé");
    }

    const user = userData.user;
    console.log("User authenticated:", user.email);

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check the session status
    console.log("Retrieving Stripe session");
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log("Session status:", session.payment_status);
    } catch (stripeError) {
      console.error("Error retrieving Stripe session:", stripeError);
      throw new Error(`Erreur lors de la récupération de la session Stripe: ${stripeError.message}`);
    }

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Paiement non complété", 
          status: session.payment_status 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check if this session was already processed
    console.log("Checking if payment was already processed");
    const { data: existingTransactions, error: txnQueryError } = await supabaseAdmin
      .from("credit_transactions")
      .select("*")
      .eq("stripe_session_id", sessionId);

    if (txnQueryError) {
      console.error("Error querying existing transactions:", txnQueryError);
      throw new Error(`Erreur lors de la vérification des transactions existantes: ${txnQueryError.message}`);
    }

    if (existingTransactions && existingTransactions.length > 0) {
      console.log("Payment already processed:", existingTransactions[0].id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Paiement déjà traité", 
          status: session.payment_status,
          transaction: existingTransactions[0]
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get the credits amount from metadata
    const creditsAmount = parseInt(session.metadata?.creditsAmount || "0");
    if (!creditsAmount) {
      console.error("Invalid credits amount in session metadata:", session.metadata);
      throw new Error("Montant de crédits invalide dans les métadonnées de la session");
    }
    
    console.log("Credits amount:", creditsAmount);

    // Begin transaction: add credits to profile and record transaction
    console.log("Fetching user profile");
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      throw new Error(`Erreur lors de la récupération du profil utilisateur: ${profileError.message}`);
    }

    // Update user's credits
    const newCreditBalance = (profile.credits || 0) + creditsAmount;
    console.log("Updating user credits from", profile.credits, "to", newCreditBalance);
    
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ credits: newCreditBalance })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      throw new Error(`Erreur lors de la mise à jour des crédits: ${updateError.message}`);
    }

    // Record the transaction
    console.log("Recording credit transaction");
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("credit_transactions")
      .insert([{
        user_id: user.id,
        amount: creditsAmount,
        description: `Achat de ${creditsAmount} crédits`,
        stripe_session_id: sessionId
      }])
      .select()
      .single();

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      throw new Error(`Erreur lors de l'enregistrement de la transaction: ${transactionError.message}`);
    }

    console.log("Payment processed successfully, credits added:", creditsAmount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Paiement traité avec succès", 
        creditsAdded: creditsAmount,
        newBalance: newCreditBalance,
        transaction: transaction
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Une erreur inconnue est survenue" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
