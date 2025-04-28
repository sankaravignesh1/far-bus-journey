
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sample operator data - in a real application, this might be fetched from configuration
const operators = [
  {
    operator_id: "OP001",
    operator_name: "Luxury Travels",
    api_url: "https://api.luxurytravels.example.com/v1",
    api_key: "sample_api_key_1",
    api_username: "luxury_api",
    api_password: "sample_password_1",
    additional_params: { format: "json", version: "1.2" }
  },
  {
    operator_id: "OP002",
    operator_name: "Royal Express",
    api_url: "https://royal-express-api.example.com/api",
    api_key: "sample_api_key_2",
    api_username: "royal_api",
    api_password: "sample_password_2",
    additional_params: { output: "json", compress: false }
  },
  {
    operator_id: "OP003",
    operator_name: "Swift Bus Services",
    api_url: "https://swiftbus.example.com/webservices",
    api_key: "sample_api_key_3",
    api_username: "swift_api",
    api_password: "sample_password_3",
    additional_params: { format: "json", timeout: 30 }
  }
];

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting operator synchronization");
    
    // Upsert operators
    const { data: operatorsData, error: operatorsError } = await supabaseClient
      .from("operator_apis")
      .upsert(operators, { onConflict: "operator_id" });
      
    if (operatorsError) throw operatorsError;
    
    // Set up cancellation policies for each operator
    const cancellationPolicies = operators.map(op => ({
      operator_id: op.operator_id,
      operator_name: op.operator_name,
      before_two_weeks: 95,
      before_week: 85,
      before_48hrs: 70,
      before_24hrs: 50,
      before_12hrs: 30,
      before_6hrs: 10,
      lessthan_6hrs: 0
    }));
    
    const { data: policiesData, error: policiesError } = await supabaseClient
      .from("cancellation_policy")
      .upsert(cancellationPolicies, { onConflict: "operator_id" });
      
    if (policiesError) throw policiesError;
    
    // Set up GST rates for each operator
    const gstRates = operators.map(op => ({
      operator_id: op.operator_id,
      operator_name: op.operator_name,
      gst_percent: 5.00  // Standard GST rate
    }));
    
    const { data: gstData, error: gstError } = await supabaseClient
      .from("gst_rates")
      .upsert(gstRates, { onConflict: "operator_id" });
      
    if (gstError) throw gstError;
    
    // Set up reviews (empty placeholders) for each operator
    const reviews = operators.map(op => ({
      operator_id: op.operator_id,
      operator_name: op.operator_name
    }));
    
    const { data: reviewsData, error: reviewsError } = await supabaseClient
      .from("reviews")
      .upsert(reviews, { onConflict: "operator_id" });
      
    if (reviewsError) throw reviewsError;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synchronized ${operators.length} operators with policies, GST rates, and review placeholders` 
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
