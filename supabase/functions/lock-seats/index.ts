
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
    const {
      seats, // Array of seat objects
      boardingPoint,
      droppingPoint,
      passengers,
      contactMobile,
      contactEmail,
      journeyDate,
      busId
    } = await req.json();

    console.log("Received request to lock seats:", seats);

    if (!seats || !seats.length || !boardingPoint || !droppingPoint || !passengers || 
        !contactMobile || !contactEmail || !journeyDate || !busId) {
      throw new Error("Missing required fields");
    }

    // Validate passenger details
    if (seats.length !== passengers.length) {
      throw new Error("Number of seats and passengers don't match");
    }

    // Get the bus details
    const { data: busData, error: busError } = await supabaseClient
      .from("bus_list")
      .select("*, routes(*)")
      .eq("bus_id", busId)
      .single();

    if (busError) throw new Error(`Bus not found: ${busError.message}`);

    // Verify that the seats are still available
    const seatIds = seats.map(seat => seat.seatId);
    
    const { data: seatData, error: seatError } = await supabaseClient
      .from("bus_layout")
      .select("*")
      .in("seat_id", seatIds)
      .eq("available", true);

    if (seatError) throw new Error(`Error checking seat availability: ${seatError.message}`);
    
    if (!seatData || seatData.length !== seats.length) {
      throw new Error("Some selected seats are no longer available");
    }

    // In a real implementation, this would call the bus operator's API
    // For this demo, we'll simulate a successful lock with the operator

    // Create a booking ID
    const bookingId = crypto.randomUUID();
    
    // Lock the seats in our database
    const now = new Date().toISOString();
    const bookingSeats = [];

    for (let i = 0; i < seats.length; i++) {
      const seat = seats[i];
      const passenger = passengers[i];
      const seatDetails = seatData.find(s => s.seat_id === seat.seatId);

      bookingSeats.push({
        booking_id: bookingId,
        operator_id: busData.operator_id,
        operator_name: busData.operator_name,
        seat_name: seatDetails.seat_name,
        passenger_name: passenger.name,
        age: passenger.age,
        gender: passenger.gender,
        mobile: contactMobile,
        total_fare: seatDetails.discounted_price || seatDetails.original_price,
        seat_id: seat.seatId,
        op_seat_id: seatDetails.op_seat_id,
        boarding_point: boardingPoint.name,
        dropping_point: droppingPoint.name,
        bus_id: busId,
        route_id: busData.route_id,
        op_bus_id: busData.op_bus_id,
        op_route_id: busData.op_route_id,
        date_of_journey: journeyDate,
        seat_type: seatDetails.seat_type,
        bus_type: busData.bus_type,
        created_at: now,
        status: "locked"
      });
    }

    // Insert the booking seats
    const { data: insertData, error: insertError } = await supabaseClient
      .from("booking_seats")
      .insert(bookingSeats)
      .select();

    if (insertError) throw new Error(`Failed to lock seats: ${insertError.message}`);

    // Update the seat availability in the layout table
    for (const seatId of seatIds) {
      const { error: updateError } = await supabaseClient
        .from("bus_layout")
        .update({ available: false })
        .eq("seat_id", seatId);
        
      if (updateError) {
        console.error(`Failed to update seat availability for ${seatId}: ${updateError.message}`);
      }
    }

    // Calculate fares
    const baseTotal = bookingSeats.reduce((sum, seat) => sum + Number(seat.total_fare), 0);
    
    // Get the GST rate
    const { data: gstData, error: gstError } = await supabaseClient
      .from("gst_rates")
      .select("gst_percent")
      .eq("operator_id", busData.operator_id)
      .single();
      
    if (gstError) throw new Error(`GST rate not found: ${gstError.message}`);
    
    const gstRate = gstData.gst_percent || 5.0; // Default to 5% if not found
    const gstAmount = (baseTotal * gstRate / 100).toFixed(2);
    const totalWithGst = (baseTotal + Number(gstAmount)).toFixed(2);

    // Create a transaction record
    const transaction = {
      mobile: contactMobile,
      email: contactEmail,
      booking_ids: insertData.map(b => b.id).join(','),
      total_base_fare: baseTotal,
      gst: gstAmount,
      total_fare: totalWithGst,
      status: "initiated"
    };
    
    const { data: transData, error: transError } = await supabaseClient
      .from("transactions")
      .insert(transaction)
      .select()
      .single();
      
    if (transError) throw new Error(`Failed to create transaction: ${transError.message}`);

    // Return the result
    return new Response(
      JSON.stringify({
        success: true,
        bookingId,
        seatIds,
        transactionId: transData.id,
        totalBaseFare: baseTotal,
        gst: gstAmount,
        totalFare: totalWithGst,
        lockExpiresAt: new Date(Date.now() + 8.2 * 60 * 1000).toISOString() // 8.2 minutes from now
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
