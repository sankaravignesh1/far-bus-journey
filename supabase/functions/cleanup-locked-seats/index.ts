
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
    console.log("Starting cleanup of locked seats");
    
    // Call the database function
    const { data, error } = await supabaseClient.rpc('cleanup_expired_locked_seats');
    
    if (error) throw error;
    
    // For seats that were locked but expired, we need to make them available again
    // Get expired locked seats
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() - 8.2);
    
    const { data: expiredSeats, error: expiredError } = await supabaseClient
      .from("booking_seats")
      .select("seat_id")
      .eq("status", "locked")
      .lt("created_at", expirationTime.toISOString());
      
    if (expiredError) throw expiredError;
    
    if (expiredSeats && expiredSeats.length > 0) {
      const seatIds = expiredSeats.map(seat => seat.seat_id);
      
      // Update the availability in bus_layout
      for (const seatId of seatIds) {
        const { error: updateError } = await supabaseClient
          .from("bus_layout")
          .update({ available: true })
          .eq("seat_id", seatId);
          
        if (updateError) {
          console.error(`Failed to update seat availability for ${seatId}: ${updateError.message}`);
        }
      }
      
      console.log(`Made ${seatIds.length} expired locked seats available again`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Cleaned up expired locked seats" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error cleaning up locked seats:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
