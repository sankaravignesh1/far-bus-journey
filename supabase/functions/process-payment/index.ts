
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
      transactionId,
      paymentGatewayOrderId,
      paymentGatewayPaymentId,
      paymentMethod,
      couponCode,
      discountAmount
    } = await req.json();

    if (!transactionId) {
      throw new Error("Missing transactionId");
    }

    // Get the transaction details
    const { data: transaction, error: transError } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (transError) {
      throw new Error(`Transaction not found: ${transError.message}`);
    }

    if (transaction.status !== 'initiated') {
      throw new Error(`Invalid transaction status: ${transaction.status}`);
    }

    // In a real implementation, this would verify the payment with the payment gateway
    // For this demo, we'll simulate a successful payment

    // Simulate successful payment verification
    const paymentSuccess = Math.random() < 0.95; // 95% success rate

    if (!paymentSuccess) {
      // Update transaction as failed
      await supabaseClient
        .from("transactions")
        .update({
          payment_gateway_order_id: paymentGatewayOrderId,
          payment_gateway_payment_id: paymentGatewayPaymentId,
          payment_gateway_status: "failed",
          payment_method: paymentMethod,
          payment_provider: "RazorPay", // Example payment provider
          status: "failed",
          remarks: "Payment verification failed"
        })
        .eq("id", transactionId);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Payment verification failed" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Apply discount if coupon is provided
    let totalFare = Number(transaction.total_fare);
    let discounts = 0;

    if (couponCode && discountAmount) {
      discounts = Number(discountAmount);
      totalFare -= discounts;
      if (totalFare < 0) totalFare = 0;
    }

    // Update transaction as successful
    await supabaseClient
      .from("transactions")
      .update({
        payment_gateway_order_id: paymentGatewayOrderId,
        payment_gateway_payment_id: paymentGatewayPaymentId,
        payment_gateway_status: "paid",
        payment_method: paymentMethod,
        payment_provider: "RazorPay", // Example payment provider
        status: "successful",
        discounts: discounts,
        total_fare: totalFare
      })
      .eq("id", transactionId);

    // Get the booking seat details
    const bookingIds = transaction.booking_ids.split(',');
    
    // Update booking seats from locked to booked
    const { data: bookingSeats, error: bookingError } = await supabaseClient
      .from("booking_seats")
      .update({ status: "booked" })
      .in("id", bookingIds)
      .select();

    if (bookingError) {
      throw new Error(`Failed to update booking seats: ${bookingError.message}`);
    }

    if (!bookingSeats || bookingSeats.length === 0) {
      throw new Error("No booking seats found to update");
    }

    // Create an entry in the bookings table
    const pnr = await generatePNR();
    const firstSeat = bookingSeats[0];
    
    const bookingEntry = {
      operator_id: firstSeat.operator_id,
      operator_name: firstSeat.operator_name,
      booking_ids: transaction.booking_ids,
      bus_id: firstSeat.bus_id,
      route_id: firstSeat.route_id,
      op_bus_id: firstSeat.op_bus_id,
      op_route_id: firstSeat.op_route_id,
      seat_names: bookingSeats.map(seat => seat.seat_name).join(', '),
      passenger_names: bookingSeats.map(seat => seat.passenger_name).join(', '),
      date_of_journey: firstSeat.date_of_journey,
      mobile: transaction.mobile,
      email: transaction.email,
      total_base_fare: transaction.total_base_fare,
      gst: transaction.gst,
      total_fare: totalFare,
      pnr: pnr,
      from_city: await getFromCity(firstSeat.route_id),
      to_city: await getToCity(firstSeat.route_id),
      boarding_point: firstSeat.boarding_point,
      dropping_point: firstSeat.dropping_point,
      status: "booked"
    };
    
    const { data: bookingData, error: bookingInsertError } = await supabaseClient
      .from("bookings")
      .insert(bookingEntry)
      .select()
      .single();
      
    if (bookingInsertError) {
      throw new Error(`Failed to create booking: ${bookingInsertError.message}`);
    }

    // In a real implementation, this would also update the operator's API
    // to confirm the booking

    // Return the success response with booking details
    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: bookingData.id,
          pnr: bookingData.pnr,
          seats: bookingSeats.map(seat => ({
            seatName: seat.seat_name,
            passengerName: seat.passenger_name,
            passengerAge: seat.age,
            passengerGender: seat.gender
          })),
          fromCity: bookingData.from_city,
          toCity: bookingData.to_city,
          journeyDate: bookingData.date_of_journey,
          boardingPoint: bookingData.boarding_point,
          droppingPoint: bookingData.dropping_point,
          fare: {
            baseFare: Number(transaction.total_base_fare),
            gst: Number(transaction.gst),
            discount: discounts,
            total: totalFare
          }
        }
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

// Helper functions
async function generatePNR() {
  // Call the generate_pnr database function
  const { data, error } = await supabaseClient.rpc('generate_pnr');
  
  if (error) {
    console.error("Error generating PNR:", error);
    // Fallback to a client-side implementation if the DB function fails
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  return data;
}

async function getFromCity(routeId) {
  const { data, error } = await supabaseClient
    .from("routes")
    .select("from_city_name")
    .eq("route_id", routeId)
    .single();
    
  if (error) {
    console.error("Error getting from city:", error);
    return "Unknown";
  }
  
  return data.from_city_name;
}

async function getToCity(routeId) {
  const { data, error } = await supabaseClient
    .from("routes")
    .select("to_city_name")
    .eq("route_id", routeId)
    .single();
    
  if (error) {
    console.error("Error getting to city:", error);
    return "Unknown";
  }
  
  return data.to_city_name;
}
