
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    // Call each of the synchronization functions in sequence
    const syncFunctions = [
      'sync-cities',
      'sync-operators',
      'sync-buses'
    ];
    
    const results = [];
    
    for (const funcName of syncFunctions) {
      console.log(`Calling ${funcName} function...`);
      
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
      
      if (!response.ok) {
        throw new Error(`Failed to call ${funcName}: ${response.statusText}`);
      }
      
      const result = await response.json();
      results.push({ function: funcName, result });
      
      console.log(`${funcName} completed successfully`);
    }
    
    // Create some sample coupons
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
      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/rest/v1/coupons`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "apikey": `${Deno.env.get("SUPABASE_ANON_KEY")}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify(coupon)
        }
      );
      
      if (!response.ok) {
        console.error(`Failed to create coupon ${coupon.coupon_code}: ${response.statusText}`);
      } else {
        console.log(`Created coupon: ${coupon.coupon_code}`);
      }
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
