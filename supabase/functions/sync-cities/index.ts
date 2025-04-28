
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

// Sample list of popular cities in India - in production, this would be fetched from a more comprehensive source
const popularCities = [
  { city_id: "DEL", name: "Delhi", state: "Delhi", is_popular: true },
  { city_id: "BOM", name: "Mumbai", state: "Maharashtra", is_popular: true },
  { city_id: "BLR", name: "Bangalore", state: "Karnataka", is_popular: true },
  { city_id: "HYD", name: "Hyderabad", state: "Telangana", is_popular: true },
  { city_id: "MAA", name: "Chennai", state: "Tamil Nadu", is_popular: true },
  { city_id: "CCU", name: "Kolkata", state: "West Bengal", is_popular: true },
  { city_id: "PNQ", name: "Pune", state: "Maharashtra", is_popular: true },
  { city_id: "AMD", name: "Ahmedabad", state: "Gujarat", is_popular: true },
  { city_id: "JAI", name: "Jaipur", state: "Rajasthan", is_popular: true },
  { city_id: "GOI", name: "Goa", state: "Goa", is_popular: true },
];

// More Indian cities - in a real application, we would have a much larger database
const moreCities = [
  { city_id: "LKO", name: "Lucknow", state: "Uttar Pradesh" },
  { city_id: "IXC", name: "Chandigarh", state: "Chandigarh" },
  { city_id: "PAT", name: "Patna", state: "Bihar" },
  { city_id: "BBI", name: "Bhubaneswar", state: "Odisha" },
  { city_id: "IXR", name: "Ranchi", state: "Jharkhand" },
  { city_id: "GAU", name: "Guwahati", state: "Assam" },
  { city_id: "RPR", name: "Raipur", state: "Chhattisgarh" },
  { city_id: "VTZ", name: "Visakhapatnam", state: "Andhra Pradesh" },
  { city_id: "IXM", name: "Madurai", state: "Tamil Nadu" },
  { city_id: "COK", name: "Kochi", state: "Kerala" },
  { city_id: "NAG", name: "Nagpur", state: "Maharashtra" },
  { city_id: "TRV", name: "Thiruvananthapuram", state: "Kerala" },
  { city_id: "IDR", name: "Indore", state: "Madhya Pradesh" },
  { city_id: "BHO", name: "Bhopal", state: "Madhya Pradesh" },
  { city_id: "UDR", name: "Udaipur", state: "Rajasthan" },
  { city_id: "DBR", name: "Dehradun", state: "Uttarakhand" },
  { city_id: "IXZ", name: "Port Blair", state: "Andaman and Nicobar Islands" },
  { city_id: "SXR", name: "Srinagar", state: "Jammu and Kashmir" },
  { city_id: "IXJ", name: "Jammu", state: "Jammu and Kashmir" },
  { city_id: "VNS", name: "Varanasi", state: "Uttar Pradesh" },
];

// Combine all cities
const allCities = [...popularCities, ...moreCities];

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting city synchronization");
    
    // Process cities in batches to avoid rate limits
    const batchSize = 50;
    let totalInserted = 0;
    
    for (let i = 0; i < allCities.length; i += batchSize) {
      const batch = allCities.slice(i, i + batchSize);
      
      const { data, error } = await supabaseClient.from("cities").upsert(
        batch.map(city => ({
          city_id: city.city_id,
          name: city.name,
          state: city.state,
          country: "India",
          is_popular: city.is_popular || false
        })),
        { onConflict: "city_id" }
      );
      
      if (error) {
        throw error;
      }
      
      totalInserted += batch.length;
      console.log(`Processed ${totalInserted} cities so far`);
    }
    
    // Now create some popular routes between these cities
    const popularRoutes = [];
    let routeId = 1;
    
    // Create routes between popular cities
    for (let i = 0; i < popularCities.length; i++) {
      for (let j = 0; j < popularCities.length; j++) {
        if (i !== j) {
          popularRoutes.push({
            route_id: `R${routeId.toString().padStart(4, '0')}`,
            from_city_id: popularCities[i].city_id,
            to_city_id: popularCities[j].city_id,
            from_city_name: popularCities[i].name,
            to_city_name: popularCities[j].name,
            is_popular: true
          });
          routeId++;
        }
      }
    }
    
    // Insert routes
    if (popularRoutes.length > 0) {
      for (let i = 0; i < popularRoutes.length; i += batchSize) {
        const batch = popularRoutes.slice(i, i + batchSize);
        
        const { data, error } = await supabaseClient.from("routes").upsert(
          batch,
          { onConflict: "route_id" }
        );
        
        if (error) {
          console.error("Error inserting routes:", error);
        }
      }
      console.log(`Processed ${popularRoutes.length} routes`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synchronized ${totalInserted} cities and ${popularRoutes.length} routes` 
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
