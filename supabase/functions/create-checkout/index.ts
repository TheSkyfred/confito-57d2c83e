
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("create-checkout function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting create-checkout function with POST request");
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    console.log("Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));
    
    let reqBody;
    try {
      reqBody = await req.json();
      console.log("Request body parsed:", JSON.stringify(reqBody));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      throw new Error("Requête invalide : le format JSON est incorrect");
    }
    
    const { packageId } = reqBody;
    if (!packageId) {
      console.error("Missing packageId in request");
      throw new Error("PackageId est requis pour créer une session de paiement");
    }
    
    console.log("Package ID received:", packageId);
    
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Configuration Supabase manquante côté serveur");
    }
    
    console.log("Supabase configuration available");
    console.log("Supabase URL:", supabaseUrl);
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get authenticated user
    const token = authHeader.replace("Bearer ", "");
    console.log("Token extracted from Authorization header");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error("User authentication error:", userError);
      throw new Error("Session utilisateur invalide: " + userError.message);
    }
    
    if (!userData.user) {
      console.error("No user found");
      throw new Error("Utilisateur non trouvé");
    }

    const user = userData.user;
    console.log("User authenticated:", user.email);

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
      console.error("Invalid package selected:", packageId);
      throw new Error("Pack de crédits invalide sélectionné");
    }

    console.log("Selected package:", selectedPackage);

    // Initialize Stripe
    try {
      console.log("Initializing Stripe with API key");
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });

      // Create Stripe checkout session with the product ID
      console.log("Creating Stripe checkout session with product ID:", selectedPackage.productId);
      const origin = req.headers.get("origin") || "http://localhost:3000";
      console.log("Origin:", origin);
      
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

      console.log("Checkout session created:", session.id);
      console.log("Session URL:", session.url);

      // Return the session ID and URL to redirect to
      return new Response(
        JSON.stringify({ sessionId: session.id, url: session.url }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      throw new Error(`Erreur Stripe: ${stripeError.message}`);
    }
    
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
