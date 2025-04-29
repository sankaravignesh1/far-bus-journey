
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
    
    // Find locked seats older than 8.2 minutes
    const cutoffTime = new Date(Date.now() - 8.2 * 60 * 1000).toISOString();
    
    const { data: lockedSeats, error: fetchError } = await supabaseClient
      .from("booking_seats")
      .select("id, seat_id")
      .eq("status", "locked")
      .lt("created_at", cutoffTime);
    
    if (fetchError) {
      throw new Error(`Error finding expired locked seats: ${fetchError.message}`);
    }
    
    if (!lockedSeats || lockedSeats.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No expired locked seats found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    console.log(`Found ${lockedSeats.length} expired locked seats`);
    
    // Extract IDs for deletion
    const seatIds = lockedSeats.map(seat => seat.seat_id);
    const bookingSeatIds = lockedSeats.map(seat => seat.id);
    
    // Mark seats as available again in bus_layout
    const { error: updateError } = await supabaseClient
      .from("bus_layout")
      .update({ available: true })
      .in("seat_id", seatIds);
    
    if (updateError) {
      throw new Error(`Error updating seat availability: ${updateError.message}`);
    }
    
    // Delete booking_seats entries
    const { error: deleteError } = await supabaseClient
      .from("booking_seats")
      .delete()
      .in("id", bookingSeatIds);
    
    if (deleteError) {
      throw new Error(`Error deleting booking_seats: ${deleteError.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleaned up ${lockedSeats.length} expired locked seats` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error during locked seats cleanup:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
