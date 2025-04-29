
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
    
    // Get popular routes
    const { data: routes, error: routesError } = await supabaseClient
      .from("routes")
      .select("*")
      .eq("is_popular", true)
      .limit(20);  // Limit to 20 popular routes
    
    if (routesError) throw routesError;
    
    // Generate dates for the next 7 days
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Clear existing data
    console.log("Clearing existing bus data");
    
    // Clear bus_list table
    const { error: deleteBusesError } = await supabaseClient
      .from("bus_list")
      .delete()
      .gte('id', 0);
    
    if (deleteBusesError) {
      console.warn(`Warning when clearing buses: ${deleteBusesError.message}`);
    }
    
    // Clear bus_layout table
    const { error: deleteLayoutError } = await supabaseClient
      .from("bus_layout")
      .delete()
      .gte('id', 0);
    
    if (deleteLayoutError) {
      console.warn(`Warning when clearing layouts: ${deleteLayoutError.message}`);
    }
    
    // Clear boarding_points table
    const { error: deleteBoardingError } = await supabaseClient
      .from("boarding_points")
      .delete()
      .gte('id', 0);
    
    if (deleteBoardingError) {
      console.warn(`Warning when clearing boarding points: ${deleteBoardingError.message}`);
    }
    
    // Clear dropping_points table
    const { error: deleteDroppingError } = await supabaseClient
      .from("dropping_points")
      .delete()
      .gte('id', 0);
    
    if (deleteDroppingError) {
      console.warn(`Warning when clearing dropping points: ${deleteDroppingError.message}`);
    }
    
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
            .upsert(formattedBus);
          
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
                  .upsert(formattedSeat);
                  
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
                  .upsert(formattedBp);
                  
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
                  .upsert(formattedDp);
                  
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
        console.warn("No buses found in third-party API, will generate mock data");
        throw new Error("No bus data available from third-party API");
      }
      
    } catch (error) {
      console.warn(`Warning: ${error.message}`);
      console.log("Generating mock bus data as fallback");
      
      // If third-party API fetch failed, generate mock data
      for (const operator of operators) {
        for (const route of routes) {
          for (const journeyDate of dates) {
            // Generate random number of buses for each route/date (1-5)
            const busesForRoute = Math.floor(Math.random() * 5) + 1;
            
            for (let i = 0; i < busesForRoute; i++) {
              const mockBus = generateMockBusForRoute(operator, route, journeyDate, i);
              
              // Insert the bus
              const { error: busError } = await supabaseClient
                .from("bus_list")
                .upsert(mockBus);
              
              if (busError) {
                console.error(`Error inserting mock bus: ${busError.message}`);
                continue;
              }
              
              busCount++;
              
              // Create mock seat layout
              const seatLayout = generateMockSeatLayout(mockBus);
              
              if (seatLayout.length > 0) {
                for (const seat of seatLayout) {
                  const { error: layoutError } = await supabaseClient
                    .from("bus_layout")
                    .upsert(seat);
                  
                  if (layoutError) {
                    console.error(`Error inserting mock seat: ${layoutError.message}`);
                  } else {
                    busLayouts++;
                  }
                }
              }
              
              // Create mock boarding points
              const mockBoardingPoints = generateMockBoardingPoints(mockBus);
              
              if (mockBoardingPoints.length > 0) {
                for (const bp of mockBoardingPoints) {
                  const { error: bpError } = await supabaseClient
                    .from("boarding_points")
                    .upsert(bp);
                  
                  if (bpError) {
                    console.error(`Error inserting mock boarding point: ${bpError.message}`);
                  } else {
                    boardingPoints++;
                  }
                }
              }
              
              // Create mock dropping points
              const mockDroppingPoints = generateMockDroppingPoints(mockBus);
              
              if (mockDroppingPoints.length > 0) {
                for (const dp of mockDroppingPoints) {
                  const { error: dpError } = await supabaseClient
                    .from("dropping_points")
                    .upsert(dp);
                  
                  if (dpError) {
                    console.error(`Error inserting mock dropping point: ${dpError.message}`);
                  } else {
                    droppingPoints++;
                  }
                }
              }
            }
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

// Helper function to generate a mock bus
function generateMockBusForRoute(operator, route, journeyDate, index) {
  const busTypes = ['AC', 'Non-AC'];
  const busCategories = ['Sleeper', 'Seater', 'Semi-Sleeper'];
  const busTimes = [
    { departure: '06:00:00', arrival: '14:00:00', duration: '8h 0m' },
    { departure: '08:30:00', arrival: '17:30:00', duration: '9h 0m' },
    { departure: '12:00:00', arrival: '20:00:00', duration: '8h 0m' },
    { departure: '16:30:00', arrival: '01:30:00', duration: '9h 0m' },
    { departure: '21:00:00', arrival: '05:00:00', duration: '8h 0m' },
    { departure: '22:30:00', arrival: '07:30:00', duration: '9h 0m' },
  ];
  
  const busType = busTypes[Math.floor(Math.random() * busTypes.length)];
  const busCategory = busCategories[Math.floor(Math.random() * busCategories.length)];
  const timeSlot = busTimes[Math.floor(Math.random() * busTimes.length)];
  const fare = Math.floor(Math.random() * 1500) + 500; // Random fare between 500-2000
  const availableSeats = Math.floor(Math.random() * 30) + 10; // 10-40 seats
  const singleSeats = Math.floor(availableSeats * 0.3); // About 30% are single seats
  
  // Layout dimensions based on bus type
  let maxLowerColumn = 10;
  let maxLowerRow = 4;
  let maxUpperColumn = 10;
  let maxUpperRow = 4;
  
  if (busCategory === 'Sleeper') {
    maxLowerColumn = 9;
    maxLowerRow = 3;
    maxUpperColumn = 9;
    maxUpperRow = 3;
  }
  
  const busId = `BUS${operator.operator_id}${route.route_id}${journeyDate.replace(/-/g, '')}${index}`;
  
  return {
    bus_id: busId,
    operator_id: operator.operator_id,
    operator_name: operator.operator_name,
    op_bus_id: `OP_${busId}`,
    op_route_id: `OP_${route.route_id}`,
    route_id: route.route_id,
    bus_type: busType,
    bus_category: busCategory,
    from_city: route.from_city_name,
    to_city: route.to_city_name,
    journey_date: journeyDate,
    departure_time: timeSlot.departure,
    arrival_time: timeSlot.arrival,
    duration: timeSlot.duration,
    available_seats: availableSeats,
    singleseats_available: singleSeats,
    starting_fare: fare,
    amenities: JSON.stringify(['WiFi', 'Water Bottle', 'Charging Point', 'Reading Light']),
    max_lower_column: maxLowerColumn,
    max_lower_row: maxLowerRow,
    max_upper_column: maxUpperColumn,
    max_upper_row: maxUpperRow
  };
}

// Helper function to generate mock seat layout
function generateMockSeatLayout(bus) {
  const seats = [];
  const seatTypes = ['Sleeper', 'Seater'];
  
  // Layout configuration
  const lowerMaxRow = bus.max_lower_row;
  const lowerMaxCol = bus.max_lower_column;
  const upperMaxRow = bus.max_upper_row;
  const upperMaxCol = bus.max_upper_column;
  
  let seatCounter = 1;
  
  // Generate lower deck seats
  for (let row = 0; row < lowerMaxRow; row++) {
    for (let col = 0; col < lowerMaxCol; col++) {
      // Skip some positions to create aisle space
      if (col === 1 || (row === 1 && col === 3)) continue;
      
      const seatType = bus.bus_category === 'Sleeper' ? 'Sleeper' : 'Seater';
      const width = seatType === 'Sleeper' ? 1 : 1;
      const height = seatType === 'Sleeper' ? 2 : 1;
      
      // Skip if it would overlap with an existing seat
      if (seatType === 'Sleeper' && row + height > lowerMaxRow) continue;
      
      const isLadiesSeat = Math.random() < 0.1; // 10% chance of being a ladies seat
      const isAvailable = Math.random() < 0.8; // 80% chance of being available
      const isDoubleBerth = seatType === 'Sleeper' && Math.random() < 0.7; // 70% chance for sleepers
      
      const originalPrice = bus.starting_fare + (seatType === 'Sleeper' ? 200 : 0);
      const discountedPrice = Math.random() < 0.3 ? originalPrice * 0.9 : null; // 30% chance of discount
      
      const seatResType = isLadiesSeat ? 'Reserved_for_female' : null;
      
      seats.push({
        seat_id: `SEAT${bus.bus_id}L${seatCounter}`,
        operator_id: bus.operator_id,
        operator_name: bus.operator_name,
        bus_id: bus.bus_id,
        route_id: bus.route_id,
        op_seat_id: `OP_SEAT${bus.op_bus_id}L${seatCounter}`,
        op_bus_id: bus.op_bus_id,
        op_route_id: bus.op_route_id,
        seat_name: `L${seatCounter}`,
        seat_type: seatType,
        deck: 'lower',
        available: isAvailable,
        original_price: originalPrice,
        discounted_price: discountedPrice,
        is_ladies_seat: isLadiesSeat,
        x_pos: col,
        y_pos: row,
        z_pos: 0, // Lower deck
        width: width,
        height: height,
        is_double_berth: isDoubleBerth,
        seat_res_type: seatResType,
        date_of_journey: bus.journey_date,
        max_lower_column: bus.max_lower_column,
        max_lower_row: bus.max_lower_row,
        max_upper_column: bus.max_upper_column,
        max_upper_row: bus.max_upper_row
      });
      
      seatCounter++;
    }
  }
  
  // Reset counter for upper deck
  seatCounter = 1;
  
  // Generate upper deck seats
  if (bus.bus_category === 'Sleeper') { // Only create upper deck for sleeper buses
    for (let row = 0; row < upperMaxRow; row++) {
      for (let col = 0; col < upperMaxCol; col++) {
        // Skip some positions to create aisle space
        if (col === 1 || (row === 1 && col === 3)) continue;
        
        const seatType = 'Sleeper';
        const width = 1;
        const height = 2;
        
        // Skip if it would overlap with an existing seat
        if (row + height > upperMaxRow) continue;
        
        const isLadiesSeat = Math.random() < 0.1; // 10% chance of being a ladies seat
        const isAvailable = Math.random() < 0.8; // 80% chance of being available
        const isDoubleBerth = Math.random() < 0.7; // 70% chance for sleepers
        
        const originalPrice = bus.starting_fare + 200 + 50; // Upper deck costs more
        const discountedPrice = Math.random() < 0.3 ? originalPrice * 0.9 : null; // 30% chance of discount
        
        const seatResType = isLadiesSeat ? 'Reserved_for_female' : null;
        
        seats.push({
          seat_id: `SEAT${bus.bus_id}U${seatCounter}`,
          operator_id: bus.operator_id,
          operator_name: bus.operator_name,
          bus_id: bus.bus_id,
          route_id: bus.route_id,
          op_seat_id: `OP_SEAT${bus.op_bus_id}U${seatCounter}`,
          op_bus_id: bus.op_bus_id,
          op_route_id: bus.op_route_id,
          seat_name: `U${seatCounter}`,
          seat_type: seatType,
          deck: 'upper',
          available: isAvailable,
          original_price: originalPrice,
          discounted_price: discountedPrice,
          is_ladies_seat: isLadiesSeat,
          x_pos: col,
          y_pos: row,
          z_pos: 1, // Upper deck
          width: width,
          height: height,
          is_double_berth: isDoubleBerth,
          seat_res_type: seatResType,
          date_of_journey: bus.journey_date,
          max_lower_column: bus.max_lower_column,
          max_lower_row: bus.max_lower_row,
          max_upper_column: bus.max_upper_column,
          max_upper_row: bus.max_upper_row
        });
        
        seatCounter++;
      }
    }
  }
  
  return seats;
}

// Helper function to generate mock boarding points
function generateMockBoardingPoints(bus) {
  const boardingPoints = [];
  const city = bus.from_city;
  
  // Common boarding areas for the city
  const boardingAreas = [
    { name: `${city} Central Bus Station`, address: `Main Road, ${city}`, time_offset: 0 },
    { name: `${city} Railway Station`, address: `Railway Colony, ${city}`, time_offset: 10 },
    { name: `${city} Airport`, address: `Airport Road, ${city}`, time_offset: 20 },
    { name: `${city} Mall`, address: `Mall Road, ${city}`, time_offset: 30 }
  ];
  
  // Create departure time object
  const departureTime = new Date(`2000-01-01T${bus.departure_time}`);
  
  for (let i = 0; i < boardingAreas.length; i++) {
    const area = boardingAreas[i];
    
    // Adjust time for this boarding point
    const bTime = new Date(departureTime);
    bTime.setMinutes(bTime.getMinutes() - area.time_offset);
    const timeStr = bTime.toTimeString().substring(0, 8);
    
    boardingPoints.push({
      bp_id: `BP${bus.bus_id}${i}`,
      bus_id: bus.bus_id,
      route_id: bus.route_id,
      operator_id: bus.operator_id,
      operator_name: bus.operator_name,
      op_bus_id: bus.op_bus_id,
      op_route_id: bus.op_route_id,
      op_bp_id: `OP_BP${i}`,
      b_point_name: area.name,
      b_time: timeStr,
      b_address: area.address,
      b_contact: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
      b_landmark: `Near ${area.name} Entrance`,
      b_location: `(${(Math.random() * 2 + 12).toFixed(6)},${(Math.random() * 2 + 77).toFixed(6)})`
    });
  }
  
  return boardingPoints;
}

// Helper function to generate mock dropping points
function generateMockDroppingPoints(bus) {
  const droppingPoints = [];
  const city = bus.to_city;
  
  // Common dropping areas for the city
  const droppingAreas = [
    { name: `${city} Central Bus Station`, address: `Main Road, ${city}`, time_offset: 0 },
    { name: `${city} Railway Station`, address: `Railway Colony, ${city}`, time_offset: 10 },
    { name: `${city} Airport`, address: `Airport Road, ${city}`, time_offset: 20 },
    { name: `${city} Mall`, address: `Mall Road, ${city}`, time_offset: 30 }
  ];
  
  // Create arrival time object
  const arrivalTime = new Date(`2000-01-01T${bus.arrival_time}`);
  
  for (let i = 0; i < droppingAreas.length; i++) {
    const area = droppingAreas[i];
    
    // Adjust time for this dropping point
    const dTime = new Date(arrivalTime);
    dTime.setMinutes(dTime.getMinutes() + area.time_offset);
    const timeStr = dTime.toTimeString().substring(0, 8);
    
    droppingPoints.push({
      dp_id: `DP${bus.bus_id}${i}`,
      bus_id: bus.bus_id,
      route_id: bus.route_id,
      operator_id: bus.operator_id,
      operator_name: bus.operator_name,
      op_bus_id: bus.op_bus_id,
      op_route_id: bus.op_route_id,
      op_dp_id: `OP_DP${i}`,
      d_point_name: area.name,
      d_time: timeStr,
      d_address: area.address,
      d_contact: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
      d_landmark: `Near ${area.name} Entrance`,
      d_location: `(${(Math.random() * 2 + 12).toFixed(6)},${(Math.random() * 2 + 77).toFixed(6)})`
    });
  }
  
  return droppingPoints;
}
