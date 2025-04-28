
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

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { fromCityId, fromCity } = await req.json();

    if (!fromCityId && !fromCity) {
      throw new Error("Missing fromCityId or fromCity");
    }

    // Query for coupons based on city
    let query = supabaseClient.from("coupons").select("*");
    
    if (fromCityId) {
      query = query.eq("from_city_id", fromCityId);
    } else if (fromCity) {
      query = query.eq("from_city", fromCity);
    }
    
    // Only get valid coupons
    const today = new Date().toISOString().split('T')[0];
    query = query.gte("valid_to", today);
    
    const { data: coupons, error } = await query;
    
    if (error) throw error;
    
    // If no city-specific coupons, get generic ones
    if (!coupons || coupons.length === 0) {
      const { data: genericCoupons, error: genericError } = await supabaseClient
        .from("coupons")
        .select("*")
        .is("from_city_id", null)
        .is("from_city", null)
        .gte("valid_to", today);
        
      if (genericError) throw genericError;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          coupons: genericCoupons || [] 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        coupons: coupons 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching coupons:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
