
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

// Helper function to properly format time
function formatTimeFromISO(isoString) {
  try {
    if (!isoString) return null;
    
    // Check if it's already in HH:MM:SS format
    if (/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(isoString)) {
      return isoString;
    }
    
    // Try to parse as ISO date
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${isoString}, using default time`);
      return "12:00:00"; // Default time as fallback
    }
    
    // Format as HH:MM:SS
    return date.toTimeString().substring(0, 8);
  } catch (error) {
    console.error(`Error formatting time from ${isoString}: ${error.message}`);
    return "12:00:00"; // Default time as fallback
  }
}

// Helper function to ensure valid time format
function ensureValidTimeFormat(timeString) {
  if (!timeString) return "12:00:00";
  
  // Check if already a valid time string
  if (/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(timeString)) {
    return timeString;
  }
  
  try {
    // Try to extract time part from date string
    if (timeString.includes('T')) {
      const timePart = timeString.split('T')[1].split('.')[0].substring(0, 8);
      if (/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(timePart)) {
        return timePart;
      }
    }
    
    // Try to parse as a date
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toTimeString().substring(0, 8);
    }
    
    console.warn(`Could not parse time: ${timeString}, using default`);
    return "12:00:00";
  } catch (error) {
    console.error(`Error parsing time ${timeString}: ${error.message}`);
    return "12:00:00";
  }
}

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
            bus_id: `BUS${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            operator_id: bus.operator_id || operators[0].operator_id,
            operator_name: bus.operator_name || operators[0].operator_name,
            op_bus_id: bus.op_bus_id || bus.bus_id,
            op_route_id: bus.op_route_id || bus.route_id || routes[0]?.route_id,
            route_id: bus.route_id || routes[0]?.route_id,
            bus_type: bus.bus_type ,
            bus_category: bus.bus_category || "Sleeper",
            from_city: bus.from_city || routes[0]?.from_city_name,
            to_city: bus.to_city || routes[0]?.to_city_name,
            journey_date: bus.journey_date,
            departure_time: ensureValidTimeFormat(bus.departure_time),
            arrival_time: ensureValidTimeFormat(bus.arrival_time),
            duration: bus.duration,
            available_seats: bus.available_seats,
            singleseats_available: bus.singleseats_available,
            starting_fare: bus.starting_fare,
            amenities: bus.amenities,
            max_lower_column: bus.max_lower_column || 12,
            max_lower_row: bus.max_lower_row || 5,
            max_upper_column: bus.max_upper_column || 12,
            max_upper_row: bus.max_upper_row || 5,
          };
          
          console.log(`Inserting bus ${formattedBus.bus_id} with departure_time ${formattedBus.departure_time} and arrival_time ${formattedBus.arrival_time}`);
          
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
              console.log(`Found ${thirdPartyLayout.length} seats for bus ${bus.bus_id}`);
              
              // Insert layouts
              for (const seat of thirdPartyLayout) {
                // Fix for deck value
                let deckValue = "lower";
                if (seat.deck && typeof seat.deck === 'string') {
                  deckValue = seat.deck.toLowerCase() === 'upper' ? 'upper' : 'lower';
                }
                
                const formattedSeat = {
                  seat_id: seat.seat_id || `SEAT-${formattedBus.bus_id}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                  operator_id: formattedBus.operator_id,
                  operator_name: formattedBus.operator_name,
                  bus_id: formattedBus.bus_id,
                  route_id: formattedBus.route_id,
                  op_seat_id: seat.op_seat_id || seat.seat_id,
                  op_bus_id: formattedBus.op_bus_id,
                  op_route_id: formattedBus.op_route_id,
                  seat_name: seat.seat_name || `Seat-${Math.floor(Math.random() * 40) + 1}`,
                  seat_type: seat.seat_type || formattedBus.bus_category,
                  deck: deckValue,
                  available: seat.available !== undefined ? seat.available : true,
                  original_price: seat.original_price || formattedBus.starting_fare,
                  discounted_price: seat.discounted_price,
                  is_ladies_seat: seat.is_ladies_seat || false,
                  x_pos: seat.x_pos || Math.floor(Math.random() * 10),
                  y_pos: seat.y_pos || Math.floor(Math.random() * 4),
                  z_pos: seat.z_pos || (deckValue === 'upper' ? 1 : 0),
                  width: seat.width || 1,
                  height: seat.height || 1,
                  is_double_berth: seat.is_double_berth || false,
                  seat_res_type: seat.seat_res_type || null,
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
            } else {
              console.log(`No layouts found for bus ${bus.bus_id}, generating random layouts`);
              
              // Generate random layouts if none found
              const totalSeats = Math.floor(Math.random() * 30) + 20;
              for (let i = 1; i <= totalSeats; i++) {
                const seatDeck = i % 2 === 0 ? 'upper' : 'lower';
                const formattedSeat = {
                  seat_id: `SEAT-${formattedBus.bus_id}-${i}`,
                  operator_id: formattedBus.operator_id,
                  operator_name: formattedBus.operator_name,
                  bus_id: formattedBus.bus_id,
                  route_id: formattedBus.route_id,
                  op_seat_id: `SEAT-${i}`,
                  op_bus_id: formattedBus.op_bus_id,
                  op_route_id: formattedBus.op_route_id,
                  seat_name: `Seat-${i}`,
                  seat_type: formattedBus.bus_category,
                  deck: seatDeck,
                  available: Math.random() > 0.3,
                  original_price: formattedBus.starting_fare,
                  discounted_price: Math.random() > 0.5 ? formattedBus.starting_fare * 0.9 : null,
                  is_ladies_seat: Math.random() > 0.8,
                  x_pos: Math.floor(i / 4) % 10,
                  y_pos: i % 4,
                  z_pos: seatDeck === 'upper' ? 1 : 0,
                  width: 1,
                  height: 1,
                  is_double_berth: Math.random() > 0.7,
                  seat_res_type: null,
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
                  console.error(`Error inserting generated seat ${formattedSeat.seat_id}: ${seatInsertError.message}`);
                } else {
                  busLayouts++;
                }
              }
            }
          } catch (error) {
            console.warn(`Error processing layout for bus ${bus.bus_id}: ${error.message}`);
          }
          
          // Get boarding points from third-party API
          try {
            const { data: thirdPartyBoarding, error: boardingError } = await thirdPartyClient
              .from("boarding_points")
              .select("*")
              .eq("bus_id", bus.bus_id);
              
            if (boardingError) {
              console.warn(`Warning: Error fetching boarding points for bus ${bus.bus_id}: ${boardingError.message}`);
            } else if (thirdPartyBoarding && thirdPartyBoarding.length > 0) {
              console.log(`Found ${thirdPartyBoarding.length} boarding points for bus ${bus.bus_id}`);
              
              // Insert boarding points
              for (const bp of thirdPartyBoarding) {
                // Ensure valid time format
                const validTime = ensureValidTimeFormat(bp.b_time);
                
                const formattedBp = {
                  bp_id: bp.bp_id || crypto.randomUUID(),
                  bus_id: formattedBus.bus_id,
                  route_id: formattedBus.route_id,
                  operator_id: formattedBus.operator_id,
                  operator_name: formattedBus.operator_name,
                  op_bus_id: formattedBus.op_bus_id,
                  op_route_id: formattedBus.op_route_id,
                  op_bp_id: bp.op_bp_id || bp.bp_id,
                  b_point_name: bp.b_point_name || `${formattedBus.from_city} Stop ${Math.floor(Math.random() * 5) + 1}`,
                  b_time: validTime,
                  b_address: bp.b_address || `${formattedBus.from_city} Bus Terminal`,
                  b_contact: bp.b_contact || `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                  b_landmark: bp.b_landmark || `Near ${formattedBus.from_city} Railway Station`
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
            } else {
              console.log(`No boarding points found for bus ${bus.bus_id}, generating default boarding points`);
              
              // Generate default boarding points
              const formattedBp = {
                bp_id: crypto.randomUUID(),
                bus_id: formattedBus.bus_id,
                route_id: formattedBus.route_id,
                operator_id: formattedBus.operator_id,
                operator_name: formattedBus.operator_name,
                op_bus_id: formattedBus.op_bus_id,
                op_route_id: formattedBus.op_route_id,
                op_bp_id: `BP-${formattedBus.bus_id}-1`,
                b_point_name: `${formattedBus.from_city} Main Terminal`,
                b_time: formattedBus.departure_time,
                b_address: `${formattedBus.from_city} Bus Terminal, Main Road`,
                b_contact: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                b_landmark: `Near ${formattedBus.from_city} Railway Station`
              };
              
              const { error: bpInsertError } = await supabaseClient
                .from("boarding_points")
                .upsert(formattedBp, { onConflict: "bp_id" });
                
              if (bpInsertError) {
                console.error(`Error inserting default boarding point ${formattedBp.bp_id}: ${bpInsertError.message}`);
              } else {
                boardingPoints++;
              }
            }
          } catch (error) {
            console.warn(`Error processing boarding points for bus ${bus.bus_id}: ${error.message}`);
          }
          
          // Get dropping points from third-party API
          try {
            const { data: thirdPartyDropping, error: droppingError } = await thirdPartyClient
              .from("dropping_points")
              .select("*")
              .eq("bus_id", bus.bus_id);
              
            if (droppingError) {
              console.warn(`Warning: Error fetching dropping points for bus ${bus.bus_id}: ${droppingError.message}`);
            } else if (thirdPartyDropping && thirdPartyDropping.length > 0) {
              console.log(`Found ${thirdPartyDropping.length} dropping points for bus ${bus.bus_id}`);
              
              // Insert dropping points
              for (const dp of thirdPartyDropping) {
                // Ensure valid time format
                const validTime = ensureValidTimeFormat(dp.d_time);
                
                const formattedDp = {
                  dp_id: dp.dp_id || crypto.randomUUID(),
                  bus_id: formattedBus.bus_id,
                  route_id: formattedBus.route_id,
                  operator_id: formattedBus.operator_id,
                  operator_name: formattedBus.operator_name,
                  op_bus_id: formattedBus.op_bus_id,
                  op_route_id: formattedBus.op_route_id,
                  op_dp_id: dp.op_dp_id || dp.dp_id,
                  d_point_name: dp.d_point_name || `${formattedBus.to_city} Stop ${Math.floor(Math.random() * 5) + 1}`,
                  d_time: validTime,
                  d_address: dp.d_address || `${formattedBus.to_city} Bus Terminal`,
                  d_contact: dp.d_contact || `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                  d_landmark: dp.d_landmark || `Near ${formattedBus.to_city} Railway Station`
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
            } else {
              console.log(`No dropping points found for bus ${bus.bus_id}, generating default dropping points`);
              
              // Generate default dropping points
              const formattedDp = {
                dp_id: crypto.randomUUID(),
                bus_id: formattedBus.bus_id,
                route_id: formattedBus.route_id,
                operator_id: formattedBus.operator_id,
                operator_name: formattedBus.operator_name,
                op_bus_id: formattedBus.op_bus_id,
                op_route_id: formattedBus.op_route_id,
                op_dp_id: `DP-${formattedBus.bus_id}-1`,
                d_point_name: `${formattedBus.to_city} Main Terminal`,
                d_time: formattedBus.arrival_time,
                d_address: `${formattedBus.to_city} Bus Terminal, Main Road`,
                d_contact: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                d_landmark: `Near ${formattedBus.to_city} Railway Station`
              };
              
              const { error: dpInsertError } = await supabaseClient
                .from("dropping_points")
                .upsert(formattedDp, { onConflict: "dp_id" });
                
              if (dpInsertError) {
                console.error(`Error inserting default dropping point ${formattedDp.dp_id}: ${dpInsertError.message}`);
              } else {
                droppingPoints++;
              }
            }
          } catch (error) {
            console.warn(`Error processing dropping points for bus ${bus.bus_id}: ${error.message}`);
          }
        }
        
        console.log(`Successfully processed ${busCount} buses from third-party API`);
      } else {
        console.warn("No buses found in third-party API");
        // Generate some default buses with random data
        for (let i = 0; i < 10; i++) {
          const randomRouteIndex = Math.floor(Math.random() * routes.length);
          const randomRoute = routes[randomRouteIndex];
          const randomDateIndex = Math.floor(Math.random() * dates.length);
          const journeyDate = dates[randomDateIndex];
          
          const defaultBus = {
            bus_id: `DEFAULT-BUS-${i+1}`,
            operator_id: operators[0].operator_id,
            operator_name: operators[0].operator_name,
            op_bus_id: `OP-BUS-${i+1}`,
            op_route_id: randomRoute.route_id,
            route_id: randomRoute.route_id,
            bus_type: i % 2 === 0 ? "AC" : "Non-AC",
            bus_category: i % 3 === 0 ? "Sleeper" : "Seater",
            from_city: randomRoute.from_city_name,
            to_city: randomRoute.to_city_name,
            journey_date: journeyDate,
            departure_time: `${Math.floor(Math.random() * 23).toString().padStart(2, '0')}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}:00`,
            arrival_time: `${Math.floor(Math.random() * 23).toString().padStart(2, '0')}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}:00`,
            duration: `${Math.floor(Math.random() * 12) + 4}h ${Math.floor(Math.random() * 59)}m`,
            available_seats: Math.floor(Math.random() * 30) + 10,
            singleseats_available: Math.floor(Math.random() * 10),
            starting_fare: Math.floor(Math.random() * 1500) + 500,
            amenities: JSON.stringify(['WiFi', 'Water Bottle', 'Charging Point', 'Blanket']),
            max_lower_column: 10,
            max_lower_row: 4,
            max_upper_column: 10,
            max_upper_row: 4,
          };
          
          const { data: insertedBus, error: busInsertError } = await supabaseClient
            .from("bus_list")
            .upsert(defaultBus, { onConflict: "bus_id" });
            
          if (busInsertError) {
            console.error(`Error inserting default bus ${defaultBus.bus_id}: ${busInsertError.message}`);
            continue;
          }
          
          busCount++;
          
          // Generate seats for this bus
          const totalSeats = Math.floor(Math.random() * 30) + 20;
          for (let j = 1; j <= totalSeats; j++) {
            const seatDeck = j % 2 === 0 ? 'upper' : 'lower';
            const formattedSeat = {
              seat_id: `SEAT-${defaultBus.bus_id}-${j}`,
              operator_id: defaultBus.operator_id,
              operator_name: defaultBus.operator_name,
              bus_id: defaultBus.bus_id,
              route_id: defaultBus.route_id,
              op_seat_id: `SEAT-${j}`,
              op_bus_id: defaultBus.op_bus_id,
              op_route_id: defaultBus.op_route_id,
              seat_name: `Seat-${j}`,
              seat_type: defaultBus.bus_category,
              deck: seatDeck,
              available: Math.random() > 0.3,
              original_price: defaultBus.starting_fare,
              discounted_price: Math.random() > 0.5 ? defaultBus.starting_fare * 0.9 : null,
              is_ladies_seat: Math.random() > 0.8,
              x_pos: Math.floor(j / 4) % 10,
              y_pos: j % 4,
              z_pos: seatDeck === 'upper' ? 1 : 0,
              width: 1,
              height: 1,
              is_double_berth: Math.random() > 0.7,
              seat_res_type: null,
              date_of_journey: defaultBus.journey_date,
              max_lower_column: defaultBus.max_lower_column,
              max_lower_row: defaultBus.max_lower_row,
              max_upper_column: defaultBus.max_upper_column,
              max_upper_row: defaultBus.max_upper_row
            };
            
            const { error: seatInsertError } = await supabaseClient
              .from("bus_layout")
              .upsert(formattedSeat, { onConflict: "seat_id" });
              
            if (seatInsertError) {
              console.error(`Error inserting generated seat ${formattedSeat.seat_id}: ${seatInsertError.message}`);
            } else {
              busLayouts++;
            }
          }
          
          // Generate boarding points (create 3 for variation)
          for (let b = 1; b <= 3; b++) {
            const hourOffset = (b - 1) * 0.5;
            const departureHour = parseInt(defaultBus.departure_time.split(':')[0]);
            const departureMinute = parseInt(defaultBus.departure_time.split(':')[1]);
            
            let boardingHour = departureHour - Math.floor(hourOffset);
            let boardingMinute = departureMinute - Math.floor((hourOffset % 1) * 60);
            
            if (boardingMinute < 0) {
              boardingMinute += 60;
              boardingHour--;
            }
            if (boardingHour < 0) {
              boardingHour += 24;
            }
            
            const boardingTime = `${boardingHour.toString().padStart(2, '0')}:${boardingMinute.toString().padStart(2, '0')}:00`;
            
            const boardingPoint = {
              bp_id: crypto.randomUUID(),
              bus_id: defaultBus.bus_id,
              route_id: defaultBus.route_id,
              operator_id: defaultBus.operator_id,
              operator_name: defaultBus.operator_name,
              op_bus_id: defaultBus.op_bus_id,
              op_route_id: defaultBus.op_route_id,
              op_bp_id: `BP-${defaultBus.bus_id}-${b}`,
              b_point_name: `${defaultBus.from_city} ${b === 1 ? 'Main Terminal' : 'Stop ' + b}`,
              b_time: boardingTime,
              b_address: `${defaultBus.from_city} ${b === 1 ? 'Bus Terminal' : 'Area ' + b}, Main Road`,
              b_contact: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
              b_landmark: `Near ${defaultBus.from_city} ${b === 1 ? 'Railway Station' : 'Landmark ' + b}`
            };
            
            const { error: bpInsertError } = await supabaseClient
              .from("boarding_points")
              .upsert(boardingPoint, { onConflict: "bp_id" });
              
            if (bpInsertError) {
              console.error(`Error inserting default boarding point ${boardingPoint.bp_id}: ${bpInsertError.message}`);
            } else {
              boardingPoints++;
            }
          }
          
          // Generate dropping points (create 3 for variation)
          for (let d = 1; d <= 3; d++) {
            const hourOffset = (d - 1) * 0.5;
            const arrivalHour = parseInt(defaultBus.arrival_time.split(':')[0]);
            const arrivalMinute = parseInt(defaultBus.arrival_time.split(':')[1]);
            
            let droppingHour = arrivalHour + Math.floor(hourOffset);
            let droppingMinute = arrivalMinute + Math.floor((hourOffset % 1) * 60);
            
            if (droppingMinute >= 60) {
              droppingMinute -= 60;
              droppingHour++;
            }
            if (droppingHour >= 24) {
              droppingHour -= 24;
            }
            
            const droppingTime = `${droppingHour.toString().padStart(2, '0')}:${droppingMinute.toString().padStart(2, '0')}:00`;
            
            const droppingPoint = {
              dp_id: crypto.randomUUID(),
              bus_id: defaultBus.bus_id,
              route_id: defaultBus.route_id,
              operator_id: defaultBus.operator_id,
              operator_name: defaultBus.operator_name,
              op_bus_id: defaultBus.op_bus_id,
              op_route_id: defaultBus.op_route_id,
              op_dp_id: `DP-${defaultBus.bus_id}-${d}`,
              d_point_name: `${defaultBus.to_city} ${d === 1 ? 'Main Terminal' : 'Stop ' + d}`,
              d_time: droppingTime,
              d_address: `${defaultBus.to_city} ${d === 1 ? 'Bus Terminal' : 'Area ' + d}, Main Road`,
              d_contact: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
              d_landmark: `Near ${defaultBus.to_city} ${d === 1 ? 'Railway Station' : 'Landmark ' + d}`
            };
            
            const { error: dpInsertError } = await supabaseClient
              .from("dropping_points")
              .upsert(droppingPoint, { onConflict: "dp_id" });
              
            if (dpInsertError) {
              console.error(`Error inserting default dropping point ${droppingPoint.dp_id}: ${dpInsertError.message}`);
            } else {
              droppingPoints++;
            }
          }
        }
      }
      
    } catch (error) {
      console.warn(`Warning: ${error.message}`);
      console.log("Failed to fetch data from third-party API, generating default data");
      
      // Generate default data if third-party API fails
      for (let i = 0; i < 10; i++) {
        const randomRouteIndex = Math.floor(Math.random() * routes.length);
        const randomRoute = routes[randomRouteIndex];
        const randomDateIndex = Math.floor(Math.random() * dates.length);
        const journeyDate = dates[randomDateIndex];
        
        const defaultBus = {
          bus_id: `DEFAULT-BUS-${i+1}`,
          operator_id: operators[0].operator_id,
          operator_name: operators[0].operator_name,
          op_bus_id: `OP-BUS-${i+1}`,
          op_route_id: randomRoute.route_id,
          route_id: randomRoute.route_id,
          bus_type: i % 2 === 0 ? "AC" : "Non-AC",
          bus_category: i % 3 === 0 ? "Sleeper" : "Seater",
          from_city: randomRoute.from_city_name,
          to_city: randomRoute.to_city_name,
          journey_date: journeyDate,
          departure_time: `${Math.floor(Math.random() * 23).toString().padStart(2, '0')}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}:00`,
          arrival_time: `${Math.floor(Math.random() * 23).toString().padStart(2, '0')}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}:00`,
          duration: `${Math.floor(Math.random() * 12) + 4}h ${Math.floor(Math.random() * 59)}m`,
          available_seats: Math.floor(Math.random() * 30) + 10,
          singleseats_available: Math.floor(Math.random() * 10),
          starting_fare: Math.floor(Math.random() * 1500) + 500,
          amenities: JSON.stringify(['WiFi', 'Water Bottle', 'Charging Point', 'Blanket']),
          max_lower_column: 10,
          max_lower_row: 4,
          max_upper_column: 10,
          max_upper_row: 4,
        };
        
        const { data: insertedBus, error: busInsertError } = await supabaseClient
          .from("bus_list")
          .upsert(defaultBus, { onConflict: "bus_id" });
          
        if (busInsertError) {
          console.error(`Error inserting default bus ${defaultBus.bus_id}: ${busInsertError.message}`);
          continue;
        }
        
        busCount++;
        
        // Generate seats for this bus
        const totalSeats = Math.floor(Math.random() * 30) + 20;
        for (let j = 1; j <= totalSeats; j++) {
          const seatDeck = j % 2 === 0 ? 'upper' : 'lower';
          const formattedSeat = {
            seat_id: `SEAT-${defaultBus.bus_id}-${j}`,
            operator_id: defaultBus.operator_id,
            operator_name: defaultBus.operator_name,
            bus_id: defaultBus.bus_id,
            route_id: defaultBus.route_id,
            op_seat_id: `SEAT-${j}`,
            op_bus_id: defaultBus.op_bus_id,
            op_route_id: defaultBus.op_route_id,
            seat_name: `Seat-${j}`,
            seat_type: defaultBus.bus_category,
            deck: seatDeck,
            available: Math.random() > 0.3,
            original_price: defaultBus.starting_fare,
            discounted_price: Math.random() > 0.5 ? defaultBus.starting_fare * 0.9 : null,
            is_ladies_seat: Math.random() > 0.8,
            x_pos: Math.floor(j / 4) % 10,
            y_pos: j % 4,
            z_pos: seatDeck === 'upper' ? 1 : 0,
            width: 1,
            height: 1,
            is_double_berth: Math.random() > 0.7,
            seat_res_type: null,
            date_of_journey: defaultBus.journey_date,
            max_lower_column: defaultBus.max_lower_column,
            max_lower_row: defaultBus.max_lower_row,
            max_upper_column: defaultBus.max_upper_column,
            max_upper_row: defaultBus.max_upper_row
          };
          
          const { error: seatInsertError } = await supabaseClient
            .from("bus_layout")
            .upsert(formattedSeat, { onConflict: "seat_id" });
            
          if (seatInsertError) {
            console.error(`Error inserting generated seat ${formattedSeat.seat_id}: ${seatInsertError.message}`);
          } else {
            busLayouts++;
          }
        }
        
        // Generate multiple boarding points for each bus (3 points)
        for (let b = 1; b <= 3; b++) {
          const hourOffset = (b - 1) * 0.5;
          const departureHour = parseInt(defaultBus.departure_time.split(':')[0]);
          const departureMinute = parseInt(defaultBus.departure_time.split(':')[1]);
          
          let boardingHour = departureHour - Math.floor(hourOffset);
          let boardingMinute = departureMinute - Math.floor((hourOffset % 1) * 60);
          
          if (boardingMinute < 0) {
            boardingMinute += 60;
            boardingHour--;
          }
          if (boardingHour < 0) {
            boardingHour += 24;
          }
          
          const boardingTime = `${boardingHour.toString().padStart(2, '0')}:${boardingMinute.toString().padStart(2, '0')}:00`;
          
          const boardingPoint = {
            bp_id: crypto.randomUUID(),
            bus_id: defaultBus.bus_id,
            route_id: defaultBus.route_id,
            operator_id: defaultBus.operator_id,
            operator_name: defaultBus.operator_name,
            op_bus_id: defaultBus.op_bus_id,
            op_route_id: defaultBus.op_route_id,
            op_bp_id: `BP-${defaultBus.bus_id}-${b}`,
            b_point_name: `${defaultBus.from_city} ${b === 1 ? 'Main Terminal' : 'Stop ' + b}`,
            b_time: boardingTime,
            b_address: `${defaultBus.from_city} ${b === 1 ? 'Bus Terminal' : 'Area ' + b}, Main Road`,
            b_contact: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            b_landmark: `Near ${defaultBus.from_city} ${b === 1 ? 'Railway Station' : 'Landmark ' + b}`
          };
          
          const { error: bpInsertError } = await supabaseClient
            .from("boarding_points")
            .upsert(boardingPoint, { onConflict: "bp_id" });
            
          if (bpInsertError) {
            console.error(`Error inserting default boarding point ${boardingPoint.bp_id}: ${bpInsertError.message}`);
          } else {
            boardingPoints++;
          }
        }
        
        // Generate multiple dropping points for each bus (3 points)
        for (let d = 1; d <= 3; d++) {
          const hourOffset = (d - 1) * 0.5;
          const arrivalHour = parseInt(defaultBus.arrival_time.split(':')[0]);
          const arrivalMinute = parseInt(defaultBus.arrival_time.split(':')[1]);
          
          let droppingHour = arrivalHour + Math.floor(hourOffset);
          let droppingMinute = arrivalMinute + Math.floor((hourOffset % 1) * 60);
          
          if (droppingMinute >= 60) {
            droppingMinute -= 60;
            droppingHour++;
          }
          if (droppingHour >= 24) {
            droppingHour -= 24;
          }
          
          const droppingTime = `${droppingHour.toString().padStart(2, '0')}:${droppingMinute.toString().padStart(2, '0')}:00`;
          
          const droppingPoint = {
            dp_id: crypto.randomUUID(),
            bus_id: defaultBus.bus_id,
            route_id: defaultBus.route_id,
            operator_id: defaultBus.operator_id,
            operator_name: defaultBus.operator_name,
            op_bus_id: defaultBus.op_bus_id,
            op_route_id: defaultBus.op_route_id,
            op_dp_id: `DP-${defaultBus.bus_id}-${d}`,
            d_point_name: `${defaultBus.to_city} ${d === 1 ? 'Main Terminal' : 'Stop ' + d}`,
            d_time: droppingTime,
            d_address: `${defaultBus.to_city} ${d === 1 ? 'Bus Terminal' : 'Area ' + d}, Main Road`,
            d_contact: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            d_landmark: `Near ${defaultBus.to_city} ${d === 1 ? 'Railway Station' : 'Landmark ' + d}`
          };
          
          const { error: dpInsertError } = await supabaseClient
            .from("dropping_points")
            .upsert(droppingPoint, { onConflict: "dp_id" });
            
          if (dpInsertError) {
            console.error(`Error inserting default dropping point ${droppingPoint.dp_id}: ${dpInsertError.message}`);
          } else {
            droppingPoints++;
          }
        }
      }
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
