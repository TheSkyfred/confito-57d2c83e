
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper function to log steps for better debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    logStep("Received OPTIONS request");
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  logStep(`Received ${req.method} request`);
  
  try {
    logStep("Starting create-checkout function");
    logStep("Request method:", { method: req.method });
    
    // Log request headers for debugging
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    logStep("Request headers:", headersObj);
    
    let reqBody;
    try {
      reqBody = await req.json();
      logStep("Request body parsed", reqBody);
    } catch (parseError) {
      logStep("Error parsing request body", parseError);
      throw new Error("Requête invalide : le format JSON est incorrect");
    }
    
    const { packageId, priceId, productId } = reqBody;
    
    if (!packageId) {
      logStep("Missing packageId in request");
      throw new Error("PackageId est requis pour créer une session de paiement");
    }

    if (!priceId) {
      logStep("Missing priceId in request");
      throw new Error("PriceId est requis pour créer une session de paiement");
    }
    
    logStep("Package ID received", { packageId });
    logStep("Price ID received", { priceId });
    logStep("Product ID received", { productId });
    
    // Get the Stripe secret key from environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not configured");
      throw new Error("Configuration Stripe manquante côté serveur");
    }
    
    logStep("Stripe API key available");

    // Authenticate the user from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Missing Authorization header");
      throw new Error("Vous devez être connecté pour effectuer cette action");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logStep("Missing Supabase configuration");
      throw new Error("Configuration Supabase manquante côté serveur");
    }
    
    logStep("Supabase configuration available");
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token", { tokenLength: token.length });
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("User authentication error", userError);
      throw new Error("Session utilisateur invalide ou utilisateur non trouvé");
    }

    const user = userData.user;
    logStep("User authenticated", { email: user.email });

    // Get the credits package based on the packageId
    const creditPackages = [
      {
        id: 'credits-10',
        amount: 10,
        price: 599, // in cents for Stripe
        description: 'Pour goûter quelques confitures'
      },
      {
        id: 'credits-25',
        amount: 25,
        price: 1299,
        description: 'Notre offre la plus populaire'
      },
      {
        id: 'credits-50',
        amount: 50,
        price: 2299,
        description: 'Pour les amateurs de confitures'
      },
      {
        id: 'credits-100',
        amount: 100,
        price: 3999,
        description: 'Pour les passionnés'
      }
    ];

    const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      logStep("Invalid package selected", { packageId });
      throw new Error("Pack de crédits invalide sélectionné");
    }

    logStep("Selected package", selectedPackage);

    // Initialize Stripe
    try {
      logStep("Initializing Stripe with API key");
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });

      // Create Stripe checkout session
      logStep("Creating Stripe checkout session");
      const origin = req.headers.get("origin") || "https://f13ddae9-07ea-4fe0-9104-5a4587435c41.lovableproject.com";
      
      logStep("Creating session with", { 
        priceId, 
        user_id: user.id,
        email: user.email,
        creditsAmount: selectedPackage.amount,
        origin
      });
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
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
          productId: productId
        },
      });

      logStep("Checkout session created successfully", { 
        sessionId: session.id, 
        url: session.url 
      });

      // Return the session ID and URL to redirect to
      const responseData = {
        sessionId: session.id,
        url: session.url
      };
      
      logStep("Returning response", responseData);
      return new Response(
        JSON.stringify(responseData),
        {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          },
          status: 200,
        }
      );
    } catch (stripeError) {
      logStep("Stripe error", stripeError);
      throw new Error(`Erreur Stripe: ${stripeError.message}`);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
