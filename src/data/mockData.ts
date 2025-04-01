
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
    fare: 1200,
    amenities: ["Charging Point", "WiFi", "Water Bottle", "Blanket"]
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
    fare: 800,
    amenities: ["Charging Point", "WiFi", "Water Bottle"]
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
    fare: 1500,
    amenities: ["Charging Point", "WiFi", "Water Bottle", "Blanket", "Snacks"]
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
    fare: 600,
    amenities: ["Charging Point", "Water Bottle"]
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
    fare: 800,
    amenities: ["Charging Point", "Water Bottle"]
  }
];

export const generateSeats = (busId: string, category: "Sleeper" | "Seater"): Seat[] => {
  const seats: Seat[] = [];
  
  if (category === "Sleeper") {
    // Generate sleeper seats (lower deck)
    for (let i = 1; i <= 15; i++) {
      const status = Math.random() > 0.7 ? "available" : 
                     Math.random() > 0.5 ? "booked" : "female_booked";
      seats.push({
        id: `${busId}-lower-${i}`,
        number: `L${i}`,
        type: "Sleeper",
        status: status,
        position: i % 3 === 0 ? "lower" : "lower",
        deck: "lower",
        gender: status === "female_booked" ? "female" : undefined
      });
    }
    
    // Generate sleeper seats (upper deck)
    for (let i = 1; i <= 15; i++) {
      const status = Math.random() > 0.7 ? "available" : 
                     Math.random() > 0.5 ? "booked" : "female_booked";
      seats.push({
        id: `${busId}-upper-${i}`,
        number: `U${i}`,
        type: "Sleeper",
        status: status,
        position: i % 3 === 0 ? "upper" : "upper",
        deck: "upper",
        gender: status === "female_booked" ? "female" : undefined
      });
    }
  } else {
    // Generate seater seats
    for (let i = 1; i <= 30; i++) {
      const status = Math.random() > 0.7 ? "available" : 
                     Math.random() > 0.5 ? "booked" : "female_booked";
      seats.push({
        id: `${busId}-seater-${i}`,
        number: `${i}`,
        type: "Seater",
        status: status,
        position: "lower",
        deck: i <= 15 ? "lower" : "upper",
        gender: status === "female_booked" ? "female" : undefined
      });
    }
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
