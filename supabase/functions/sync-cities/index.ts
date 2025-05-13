
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

// List of major Indian cities with their state
const indianCities = [
  { name: "Mumbai", state: "Maharashtra", city_id: "BOM", is_popular: true },
  { name: "Delhi", state: "Delhi", city_id: "DEL", is_popular: true },
  { name: "Bangalore", state: "Karnataka", city_id: "BLR", is_popular: true },
  { name: "Hyderabad", state: "Telangana", city_id: "HYD", is_popular: true },
  { name: "Chennai", state: "Tamil Nadu", city_id: "MAA", is_popular: true },
  { name: "Kolkata", state: "West Bengal", city_id: "CCU", is_popular: true },
  { name: "Ahmedabad", state: "Gujarat", city_id: "AMD", is_popular: true },
  { name: "Pune", state: "Maharashtra", city_id: "PNQ", is_popular: true },
  { name: "Jaipur", state: "Rajasthan", city_id: "JAI", is_popular: true },
  { name: "Surat", state: "Gujarat", city_id: "STV", is_popular: true },
  { name: "Lucknow", state: "Uttar Pradesh", city_id: "LKO", is_popular: true },
  { name: "Kanpur", state: "Uttar Pradesh", city_id: "KNU", is_popular: true },
  { name: "Nagpur", state: "Maharashtra", city_id: "NAG", is_popular: true },
  { name: "Indore", state: "Madhya Pradesh", city_id: "IDR", is_popular: true },
  { name: "Thane", state: "Maharashtra", city_id: "THN", is_popular: false },
  { name: "Bhopal", state: "Madhya Pradesh", city_id: "BHO", is_popular: false },
  { name: "Visakhapatnam", state: "Andhra Pradesh", city_id: "VTZ", is_popular: false },
  { name: "Patna", state: "Bihar", city_id: "PAT", is_popular: false },
  { name: "Vadodara", state: "Gujarat", city_id: "BDQ", is_popular: false },
  { name: "Ghaziabad", state: "Uttar Pradesh", city_id: "GBD", is_popular: false },
  { name: "Mysore", state: "Karnataka", city_id: "MYQ", is_popular: false },
  { name: "Coimbatore", state: "Tamil Nadu", city_id: "CJB", is_popular: false },
  { name: "Kochi", state: "Kerala", city_id: "COK", is_popular: false },
  { name: "Trivandrum", state: "Kerala", city_id: "TRV", is_popular: false },
  { name: "Madurai", state: "Tamil Nadu", city_id: "IXM", is_popular: false },
  { name: "Varanasi", state: "Uttar Pradesh", city_id: "VNS", is_popular: false },
  { name: "Amritsar", state: "Punjab", city_id: "ATQ", is_popular: false },
  { name: "Jodhpur", state: "Rajasthan", city_id: "JDH", is_popular: false },
  { name: "Guwahati", state: "Assam", city_id: "GAU", is_popular: false },
  { name: "Chandigarh", state: "Chandigarh", city_id: "IXC", is_popular: false },
  { name: "Ludhiana", state: "Punjab", city_id: "LUH", is_popular: false },
  { name: "Agra", state: "Uttar Pradesh", city_id: "AGR", is_popular: false },
  { name: "Nashik", state: "Maharashtra", city_id: "ISK", is_popular: false },
  { name: "Faridabad", state: "Haryana", city_id: "FBD", is_popular: false },
  { name: "Meerut", state: "Uttar Pradesh", city_id: "MEL", is_popular: false },
  { name: "Rajkot", state: "Gujarat", city_id: "RAJ", is_popular: false },
  { name: "Kalyan", state: "Maharashtra", city_id: "KLY", is_popular: false },
  { name: "Ranchi", state: "Jharkhand", city_id: "IXR", is_popular: false },
  { name: "Haora", state: "West Bengal", city_id: "HWH", is_popular: false },
  { name: "Vijaywada", state: "Andhra Pradesh", city_id: "VGA", is_popular: false },
  { name: "Goa", state: "Goa", city_id: "GOI", is_popular: true },
  { name: "Shimla", state: "Himachal Pradesh", city_id: "SLV", is_popular: false },
  { name: "Dehradun", state: "Uttarakhand", city_id: "DED", is_popular: false },
  { name: "Nainital", state: "Uttarakhand", city_id: "NTL", is_popular: false },
  { name: "Manali", state: "Himachal Pradesh", city_id: "MNL", is_popular: false },
  { name: "Udaipur", state: "Rajasthan", city_id: "UDR", is_popular: false },
  { name: "Jaisalmer", state: "Rajasthan", city_id: "JSA", is_popular: false },
  { name: "Darjeeling", state: "West Bengal", city_id: "DAR", is_popular: false },
  { name: "Munnar", state: "Kerala", city_id: "MUN", is_popular: false },
  { name: "Ooty", state: "Tamil Nadu", city_id: "OOT", is_popular: false },
];

// Common routes between major cities
const popularRoutes = [
  { from_city_id: "BOM", to_city_id: "DEL", from_city_name: "Mumbai", to_city_name: "Delhi", route_id: "BOM-DEL", is_popular: true },
  { from_city_id: "BOM", to_city_id: "BLR", from_city_name: "Mumbai", to_city_name: "Bangalore", route_id: "BOM-BLR", is_popular: true },
  { from_city_id: "BOM", to_city_id: "GOI", from_city_name: "Mumbai", to_city_name: "Goa", route_id: "BOM-GOI", is_popular: true },
  { from_city_id: "BOM", to_city_id: "PNQ", from_city_name: "Mumbai", to_city_name: "Pune", route_id: "BOM-PNQ", is_popular: true },
  { from_city_id: "DEL", to_city_id: "BOM", from_city_name: "Delhi", to_city_name: "Mumbai", route_id: "DEL-BOM", is_popular: true },
  { from_city_id: "DEL", to_city_id: "JAI", from_city_name: "Delhi", to_city_name: "Jaipur", route_id: "DEL-JAI", is_popular: true },
  { from_city_id: "DEL", to_city_id: "LKO", from_city_name: "Delhi", to_city_name: "Lucknow", route_id: "DEL-LKO", is_popular: true },
  { from_city_id: "BLR", to_city_id: "HYD", from_city_name: "Bangalore", to_city_name: "Hyderabad", route_id: "BLR-HYD", is_popular: true },
  { from_city_id: "BLR", to_city_id: "MAA", from_city_name: "Bangalore", to_city_name: "Chennai", route_id: "BLR-MAA", is_popular: true },
  { from_city_id: "BLR", to_city_id: "GOI", from_city_name: "Bangalore", to_city_name: "Goa", route_id: "BLR-GOI", is_popular: true },
  { from_city_id: "HYD", to_city_id: "BLR", from_city_name: "Hyderabad", to_city_name: "Bangalore", route_id: "HYD-BLR", is_popular: true },
  { from_city_id: "HYD", to_city_id: "MAA", from_city_name: "Hyderabad", to_city_name: "Chennai", route_id: "HYD-MAA", is_popular: true },
  { from_city_id: "MAA", to_city_id: "BLR", from_city_name: "Chennai", to_city_name: "Bangalore", route_id: "MAA-BLR", is_popular: true },
  { from_city_id: "MAA", to_city_id: "HYD", from_city_name: "Chennai", to_city_name: "Hyderabad", route_id: "MAA-HYD", is_popular: true },
];

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting city and route synchronization");
    
    // Check if we have cities already in the database
    const { data: existingCities, error: citiesCheckError } = await supabaseClient
      .from("cities")
      .select("city_id")
      .limit(1);
    
    if (citiesCheckError) {
      console.error("Error checking for existing cities:", citiesCheckError.message);
    } else if (!existingCities || existingCities.length === 0) {
      console.log("No cities found in database, inserting Indian cities");
      
      // Insert cities in batches to avoid potential payload size limitations
      const batchSize = 20;
      for (let i = 0; i < indianCities.length; i += batchSize) {
        const batch = indianCities.slice(i, i + batchSize);
        
        const { error: citiesInsertError } = await supabaseClient
          .from("cities")
          .upsert(batch, { onConflict: "city_id" });
        
        if (citiesInsertError) {
          console.error(`Error inserting cities batch ${i/batchSize + 1}: ${citiesInsertError.message}`);
        } else {
          console.log(`Successfully inserted cities batch ${i/batchSize + 1}`);
        }
      }
    } else {
      console.log("Cities already exist in database, skipping city insertion");
    }
    
    // Check if we have routes already in the database
    const { data: existingRoutes, error: routesCheckError } = await supabaseClient
      .from("routes")
      .select("route_id")
      .limit(1);
    
    if (routesCheckError) {
      console.error("Error checking for existing routes:", routesCheckError.message);
    } else if (!existingRoutes || existingRoutes.length === 0) {
      console.log("No routes found in database, inserting popular routes");
      
      const { error: routesInsertError } = await supabaseClient
        .from("routes")
        .upsert(popularRoutes, { onConflict: "route_id" });
      
      if (routesInsertError) {
        console.error(`Error inserting routes: ${routesInsertError.message}`);
      } else {
        console.log("Successfully inserted popular routes");
      }
    } else {
      console.log("Routes already exist in database, skipping route insertion");
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synchronized ${indianCities.length} cities and ${popularRoutes.length} routes` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error during city synchronization:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
