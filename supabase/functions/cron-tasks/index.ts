
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
    // Parse the request to determine which task to run
    const { task } = await req.json();
    
    if (!task) {
      throw new Error("Task parameter is required");
    }
    
    let result;
    
    switch (task) {
      case "cleanup-seats":
        console.log("Running cleanup-seats task");
        result = await cleanupExpiredSeats();
        break;
        
      case "refresh-buses":
        console.log("Running refresh-buses task");
        result = await refreshBusData();
        break;
        
      case "update-availability":
        console.log("Running update-availability task");
        result = await updateSeatAvailability();
        break;
        
      default:
        throw new Error(`Unknown task: ${task}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        task,
        result
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in cron task:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Clean up expired locked seats
async function cleanupExpiredSeats() {
  // Call the cleanup function
  const cleanupResponse = await fetch(
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
  
  if (!cleanupResponse.ok) {
    throw new Error(`Failed to clean up locked seats: ${cleanupResponse.statusText}`);
  }
  
  return await cleanupResponse.json();
}

// Refresh bus data for future dates
async function refreshBusData() {
  // This would typically call the sync-buses function to refresh data
  // But we'll just do a simpler version here since actual API integration is not implemented
  
  // Find routes that need updating (has buses in the next 7 days)
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);
  
  const { data: busesNeedingUpdate, error: busError } = await supabaseClient
    .from("bus_list")
    .select("route_id")
    .gte("journey_date", today.toISOString().split('T')[0])
    .lte("journey_date", sevenDaysLater.toISOString().split('T')[0])
    .order("route_id", { ascending: true });
    
  if (busError) throw busError;
  
  // Get unique route IDs
  const routeIds = [...new Set(busesNeedingUpdate.map(bus => bus.route_id))];
  
  // For each route, update the seat availability of some random buses
  // This simulates real-time updates from operator APIs
  let updatedSeats = 0;
  
  for (const routeId of routeIds) {
    const { data: buses, error: routeBusError } = await supabaseClient
      .from("bus_list")
      .select("bus_id")
      .eq("route_id", routeId)
      .gte("journey_date", today.toISOString().split('T')[0]);
      
    if (routeBusError) {
      console.error(`Error fetching buses for route ${routeId}: ${routeBusError.message}`);
      continue;
    }
    
    // Update availability for a random selection of buses
    const busesToUpdate = buses
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(buses.length, 3));
      
    for (const bus of busesToUpdate) {
      const { data: seats, error: seatsError } = await supabaseClient
        .from("bus_layout")
        .select("seat_id, available")
        .eq("bus_id", bus.bus_id)
        .eq("available", true);
        
      if (seatsError) {
        console.error(`Error fetching seats for bus ${bus.bus_id}: ${seatsError.message}`);
        continue;
      }
      
      // Mark some random seats as unavailable to simulate bookings
      const seatsToMakeUnavailable = seats
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.ceil(seats.length * 0.1)); // Make about 10% unavailable
        
      for (const seat of seatsToMakeUnavailable) {
        const { error: updateError } = await supabaseClient
          .from("bus_layout")
          .update({ available: false })
          .eq("seat_id", seat.seat_id);
          
        if (updateError) {
          console.error(`Error updating seat ${seat.seat_id}: ${updateError.message}`);
        } else {
          updatedSeats++;
        }
      }
    }
  }
  
  return { updatedSeats, routesProcessed: routeIds.length };
}

// Update seat availability based on bookings
async function updateSeatAvailability() {
  // Get locked seats that have passed their expiration time
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() - 8.2);
  
  const { data: expiredSeats, error: expiredError } = await supabaseClient
    .from("booking_seats")
    .select("seat_id")
    .eq("status", "locked")
    .lt("created_at", expiryTime.toISOString());
    
  if (expiredError) throw expiredError;
  
  let updatedSeats = 0;
  
  // Make expired locked seats available again
  if (expiredSeats && expiredSeats.length > 0) {
    for (const seat of expiredSeats) {
      const { error: updateError } = await supabaseClient
        .from("bus_layout")
        .update({ available: true })
        .eq("seat_id", seat.seat_id);
        
      if (updateError) {
        console.error(`Error updating seat ${seat.seat_id}: ${updateError.message}`);
      } else {
        updatedSeats++;
      }
    }
    
    // Delete expired locked seats from booking_seats
    const { error: deleteError } = await supabaseClient
      .from("booking_seats")
      .delete()
      .eq("status", "locked")
      .lt("created_at", expiryTime.toISOString());
      
    if (deleteError) {
      console.error("Error deleting expired locked seats:", deleteError.message);
    }
  }
  
  return { updatedSeats };
}
