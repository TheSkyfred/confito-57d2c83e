
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
    const { sessionId } = await req.json();
    
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

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid auth token or user not found");
    }

    const user = userData.user;
    console.log("User authenticated:", user.email);

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check the session status
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session status:", session.payment_status);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Payment not completed", 
          status: session.payment_status 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check if this session was already processed
    const { data: existingTransactions } = await supabaseAdmin
      .from("credit_transactions")
      .select("*")
      .eq("stripe_session_id", sessionId);

    if (existingTransactions && existingTransactions.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment already processed", 
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
      throw new Error("Invalid credits amount in session metadata");
    }

    // Begin transaction: add credits to profile and record transaction
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new Error(`Error fetching user profile: ${profileError.message}`);
    }

    // Update user's credits
    const newCreditBalance = (profile.credits || 0) + creditsAmount;
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ credits: newCreditBalance })
      .eq("id", user.id);

    if (updateError) {
      throw new Error(`Error updating credits: ${updateError.message}`);
    }

    // Record the transaction
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
      throw new Error(`Error recording transaction: ${transactionError.message}`);
    }

    console.log("Payment processed successfully, credits added:", creditsAmount);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment processed successfully", 
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
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
