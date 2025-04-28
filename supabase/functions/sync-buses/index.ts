
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
      .limit(20);  // Limit to 20 popular routes for demo purposes
    
    if (routesError) throw routesError;
    
    // Generate dates for the next 7 days
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Mock fetching buses from third-party APIs
    // In production, this would make actual API calls to each operator
    let busCount = 0;
    let busLayouts = 0;
    let boardingPoints = 0;
    let droppingPoints = 0;
    
    for (const operator of operators) {
      for (const route of routes) {
        for (const journeyDate of dates) {
          // In a real implementation, this would call the operator API
          // For now, let's simulate a response with mock data
          const mockBuses = generateMockBusesForRoute(
            operator, 
            route, 
            journeyDate, 
            Math.floor(Math.random() * 5) + 1  // 1-5 buses per route per day
          );
          
          // Insert mock buses into our database
          if (mockBuses.length > 0) {
            const { data: busList, error: busError } = await supabaseClient
              .from("bus_list")
              .upsert(mockBuses, { onConflict: "bus_id" });
            
            if (busError) {
              console.error("Error inserting buses:", busError);
              continue;
            }
            
            busCount += mockBuses.length;
            
            // For each bus, create layouts, boarding points, dropping points
            for (const bus of mockBuses) {
              // Create mock seat layout
              const seatLayout = generateMockSeatLayout(bus);
              
              if (seatLayout.length > 0) {
                const { data: layoutData, error: layoutError } = await supabaseClient
                  .from("bus_layout")
                  .upsert(seatLayout, { onConflict: "seat_id" });
                
                if (layoutError) {
                  console.error("Error inserting seat layout:", layoutError);
                } else {
                  busLayouts += seatLayout.length;
                }
              }
              
              // Create mock boarding points
              const mockBoardingPoints = generateMockBoardingPoints(bus);
              
              if (mockBoardingPoints.length > 0) {
                const { data: bpData, error: bpError } = await supabaseClient
                  .from("boarding_points")
                  .upsert(mockBoardingPoints, { onConflict: "bp_id" });
                
                if (bpError) {
                  console.error("Error inserting boarding points:", bpError);
                } else {
                  boardingPoints += mockBoardingPoints.length;
                }
              }
              
              // Create mock dropping points
              const mockDroppingPoints = generateMockDroppingPoints(bus);
              
              if (mockDroppingPoints.length > 0) {
                const { data: dpData, error: dpError } = await supabaseClient
                  .from("dropping_points")
                  .upsert(mockDroppingPoints, { onConflict: "dp_id" });
                
                if (dpError) {
                  console.error("Error inserting dropping points:", dpError);
                } else {
                  droppingPoints += mockDroppingPoints.length;
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

// Helper functions to generate mock data
function generateMockBusesForRoute(operator, route, journeyDate, count) {
  const buses = [];
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
  
  for (let i = 0; i < count; i++) {
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
    
    const busId = `BUS${operator.operator_id}${route.route_id}${journeyDate.replace(/-/g, '')}${i}`;
    
    buses.push({
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
    });
  }
  
  return buses;
}

function generateMockSeatLayout(bus) {
  const seats = [];
  const seatTypes = ['Sleeper', 'Seater'];
  const decks = ['lower', 'upper'];
  
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
  for (let row = 0; row < upperMaxRow; row++) {
    for (let col = 0; col < upperMaxCol; col++) {
      // Skip some positions to create aisle space
      if (col === 1 || (row === 1 && col === 3)) continue;
      
      const seatType = bus.bus_category === 'Sleeper' ? 'Sleeper' : 'Seater';
      const width = seatType === 'Sleeper' ? 1 : 1;
      const height = seatType === 'Sleeper' ? 2 : 1;
      
      // Skip if it would overlap with an existing seat
      if (seatType === 'Sleeper' && row + height > upperMaxRow) continue;
      
      const isLadiesSeat = Math.random() < 0.1; // 10% chance of being a ladies seat
      const isAvailable = Math.random() < 0.8; // 80% chance of being available
      const isDoubleBerth = seatType === 'Sleeper' && Math.random() < 0.7; // 70% chance for sleepers
      
      const originalPrice = bus.starting_fare + (seatType === 'Sleeper' ? 200 : 0) + 50; // Upper deck costs more
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
  
  return seats;
}

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
