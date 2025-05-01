
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Call each of the synchronization functions in sequence
    const syncFunctions = [
      'sync-operators',
      'sync-cities',
      'sync-buses'
    ];
    
    const results = [];
    
    for (const funcName of syncFunctions) {
      console.log(`Calling ${funcName} function...`);
      
      try {
        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/${funcName}`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({})
          }
        );
        
        let result;
        try {
          result = await response.json();
        } catch (e) {
          result = { error: "Could not parse response" };
        }
        
        results.push({ function: funcName, status: response.status, result });
        
        if (!response.ok) {
          console.log(`${funcName} returned status ${response.status}`);
          console.log(`Response body: ${JSON.stringify(result)}`);
        } else {
          console.log(`${funcName} completed successfully`);
        }
      } catch (error) {
        console.error(`Error calling ${funcName}: ${error.message}`);
        results.push({ function: funcName, error: error.message });
      }
    }
    
    // Check if we already have sample coupons
    const { data: existingCoupons } = await supabaseClient
      .from("coupons")
      .select("id")
      .limit(1);
      
    if (!existingCoupons || existingCoupons.length === 0) {
      console.log("Creating sample coupons...");
      
      // Add sample coupons for major cities
      const sampleCoupons = [
        {
          coupon_code: "FIRST50",
          discount: 5,
          min_fare: 500,
          max_discount: 50,
          valid_from: new Date().toISOString().split('T')[0],
          valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        {
          from_city: "Mumbai",
          from_city_id: "BOM",
          coupon_code: "MUMBAI10",
          discount: 10,
          min_fare: 800,
          max_discount: 100,
          valid_from: new Date().toISOString().split('T')[0],
          valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        {
          from_city: "Delhi",
          from_city_id: "DEL",
          coupon_code: "DELHI10",
          discount: 10,
          min_fare: 800,
          max_discount: 100,
          valid_from: new Date().toISOString().split('T')[0],
          valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        {
          from_city: "Bangalore",
          from_city_id: "BLR",
          coupon_code: "BLR10",
          discount: 10,
          min_fare: 800,
          max_discount: 100,
          valid_from: new Date().toISOString().split('T')[0],
          valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }
      ];
      
      for (const coupon of sampleCoupons) {
        const { error } = await supabaseClient
          .from("coupons")
          .upsert(coupon);
          
        if (error) {
          console.error(`Failed to create coupon ${coupon.coupon_code}: ${error.message}`);
        } else {
          console.log(`Created coupon: ${coupon.coupon_code}`);
        }
      }
    }
    
    // Check and create travel policies if they don't exist
    const { data: existingPolicies } = await supabaseClient
      .from("travel_policy")
      .select("*");
      
    if (!existingPolicies || existingPolicies.length === 0) {
      const travelPolicies = [
        { policy_text: "Passengers should arrive at the boarding point at least 15 minutes before departure." },
        { policy_text: "Children above the age of 5 require a full ticket." },
        { policy_text: "Smoking, consumption of alcohol, and use of drugs are strictly prohibited." },
        { policy_text: "Passengers are advised to keep their valuables safely." },
        { policy_text: "Operators reserve the right to change the bus type in case of any breakdown." }
      ];
      
      for (const policy of travelPolicies) {
        await supabaseClient.from("travel_policy").insert(policy);
      }
      
      console.log("Created travel policies");
    }
    
    // Set up realtime listening by enabling realtime for bus_layout table
    try {
      await supabaseClient.rpc('supabase_functions.http_request', {
        "method": 'POST',
        "url": `${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/enable_realtime`,
        "headers": {
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
        },
        "body": { 
          "tables": ["bus_layout"] 
        }
      });
      console.log("Enabled realtime for bus_layout table");
    } catch (error) {
      console.warn(`Failed to enable realtime: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Database initialization completed successfully",
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error initializing database:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
