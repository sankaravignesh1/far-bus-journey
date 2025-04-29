
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
    console.log("Starting scheduled tasks");
    
    // Check if this is a cron invocation
    const { type } = await req.json();
    
    switch (type) {
      case "cleanup_locked_seats":
        await cleanupLockedSeats();
        break;
      case "sync_bus_data":
        await syncBusData();
        break;
      default:
        // Run all tasks by default
        await cleanupLockedSeats();
        await syncBusData();
        break;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Scheduled tasks completed successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error running scheduled tasks:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function cleanupLockedSeats() {
  console.log("Running cleanup of locked seats");
  
  const response = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/cleanup-locked-seats`,
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
    throw new Error(`Failed to clean up locked seats: ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log(`Cleanup result:`, result);
  
  return result;
}

async function syncBusData() {
  console.log("Syncing bus data");
  
  const response = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-buses`,
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
    throw new Error(`Failed to sync bus data: ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log(`Sync result:`, result);
  
  return result;
}
