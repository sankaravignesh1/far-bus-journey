
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
    
    // Check if we already have data in the operator_apis table
    const { data: existingOperators, error: checkError } = await supabaseClient
      .from("operator_apis")
      .select("operator_id")
      .limit(1);
    
    if (checkError) {
      console.log("Error checking existing operators:", checkError.message);
    }
    
    // If we already have data, don't try to fetch from third-party API
    if (existingOperators && existingOperators.length > 0) {
      console.log("Operators already exist in the database, skipping third-party fetch");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Operators already exist in the database" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Since we don't have operators yet, let's create default ones
    // These are sample operators that will be used as fallback
    const defaultOperators = [
      {
        operator_id: "KSRTC001",
        operator_name: "Karnataka State Road Transport Corporation",
        api_url: THIRD_PARTY_API_URL,
        api_key: THIRD_PARTY_API_KEY,
        api_username: "ksrtc_api",
        api_password: "api_pass_123",
        additional_params: {},
        is_active: true
      },
      {
        operator_id: "APSRTC001",
        operator_name: "Andhra Pradesh State Road Transport Corporation",
        api_url: THIRD_PARTY_API_URL,
        api_key: THIRD_PARTY_API_KEY,
        api_username: "apsrtc_api",
        api_password: "api_pass_123",
        additional_params: {},
        is_active: true
      },
      {
        operator_id: "TSRTC001",
        operator_name: "Telangana State Road Transport Corporation",
        api_url: THIRD_PARTY_API_URL,
        api_key: THIRD_PARTY_API_KEY,
        api_username: "tsrtc_api",
        api_password: "api_pass_123",
        additional_params: {},
        is_active: true
      }
    ];
    
    // Insert into our database
    const { data: insertedData, error: insertError } = await supabaseClient
      .from("operator_apis")
      .upsert(defaultOperators, { onConflict: "operator_id" });
    
    if (insertError) {
      throw new Error(`Failed to insert operators: ${insertError.message}`);
    }
    
    // Step 4: Create associated records (cancellation policy, GST rates, etc.)
    for (const operator of defaultOperators) {
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
        message: `Created ${defaultOperators.length} default operators with associated data` 
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
