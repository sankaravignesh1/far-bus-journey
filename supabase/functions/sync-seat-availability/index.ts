
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Third-party API details
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
    console.log("Starting seat availability synchronization");
    
    // Get current date
    const today = new Date().toISOString().split('T')[0];
    
    // Step 1: Get all active buses for today and future dates
    const { data: buses, error: busesError } = await supabaseClient
      .from("bus_list")
      .select("bus_id, operator_id, route_id, op_bus_id, op_route_id, journey_date")
      .gte("journey_date", today)
      .limit(100); // Limit to 100 buses per sync
    
    if (busesError) {
      throw new Error(`Failed to fetch buses: ${busesError.message}`);
    }
    
    if (!buses || buses.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No buses found for syncing" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    console.log(`Found ${buses.length} buses to sync seat availability`);
    
    // Step 2: For each bus, check if seat availability has changed in the third-party API
    let updatedSeats = 0;
    
    for (const bus of buses) {
      try {
        console.log(`Syncing seats for bus ${bus.bus_id} on ${bus.journey_date}`);
        
        // Get seat information from third-party API
        const { data: thirdPartySeats, error: seatsError } = await thirdPartyClient
          .from("bus_seats")
          .select("seat_id, available")
          .eq("bus_id", bus.op_bus_id)
          .eq("date_of_journey", bus.journey_date);
        
        if (seatsError) {
          console.warn(`Warning: Error fetching seats for bus ${bus.bus_id}: ${seatsError.message}`);
          continue;
        }
        
        if (!thirdPartySeats || thirdPartySeats.length === 0) {
          console.log(`No seat data found for bus ${bus.bus_id}`);
          continue;
        }
        
        // Update our seat availability
        for (const seat of thirdPartySeats) {
          const { data: updatedSeat, error: updateError } = await supabaseClient
            .from("bus_layout")
            .update({ available: seat.available })
            .eq("seat_id", seat.seat_id)
            .select("*");
          
          if (updateError) {
            console.warn(`Error updating seat ${seat.seat_id}: ${updateError.message}`);
          } else {
            updatedSeats++;
          }
        }
        
      } catch (error) {
        console.warn(`Error processing bus ${bus.bus_id}: ${error.message}`);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated availability for ${updatedSeats} seats across ${buses.length} buses` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Error during seat availability synchronization:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
