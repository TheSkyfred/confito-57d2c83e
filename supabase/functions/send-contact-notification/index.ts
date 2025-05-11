
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper function to log steps for better debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONTACT-NOTIFICATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    logStep("Received OPTIONS request");
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  logStep(`Received ${req.method} request`);
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logStep("Missing Supabase configuration");
      throw new Error("Configuration Supabase manquante côté serveur");
    }
    
    logStep("Supabase configuration available");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the contact message ID from the request
    let reqBody;
    try {
      reqBody = await req.json();
      logStep("Request body parsed", reqBody);
    } catch (parseError) {
      logStep("Error parsing request body", parseError);
      throw new Error("Requête invalide : le format JSON est incorrect");
    }
    
    const { messageId } = reqBody;
    
    if (!messageId) {
      logStep("Missing messageId in request");
      throw new Error("ID du message de contact requis");
    }
    
    // Get the contact message details
    const { data: message, error: messageError } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (messageError || !message) {
      logStep("Error retrieving contact message", messageError);
      throw new Error("Impossible de récupérer les détails du message de contact");
    }
    
    logStep("Retrieved contact message", message);
    
    // Here you would typically implement email sending functionality
    // For example, using a service like Resend, SendGrid, etc.
    // For now, we'll just log that we would send an email
    logStep("Would send email notification with details", {
      to: "admin@confito.com",
      subject: `Nouveau message de contact: ${message.subject}`,
      contactName: message.name,
      contactEmail: message.email,
      contactType: message.contact_type
    });
    
    // Update the status of the message to 'read'
    const { error: updateError } = await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', messageId);
    
    if (updateError) {
      logStep("Error updating contact message status", updateError);
      throw new Error("Impossible de mettre à jour le statut du message");
    }
    
    logStep("Message status updated to 'read'");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification de contact traitée"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
    console.error("Error processing contact notification:", error);
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
