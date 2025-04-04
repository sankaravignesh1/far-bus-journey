
import { Bus, City, Seat, BoardingPoint, DroppingPoint } from "../types";

export const cities: City[] = [
  { id: "1", name: "Mumbai" },
  { id: "2", name: "Delhi" },
  { id: "3", name: "Bangalore" },
  { id: "4", name: "Hyderabad" },
  { id: "5", name: "Chennai" },
  { id: "6", name: "Kolkata" },
  { id: "7", name: "Pune" },
  { id: "8", name: "Jaipur" },
  { id: "9", name: "Ahmedabad" },
  { id: "10", name: "Goa" },
  { id: "11", name: "Lucknow" },
  { id: "12", name: "Chandigarh" },
  { id: "13", name: "Indore" },
  { id: "14", name: "Bhopal" },
  { id: "15", name: "Kochi" },
  { id: "16", name: "Visakhapatnam" },
  { id: "17", name: "Surat" },
  { id: "18", name: "Nagpur" },
  { id: "19", name: "Vadodara" },
  { id: "20", name: "Thiruvananthapuram" },
  { id: "21", name: "Coimbatore" },
  { id: "22", name: "Mysore" },
  { id: "23", name: "Dehradun" },
  { id: "24", name: "Rishikesh" },
  { id: "25", name: "Varanasi" },
  { id: "26", name: "Agra" },
  { id: "27", name: "Amritsar" },
  { id: "28", name: "Udaipur" },
  { id: "29", name: "Bhubaneswar" },
  { id: "30", name: "Nashik" },
  { id: "31", name: "Allahabad" },
  { id: "32", name: "Patna" },
  { id: "33", name: "Guwahati" },
  { id: "34", name: "Pondicherry" },
  { id: "35", name: "Shimla" },
  { id: "36", name: "Manali" },
  { id: "37", name: "Ooty" },
  { id: "38", name: "Darjeeling" },
  { id: "39", name: "Mussoorie" },
  { id: "40", name: "Kanpur" },
  { id: "41", name: "Nainital" },
  { id: "42", name: "Munnar" },
  { id: "43", name: "Haridwar" },
  { id: "44", name: "Madurai" },
  { id: "45", name: "Tirupati" },
  { id: "46", name: "Raipur" },
  { id: "47", name: "Ranchi" },
  { id: "48", name: "Gangtok" },
  { id: "49", name: "Shillong" },
  { id: "50", name: "Pushkar" }
];

export const buses: Bus[] = [
  {
    id: "1",
    name: "FAR Travels Deluxe",
    type: "AC",
    category: "Sleeper",
    departureTime: "22:00",
    arrivalTime: "06:00",
    duration: "8h 0m",
    availableSeats: 12,
    singleSeats: 6,
    fare: 1200,
    amenities: ["Charging Point", "WiFi", "Water Bottle", "Blanket"],
    layout: "2+1"
  },
  {
    id: "2",
    name: "FAR Express",
    type: "AC",
    category: "Seater",
    departureTime: "09:30",
    arrivalTime: "14:30",
    duration: "5h 0m",
    availableSeats: 8,
    singleSeats: 0,
    fare: 800,
    amenities: ["Charging Point", "WiFi", "Water Bottle"],
    layout: "all-seater"
  },
  {
    id: "3",
    name: "FAR Premium",
    type: "AC",
    category: "Sleeper",
    departureTime: "20:00",
    arrivalTime: "05:30",
    duration: "9h 30m",
    availableSeats: 5,
    singleSeats: 2,
    fare: 1500,
    amenities: ["Charging Point", "WiFi", "Water Bottle", "Blanket", "Snacks"],
    layout: "2+1-sleeper-seater"
  },
  {
    id: "4",
    name: "FAR Standard",
    type: "Non-AC",
    category: "Seater",
    departureTime: "08:00",
    arrivalTime: "15:00",
    duration: "7h 0m",
    availableSeats: 15,
    singleSeats: 0,
    fare: 600,
    amenities: ["Charging Point", "Water Bottle"],
    layout: "all-seater"
  },
  {
    id: "5",
    name: "FAR Budget",
    type: "Non-AC",
    category: "Sleeper",
    departureTime: "21:30",
    arrivalTime: "06:30",
    duration: "9h 0m",
    availableSeats: 20,
    singleSeats: 5,
    fare: 800,
    amenities: ["Charging Point", "Water Bottle"],
    layout: "tilted-sleeper"
  },
  {
    id: "6",
    name: "FAR Combo",
    type: "AC",
    category: "Sleeper",
    departureTime: "22:30",
    arrivalTime: "07:30",
    duration: "9h 0m",
    availableSeats: 16,
    singleSeats: 4,
    fare: 1100,
    amenities: ["Charging Point", "WiFi", "Water Bottle", "Blanket"],
    layout: "seater-sleeper"
  }
];

export const generateSeats = (busId: string, category: "Sleeper" | "Seater", layout: string = "2+1"): Seat[] => {
  const seats: Seat[] = [];

  // Get the bus to determine the layout
  const bus = buses.find(b => b.id === busId);
  const busLayout = bus?.layout || layout;
  
  if (busLayout === "2+1") {
    // Generate 2+1 sleeper layout (first image)
    // Lower deck
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 6; col++) {
        const seatNumber = `L${row}${col}`;
        const status = Math.random() > 0.7 ? "available" : 
                      Math.random() > 0.5 ? "booked" : "female_booked";
        
        seats.push({
          id: `${busId}-lower-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: col === 3 ? "single" : "double",
          deck: "lower",
          gender: status === "female_booked" ? "female" : undefined
        });
      }
    }
    
    // Upper deck
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 6; col++) {
        const seatNumber = `U${row}${col}`;
        const status = Math.random() > 0.7 ? "available" : 
                      Math.random() > 0.5 ? "booked" : "female_booked";
        
        seats.push({
          id: `${busId}-upper-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: col === 3 ? "single" : "double",
          deck: "upper",
          gender: status === "female_booked" ? "female" : undefined
        });
      }
    }
  } 
  else if (busLayout === "2+1-sleeper-seater") {
    // Generate 2+1 sleeper-seater layout (second image)
    // Lower deck - seater (2 rows of 12 seats)
    for (let row = 1; row <= 2; row++) {
      for (let col = 1; col <= 12; col++) {
        const seatNumber = `L${row}${col < 10 ? '0' + col : col}`;
        const status = Math.random() > 0.7 ? "available" : 
                    Math.random() > 0.5 ? "booked" : "female_booked";
        
        seats.push({
          id: `${busId}-lower-${seatNumber}`,
          number: seatNumber,
          type: "Seater",
          status: status,
          position: col % 3 === 0 ? "single" : "double",
          deck: "lower",
          gender: status === "female_booked" ? "female" : undefined
        });
      }
    }
    
    // Lower deck - sleeper (5 berths)
    for (let i = 1; i <= 5; i++) {
      const seatNumber = `LS${i}`;
      const status = Math.random() > 0.7 ? "available" : 
                    Math.random() > 0.5 ? "booked" : "female_booked";
      
      seats.push({
        id: `${busId}-lower-sleeper-${i}`,
        number: seatNumber,
        type: "Sleeper",
        status: status,
        position: "single",
        deck: "lower",
        gender: status === "female_booked" ? "female" : undefined
      });
    }
    
    // Upper deck - sleeper
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 6; col++) {
        if ((row === 1 && col === 3) || (row === 2 && (col === 1 || col === 2 || col === 6))) continue; // Skip some positions based on the image
        
        const seatNumber = `U${row}${col}`;
        const status = Math.random() > 0.7 ? "available" : 
                      Math.random() > 0.5 ? "booked" : "female_booked";
        
        seats.push({
          id: `${busId}-upper-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: "double",
          deck: "upper",
          gender: status === "female_booked" ? "female" : undefined
        });
      }
    }
  }
  else if (busLayout === "seater-sleeper") {
    // Generate seater-sleeper layout (fifth image)
    // Lower deck
    // Sleeper seats (2 rows of 6)
    for (let row = 1; row <= 2; row++) {
      for (let col = 1; col <= 6; col++) {
        const seatNumber = `LS${row}${col}`;
        const status = Math.random() > 0.7 ? "available" : 
                      Math.random() > 0.5 ? "booked" : "female_booked";
        
        seats.push({
          id: `${busId}-lower-sleeper-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: "double",
          deck: "lower",
          gender: status === "female_booked" ? "female" : undefined
        });
      }
    }
    
    // Seater seats (1 row of 12)
    for (let i = 1; i <= 12; i++) {
      const seatNumber = `S${i < 10 ? '0' + i : i}`;
      const status = Math.random() > 0.7 ? "available" : 
                    Math.random() > 0.5 ? "booked" : "female_booked";
      
      seats.push({
        id: `${busId}-lower-seater-${i}`,
        number: seatNumber,
        type: "Seater",
        status: status,
        position: "single",
        deck: "lower",
        gender: status === "female_booked" ? "female" : undefined
      });
    }
    
    // Sleeper on side
    seats.push({
      id: `${busId}-lower-sleeper-side`,
      number: "LSS",
      type: "Sleeper",
      status: Math.random() > 0.7 ? "available" : 
              Math.random() > 0.5 ? "booked" : "female_booked",
      position: "single",
      deck: "lower",
      gender: Math.random() > 0.5 ? "female" : undefined
    });
    
    // Upper deck - all sleeper (3 rows of 6)
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 6; col++) {
        const seatNumber = `U${row}${col}`;
        const status = Math.random() > 0.7 ? "available" : 
                      Math.random() > 0.5 ? "booked" : "female_booked";
        
        seats.push({
          id: `${busId}-upper-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: "double",
          deck: "upper",
          gender: status === "female_booked" ? "female" : undefined
        });
      }
    }
  }
  else if (busLayout === "tilted-sleeper") {
    // Generate tilted sleeper layout (fourth image)
    // Lower deck
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 5; col++) {
        const seatNumber = `L${row}${col}`;
        const status = Math.random() > 0.7 ? "available" : 
                      Math.random() > 0.5 ? "booked" : "female_booked";
        
        seats.push({
          id: `${busId}-lower-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: "double",
          deck: "lower",
          gender: status === "female_booked" ? "female" : undefined
        });
      }
    }
    
    // Tilted seat on lower deck
    seats.push({
      id: `${busId}-lower-tilted`,
      number: "LT",
      type: "Sleeper",
      status: Math.random() > 0.7 ? "available" : 
              Math.random() > 0.5 ? "booked" : "female_booked",
      position: "tilted",
      deck: "lower",
      gender: Math.random() > 0.5 ? "female" : undefined
    });
    
    // Upper deck
    for (let row = 1; row <= 2; row++) {
      for (let col = 1; col <= 5; col++) {
        const seatNumber = `U${row}${col}`;
        const status = Math.random() > 0.7 ? "available" : 
                      Math.random() > 0.5 ? "booked" : "female_booked";
        
        seats.push({
          id: `${busId}-upper-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: "double",
          deck: "upper",
          gender: status === "female_booked" ? "female" : undefined
        });
      }
    }
    
    // Additional row on upper deck
    for (let col = 1; col <= 5; col++) {
      const seatNumber = `U3${col}`;
      const status = Math.random() > 0.7 ? "available" : 
                    Math.random() > 0.5 ? "booked" : "female_booked";
      
      seats.push({
        id: `${busId}-upper-${seatNumber}`,
        number: seatNumber,
        type: "Sleeper",
        status: status,
        position: "double",
        deck: "upper",
        gender: status === "female_booked" ? "female" : undefined
      });
    }
    
    // Tilted seat on upper deck
    seats.push({
      id: `${busId}-upper-tilted`,
      number: "UT",
      type: "Sleeper", 
      status: Math.random() > 0.7 ? "available" : 
              Math.random() > 0.5 ? "booked" : "female_booked",
      position: "tilted",
      deck: "upper",
      gender: Math.random() > 0.5 ? "female" : undefined
    });
  }
  else if (busLayout === "all-seater") {
    // Generate all seater layout (sixth image - only lower deck)
    // Lower deck - 2 rows of 12 seats and 1 row with 11 seats + 1 on side
    for (let row = 1; row <= 2; row++) {
      for (let col = 1; col <= 12; col++) {
        const seatNumber = `${row}${col < 10 ? '0' + col : col}`;
        const status = Math.random() > 0.7 ? "available" : 
                      Math.random() > 0.5 ? "booked" : "female_booked";
        
        seats.push({
          id: `${busId}-seater-${seatNumber}`,
          number: seatNumber,
          type: "Seater",
          status: status,
          position: col === 3 || col === 6 || col === 9 || col === 12 ? "single" : "double",
          deck: "lower",
          gender: status === "female_booked" ? "female" : undefined
        });
      }
    }
    
    // Last row with side seat
    for (let col = 1; col <= 11; col++) {
      const seatNumber = `3${col < 10 ? '0' + col : col}`;
      const status = Math.random() > 0.7 ? "available" : 
                    Math.random() > 0.5 ? "booked" : "female_booked";
      
      seats.push({
        id: `${busId}-seater-${seatNumber}`,
        number: seatNumber,
        type: "Seater",
        status: status,
        position: col === 3 || col === 6 || col === 9 ? "single" : "double",
        deck: "lower",
        gender: status === "female_booked" ? "female" : undefined
      });
    }
    
    // Side seat
    seats.push({
      id: `${busId}-seater-side`,
      number: "S",
      type: "Seater",
      status: Math.random() > 0.7 ? "available" : 
              Math.random() > 0.5 ? "booked" : "female_booked",
      position: "single",
      deck: "lower",
      gender: Math.random() > 0.5 ? "female" : undefined
    });
  }
  
  return seats;
};

export const boardingPoints: Record<string, BoardingPoint[]> = {
  "1": [
    { id: "1-1", name: "Dadar", address: "Dadar Bus Terminal, Mumbai", time: "22:00" },
    { id: "1-2", name: "Andheri", address: "Andheri East Metro Station", time: "22:30" },
    { id: "1-3", name: "Borivali", address: "Borivali Bus Station", time: "23:00" }
  ],
  "2": [
    { id: "2-1", name: "Dadar", address: "Dadar Bus Terminal, Mumbai", time: "09:30" },
    { id: "2-2", name: "Andheri", address: "Andheri East Metro Station", time: "10:00" },
    { id: "2-3", name: "Borivali", address: "Borivali Bus Station", time: "10:30" }
  ],
  "3": [
    { id: "3-1", name: "Dadar", address: "Dadar Bus Terminal, Mumbai", time: "20:00" },
    { id: "3-2", name: "Andheri", address: "Andheri East Metro Station", time: "20:30" },
    { id: "3-3", name: "Borivali", address: "Borivali Bus Station", time: "21:00" }
  ],
  "4": [
    { id: "4-1", name: "Dadar", address: "Dadar Bus Terminal, Mumbai", time: "08:00" },
    { id: "4-2", name: "Andheri", address: "Andheri East Metro Station", time: "08:30" },
    { id: "4-3", name: "Borivali", address: "Borivali Bus Station", time: "09:00" }
  ],
  "5": [
    { id: "5-1", name: "Dadar", address: "Dadar Bus Terminal, Mumbai", time: "21:30" },
    { id: "5-2", name: "Andheri", address: "Andheri East Metro Station", time: "22:00" },
    { id: "5-3", name: "Borivali", address: "Borivali Bus Station", time: "22:30" }
  ]
};

export const droppingPoints: Record<string, DroppingPoint[]> = {
  "1": [
    { id: "1-1", name: "Pune Station", address: "Pune Railway Station", time: "05:30" },
    { id: "1-2", name: "Shivaji Nagar", address: "Shivaji Nagar Bus Stop, Pune", time: "06:00" }
  ],
  "2": [
    { id: "2-1", name: "Pune Station", address: "Pune Railway Station", time: "14:00" },
    { id: "2-2", name: "Shivaji Nagar", address: "Shivaji Nagar Bus Stop, Pune", time: "14:30" }
  ],
  "3": [
    { id: "3-1", name: "Pune Station", address: "Pune Railway Station", time: "05:00" },
    { id: "3-2", name: "Shivaji Nagar", address: "Shivaji Nagar Bus Stop, Pune", time: "05:30" }
  ],
  "4": [
    { id: "4-1", name: "Pune Station", address: "Pune Railway Station", time: "14:30" },
    { id: "4-2", name: "Shivaji Nagar", address: "Shivaji Nagar Bus Stop, Pune", time: "15:00" }
  ],
  "5": [
    { id: "5-1", name: "Pune Station", address: "Pune Railway Station", time: "06:00" },
    { id: "5-2", name: "Shivaji Nagar", address: "Shivaji Nagar Bus Stop, Pune", time: "06:30" }
  ]
};
