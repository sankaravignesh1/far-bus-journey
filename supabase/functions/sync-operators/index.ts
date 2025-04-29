
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Third-party API details (stored securely in environment variables)
const THIRD_PARTY_API_URL = Deno.env.get("THIRD_PARTY_API_URL") ?? "https://pssuodwfdpwljbnfcanz.supabase.co";
const THIRD_PARTY_API_KEY = Deno.env.get("THIRD_PARTY_API_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzc3VvZHdmZHB3bGpibmZjYW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MjI3NjAsImV4cCI6MjA1OTE5ODc2MH0._rEFKaQEs7unu8VtCuAkjpCmRSeeTwrqx689LrlyhQA";

// Initialize third-party Supabase client
const thirdPartyClient = createClient(THIRD_PARTY_API_URL, THIRD_PARTY_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting operator synchronization");
    
    // Step 1: Fetch operators from third-party API
    const { data: operators, error: fetchError } = await thirdPartyClient
      .from("operators")
      .select("*");
    
    if (fetchError) {
      throw new Error(`Failed to fetch operators: ${fetchError.message}`);
    }
    
    if (!operators || operators.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No operators found in third-party API" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Step 2: Transform the data to match our schema
    const operatorApis = operators.map(op => ({
      operator_id: op.operator_id,
      operator_name: op.operator_name,
      api_url: op.api_url || THIRD_PARTY_API_URL, // Use default if not provided
      api_key: op.api_key || THIRD_PARTY_API_KEY, // Use default if not provided
      api_username: op.api_username,
      api_password: op.api_password,
      additional_params: op.additional_params || {},
      is_active: true
    }));
    
    // Step 3: Insert into our database
    const { data: insertedData, error: insertError } = await supabaseClient
      .from("operator_apis")
      .upsert(operatorApis, { onConflict: "operator_id" });
    
    if (insertError) {
      throw new Error(`Failed to insert operators: ${insertError.message}`);
    }
    
    // Step 4: Create associated records (cancellation policy, GST rates, etc.)
    for (const operator of operatorApis) {
      // Set up cancellation policy
      await supabaseClient.from("cancellation_policy").upsert({
        operator_id: operator.operator_id,
        operator_name: operator.operator_name
      }, { onConflict: "operator_id" });
      
      // Set up GST rates
      await supabaseClient.from("gst_rates").upsert({
        operator_id: operator.operator_id,
        operator_name: operator.operator_name,
        gst_percent: 5.00 // Default GST rate
      }, { onConflict: "operator_id" });
      
      // Set up reviews entry
      await supabaseClient.from("reviews").upsert({
        operator_id: operator.operator_id,
        operator_name: operator.operator_name
      }, { onConflict: "operator_id" });
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synchronized ${operatorApis.length} operators with associated data` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error during operator synchronization:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
