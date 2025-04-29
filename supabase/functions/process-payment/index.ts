
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
    const paymentDetails = await req.json();
    
    if (!paymentDetails || !paymentDetails.booking_ids || !paymentDetails.transaction_id) {
      throw new Error("Invalid payment details. Missing booking IDs or transaction ID.");
    }
    
    // Update transaction status to successful
    // In a real implementation, this would verify payment with gateway
    const { error: transactionError } = await supabaseClient
      .from("transactions")
      .update({
        payment_gateway_status: "paid",
        status: "successful",
        updated_at: new Date().toISOString()
      })
      .eq("id", paymentDetails.transaction_id);
    
    if (transactionError) {
      throw new Error(`Error updating transaction: ${transactionError.message}`);
    }
    
    // Update booking_seats status to booked
    const { error: bookingSeatsError } = await supabaseClient
      .from("booking_seats")
      .update({
        status: "booked",
        updated_at: new Date().toISOString()
      })
      .in("booking_id", paymentDetails.booking_ids.split(","));
    
    if (bookingSeatsError) {
      throw new Error(`Error updating booking seats: ${bookingSeatsError.message}`);
    }
    
    // Get all the booking seats details
    const { data: seats, error: seatsError } = await supabaseClient
      .from("booking_seats")
      .select("*")
      .in("booking_id", paymentDetails.booking_ids.split(","));
    
    if (seatsError) {
      throw new Error(`Error fetching booking seats: ${seatsError.message}`);
    }
    
    if (!seats || seats.length === 0) {
      throw new Error("No booking seats found for the provided booking IDs.");
    }
    
    // Group seats by common attributes for booking entry
    const firstSeat = seats[0];
    const seatNames = seats.map(s => s.seat_name).join(",");
    const passengerNames = seats.map(s => s.passenger_name).join(",");
    const bookingIds = seats.map(s => s.booking_id).join(",");
    
    // Get transaction details
    const { data: transaction, error: fetchTransactionError } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("id", paymentDetails.transaction_id)
      .single();
    
    if (fetchTransactionError) {
      throw new Error(`Error fetching transaction: ${fetchTransactionError.message}`);
    }
    
    // Generate PNR
    const { data: pnrData, error: pnrError } = await supabaseClient
      .rpc('generate_pnr');
    
    if (pnrError) {
      throw new Error(`Error generating PNR: ${pnrError.message}`);
    }
    
    const pnr = pnrData;
    
    // Create booking entry
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({
        operator_id: firstSeat.operator_id,
        operator_name: firstSeat.operator_name,
        booking_ids: bookingIds,
        bus_id: firstSeat.bus_id,
        route_id: firstSeat.route_id,
        op_bus_id: firstSeat.op_bus_id,
        op_route_id: firstSeat.op_route_id,
        seat_names: seatNames,
        passenger_names: passengerNames,
        date_of_journey: firstSeat.date_of_journey,
        mobile: firstSeat.mobile,
        email: paymentDetails.email, // Assuming this is provided in payment details
        total_base_fare: transaction.total_base_fare,
        gst: transaction.gst,
        total_fare: transaction.total_fare,
        pnr: pnr,
        from_city: paymentDetails.from_city,
        to_city: paymentDetails.to_city,
        boarding_point: firstSeat.boarding_point,
        dropping_point: firstSeat.dropping_point,
        status: "booked"
      });
    
    if (bookingError) {
      throw new Error(`Error creating booking: ${bookingError.message}`);
    }
    
    // In a real implementation, this would also notify the third-party API
    // that the seats are confirmed/booked
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment processed successfully", 
        pnr: pnr, 
        booking: booking 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
