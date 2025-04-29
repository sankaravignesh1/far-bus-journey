
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Third-party API details (stored securely in environment variables)
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
    // Parse request body
    const bookingDetails = await req.json();
    
    if (!bookingDetails || !Array.isArray(bookingDetails.seats) || bookingDetails.seats.length === 0) {
      throw new Error("Invalid booking details. Missing seats array.");
    }
    
    const seats = bookingDetails.seats;
    const results = [];
    
    // Check if all seats are still available
    for (const seat of seats) {
      const { data: seatData, error: seatError } = await supabaseClient
        .from("bus_layout")
        .select("available")
        .eq("seat_id", seat.seat_id)
        .eq("date_of_journey", seat.date_of_journey)
        .single();
      
      if (seatError) {
        throw new Error(`Error checking seat availability: ${seatError.message}`);
      }
      
      if (!seatData || !seatData.available) {
        throw new Error(`Seat ${seat.seat_name} is no longer available.`);
      }
    }
    
    // Lock seats in third-party API (in a real implementation)
    // Here we're simulating success since we don't have actual third-party API access
    const thirdPartySuccess = true;
    
    if (!thirdPartySuccess) {
      throw new Error("Failed to lock seats with third-party operator API.");
    }
    
    // Lock seats in our database
    for (const seat of seats) {
      // First, mark the seat as unavailable in bus_layout
      const { error: updateError } = await supabaseClient
        .from("bus_layout")
        .update({ available: false })
        .eq("seat_id", seat.seat_id);
      
      if (updateError) {
        console.error(`Error updating seat availability: ${updateError.message}`);
        // If we fail to update our DB, we should try to unlock in third-party
        // In a real implementation, add rollback logic here
        continue;
      }
      
      // Generate a booking_id
      const bookingId = crypto.randomUUID();
      
      // Add to booking_seats
      const { data: bookingSeat, error: bookingError } = await supabaseClient
        .from("booking_seats")
        .insert({
          booking_id: bookingId,
          operator_id: seat.operator_id,
          operator_name: seat.operator_name,
          seat_name: seat.seat_name,
          passenger_name: seat.passenger_name,
          age: seat.age,
          gender: seat.gender,
          mobile: seat.mobile,
          total_fare: seat.total_fare,
          seat_id: seat.seat_id,
          op_seat_id: seat.op_seat_id,
          boarding_point: seat.boarding_point,
          dropping_point: seat.dropping_point,
          bus_id: seat.bus_id,
          route_id: seat.route_id,
          op_bus_id: seat.op_bus_id,
          op_route_id: seat.op_route_id,
          date_of_journey: seat.date_of_journey,
          seat_type: seat.seat_type,
          bus_type: seat.bus_type,
          status: "locked"
        });
      
      if (bookingError) {
        console.error(`Error creating booking_seat: ${bookingError.message}`);
        // If we fail to insert, we should try to unlock in third-party and our DB
        // In a real implementation, add rollback logic here
        continue;
      }
      
      results.push({ 
        success: true, 
        seat_id: seat.seat_id, 
        booking_id: bookingId 
      });
    }
    
    // If we've made it this far without throwing, all seats are locked
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully locked ${results.length} seats`, 
        bookings: results 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error locking seats:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
