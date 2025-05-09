
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to log steps for debugging
function logStep(stepName, details = {}) {
  console.log(`[create-checkout] ${stepName}:`, JSON.stringify(details));
}

serve(async (req) => {
  logStep("Function called", { method: req.method, url: req.url });
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    logStep("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Processing request");
    
    let reqBody;
    try {
      reqBody = await req.json();
      logStep("Request body parsed", reqBody);
    } catch (parseError) {
      logStep("Error parsing request body", { error: parseError.message });
      return new Response(
        JSON.stringify({ 
          error: "Requête invalide : le format JSON est incorrect",
          success: false
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    const { packageId } = reqBody;
    if (!packageId) {
      logStep("Missing packageId");
      return new Response(
        JSON.stringify({
          error: "PackageId est requis pour créer une session de paiement",
          success: false
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    logStep("Package ID received", { packageId });
    
    // Get the Stripe secret key from environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({
          error: "Configuration Stripe manquante côté serveur",
          success: false
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    logStep("Stripe API key available");

    // Authenticate the user from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Missing Authorization header");
      return new Response(
        JSON.stringify({
          error: "Vous devez être connecté pour effectuer cette action",
          success: false
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logStep("Missing Supabase configuration");
      return new Response(
        JSON.stringify({
          error: "Configuration Supabase manquante côté serveur",
          success: false
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    logStep("Supabase configuration available");
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get authenticated user
    const token = authHeader.replace("Bearer ", "");
    logStep("Token extracted from Authorization header");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("User authentication error", { error: userError.message });
      return new Response(
        JSON.stringify({
          error: "Session utilisateur invalide: " + userError.message,
          success: false
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }
    
    if (!userData.user) {
      logStep("No user found");
      return new Response(
        JSON.stringify({
          error: "Utilisateur non trouvé",
          success: false
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    const user = userData.user;
    logStep("User authenticated", { id: user.id, email: user.email });

    // Map of package IDs to their Stripe product IDs and attributes
    const creditPackages = [
      {
        id: 'credits-10',
        amount: 10,
        price: 599, // in cents for Stripe
        description: 'Pour goûter quelques confitures',
        productId: 'prod_SHKlMY5fad4jpJ'
      },
      {
        id: 'credits-25',
        amount: 25,
        price: 1299,
        description: 'Notre offre la plus populaire',
        productId: 'prod_SHKjhWMkbrnn4w'
      },
      {
        id: 'credits-50',
        amount: 50,
        price: 2299,
        description: 'Pour les amateurs de confitures',
        productId: 'prod_SHKmJPb3URoR5j'
      },
      {
        id: 'credits-100',
        amount: 100,
        price: 3999,
        description: 'Pour les passionnés',
        productId: 'prod_SHKmsUaZugXmoD'
      }
    ];

    const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      logStep("Invalid package selected", { packageId });
      return new Response(
        JSON.stringify({
          error: "Pack de crédits invalide sélectionné",
          success: false
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    logStep("Selected package", selectedPackage);

    // Initialize Stripe
    try {
      logStep("Initializing Stripe");
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });

      // Create Stripe checkout session with the product ID
      logStep("Creating Stripe checkout session", { productId: selectedPackage.productId });
      
      // Get the origin from request or use a default
      const url = new URL(req.url);
      const origin = url.origin !== "null" ? url.origin : "https://vbjitiitrxbiyznrfvyx.supabase.co";
      logStep("Using origin for redirect URLs", { origin });
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product: selectedPackage.productId,
              unit_amount: selectedPackage.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/payment-canceled`,
        client_reference_id: user.id,
        customer_email: user.email,
        metadata: {
          userId: user.id,
          creditsAmount: selectedPackage.amount.toString(),
          packageId: selectedPackage.id,
        },
      });

      logStep("Checkout session created", { sessionId: session.id, url: session.url });

      // Return the session ID and URL to redirect to
      return new Response(
        JSON.stringify({ sessionId: session.id, url: session.url, success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (stripeError) {
      logStep("Stripe error", { error: stripeError.message });
      return new Response(
        JSON.stringify({
          error: `Erreur Stripe: ${stripeError.message}`,
          success: false
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
  } catch (error) {
    logStep("Error creating checkout session", { error: error.message });
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
