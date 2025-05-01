
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
    console.log("Starting bus synchronization");
    
    // Get active operators
    const { data: operators, error: operatorsError } = await supabaseClient
      .from("operator_apis")
      .select("operator_id, operator_name, api_url, api_key")
      .eq("is_active", true);
    
    if (operatorsError) throw operatorsError;
    
    if (!operators || operators.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No active operators found" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Get popular routes
    const { data: routes, error: routesError } = await supabaseClient
      .from("routes")
      .select("*")
      .eq("is_popular", true)
      .limit(20);  // Limit to 20 popular routes
    
    if (routesError) throw routesError;
    
    if (!routes || routes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No routes found" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Generate dates for the next 7 days
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // No longer clearing existing data - removed the deletion logic
    console.log("Keeping existing bus data and fetching new data");
    
    // Try fetching buses from third-party API
    console.log("Attempting to fetch buses from third-party API");
    let busCount = 0;
    let busLayouts = 0;
    let boardingPoints = 0;
    let droppingPoints = 0;
    
    try {
      // First try to get bus data from third-party API
      const { data: thirdPartyBuses, error: thirdPartyBusesError } = await thirdPartyClient
        .from("bus_lists")
        .select("*")
        .limit(500);
      
      if (thirdPartyBusesError) {
        console.warn(`Warning: Failed to fetch buses from third-party API: ${thirdPartyBusesError.message}`);
        throw new Error("Failed to fetch buses from third-party API");
      } else if (thirdPartyBuses && thirdPartyBuses.length > 0) {
        console.log(`Successfully fetched ${thirdPartyBuses.length} buses from third-party API`);
        
        // Process and insert third-party buses
        for (const bus of thirdPartyBuses) {
          // Format bus data to match our schema
          const formattedBus = {
            bus_id: bus.bus_id || `BUS${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            operator_id: bus.operator_id,
            operator_name: bus.operator_name,
            op_bus_id: bus.op_bus_id || bus.bus_id,
            op_route_id: bus.op_route_id || bus.route_id,
            route_id: bus.route_id,
            bus_type: bus.bus_type || "AC",
            bus_category: bus.bus_category || "Sleeper",
            from_city: bus.from_city,
            to_city: bus.to_city,
            journey_date: bus.journey_date || dates[0],
            departure_time: bus.departure_time,
            arrival_time: bus.arrival_time,
            duration: bus.duration,
            available_seats: bus.available_seats || 30,
            singleseats_available: bus.singleseats_available || 10,
            starting_fare: bus.starting_fare || 1000,
            amenities: bus.amenities || JSON.stringify(['WiFi', 'Water Bottle', 'Charging Point']),
            max_lower_column: bus.max_lower_column || 10,
            max_lower_row: bus.max_lower_row || 4,
            max_upper_column: bus.max_upper_column || 10,
            max_upper_row: bus.max_upper_row || 4,
          };
          
          // Insert the bus
          const { data: insertedBus, error: busInsertError } = await supabaseClient
            .from("bus_list")
            .upsert(formattedBus, { onConflict: "bus_id" });
          
          if (busInsertError) {
            console.error(`Error inserting bus ${formattedBus.bus_id}: ${busInsertError.message}`);
            continue;
          }
          
          busCount++;
          
          // Now get layouts for this bus
          try {
            const { data: thirdPartyLayout, error: layoutError } = await thirdPartyClient
              .from("bus_seats")
              .select("*")
              .eq("bus_id", bus.bus_id);
              
            if (layoutError) {
              console.warn(`Warning: Error fetching layout for bus ${bus.bus_id}: ${layoutError.message}`);
            } else if (thirdPartyLayout && thirdPartyLayout.length > 0) {
              // Insert layouts
              for (const seat of thirdPartyLayout) {
                const formattedSeat = {
                  seat_id: seat.seat_id,
                  operator_id: formattedBus.operator_id,
                  operator_name: formattedBus.operator_name,
                  bus_id: formattedBus.bus_id,
                  route_id: formattedBus.route_id,
                  op_seat_id: seat.op_seat_id || seat.seat_id,
                  op_bus_id: formattedBus.op_bus_id,
                  op_route_id: formattedBus.op_route_id,
                  seat_name: seat.seat_name,
                  seat_type: seat.seat_type || formattedBus.bus_category,
                  deck: seat.deck || 'lower',
                  available: seat.available !== undefined ? seat.available : true,
                  original_price: seat.original_price || formattedBus.starting_fare,
                  discounted_price: seat.discounted_price,
                  is_ladies_seat: seat.is_ladies_seat || false,
                  x_pos: seat.x_pos,
                  y_pos: seat.y_pos,
                  z_pos: seat.z_pos || (seat.deck === 'upper' ? 1 : 0),
                  width: seat.width || 1,
                  height: seat.height || 1,
                  is_double_berth: seat.is_double_berth || false,
                  seat_res_type: seat.seat_res_type,
                  date_of_journey: formattedBus.journey_date,
                  max_lower_column: formattedBus.max_lower_column,
                  max_lower_row: formattedBus.max_lower_row,
                  max_upper_column: formattedBus.max_upper_column,
                  max_upper_row: formattedBus.max_upper_row
                };
                
                const { error: seatInsertError } = await supabaseClient
                  .from("bus_layout")
                  .upsert(formattedSeat, { onConflict: "seat_id" });
                  
                if (seatInsertError) {
                  console.error(`Error inserting seat ${formattedSeat.seat_id}: ${seatInsertError.message}`);
                } else {
                  busLayouts++;
                }
              }
            }
          } catch (error) {
            console.warn(`Error processing layout for bus ${bus.bus_id}: ${error.message}`);
          }
          
          // Get boarding points
          try {
            const { data: thirdPartyBoarding, error: boardingError } = await thirdPartyClient
              .from("boarding_points")
              .select("*")
              .eq("bus_id", bus.bus_id);
              
            if (boardingError) {
              console.warn(`Warning: Error fetching boarding points for bus ${bus.bus_id}: ${boardingError.message}`);
            } else if (thirdPartyBoarding && thirdPartyBoarding.length > 0) {
              // Insert boarding points
              for (const bp of thirdPartyBoarding) {
                const formattedBp = {
                  bp_id: bp.bp_id,
                  bus_id: formattedBus.bus_id,
                  route_id: formattedBus.route_id,
                  operator_id: formattedBus.operator_id,
                  operator_name: formattedBus.operator_name,
                  op_bus_id: formattedBus.op_bus_id,
                  op_route_id: formattedBus.op_route_id,
                  op_bp_id: bp.op_bp_id || bp.bp_id,
                  b_point_name: bp.b_point_name,
                  b_time: bp.b_time,
                  b_address: bp.b_address,
                  b_contact: bp.b_contact,
                  b_landmark: bp.b_landmark,
                  b_location: bp.b_location
                };
                
                const { error: bpInsertError } = await supabaseClient
                  .from("boarding_points")
                  .upsert(formattedBp, { onConflict: "bp_id" });
                  
                if (bpInsertError) {
                  console.error(`Error inserting boarding point ${formattedBp.bp_id}: ${bpInsertError.message}`);
                } else {
                  boardingPoints++;
                }
              }
            }
          } catch (error) {
            console.warn(`Error processing boarding points for bus ${bus.bus_id}: ${error.message}`);
          }
          
          // Get dropping points
          try {
            const { data: thirdPartyDropping, error: droppingError } = await thirdPartyClient
              .from("dropping_points")
              .select("*")
              .eq("bus_id", bus.bus_id);
              
            if (droppingError) {
              console.warn(`Warning: Error fetching dropping points for bus ${bus.bus_id}: ${droppingError.message}`);
            } else if (thirdPartyDropping && thirdPartyDropping.length > 0) {
              // Insert dropping points
              for (const dp of thirdPartyDropping) {
                const formattedDp = {
                  dp_id: dp.dp_id,
                  bus_id: formattedBus.bus_id,
                  route_id: formattedBus.route_id,
                  operator_id: formattedBus.operator_id,
                  operator_name: formattedBus.operator_name,
                  op_bus_id: formattedBus.op_bus_id,
                  op_route_id: formattedBus.op_route_id,
                  op_dp_id: dp.op_dp_id || dp.dp_id,
                  d_point_name: dp.d_point_name,
                  d_time: dp.d_time,
                  d_address: dp.d_address,
                  d_contact: dp.d_contact,
                  d_landmark: dp.d_landmark,
                  d_location: dp.d_location
                };
                
                const { error: dpInsertError } = await supabaseClient
                  .from("dropping_points")
                  .upsert(formattedDp, { onConflict: "dp_id" });
                  
                if (dpInsertError) {
                  console.error(`Error inserting dropping point ${formattedDp.dp_id}: ${dpInsertError.message}`);
                } else {
                  droppingPoints++;
                }
              }
            }
          } catch (error) {
            console.warn(`Error processing dropping points for bus ${bus.bus_id}: ${error.message}`);
          }
        }
        
        console.log(`Successfully processed ${busCount} buses from third-party API`);
      } else {
        console.warn("No buses found in third-party API");
        throw new Error("No bus data available from third-party API");
      }
      
    } catch (error) {
      console.warn(`Warning: ${error.message}`);
      console.log("No new data available from third-party API");
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synchronized ${busCount} buses with ${busLayouts} seats, ${boardingPoints} boarding points, and ${droppingPoints} dropping points` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error during bus synchronization:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
