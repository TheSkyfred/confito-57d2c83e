
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
    const { packageId } = await req.json();
    
    // Get the Stripe secret key from environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    // Authenticate the user from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
    );

    // Get authenticated user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid auth token or user not found");
    }

    const user = userData.user;
    console.log("User authenticated:", user.email);

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
      throw new Error("Invalid package selected");
    }

    console.log("Selected package:", selectedPackage);

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${selectedPackage.amount} crédits Confito`,
              description: selectedPackage.description,
            },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        creditsAmount: selectedPackage.amount.toString(),
        packageId: selectedPackage.id,
      },
    });

    console.log("Checkout session created:", session.id);

    // Return the session ID and URL to redirect to
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
