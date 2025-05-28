export interface City {
  id: string;
  name: string;
}

export interface Bus {
  id: string;
  name: string;
  type: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableSeats: number;
  singleSeats: number; // Added for single seats count
  fare: number;
  amenities: string[];
  
}

export interface Seat {
  id: string;
  number: string;  // Format: DL1-DL12, DU1-DU12 (Double seats), SL1-SL6, SU1-SU6 (Single seats)
  type: string;
  status: "available" | "booked" | "female_booked" | "selected";
  position: "single" | "double" | "tilted"; // Updated to handle different position types
  deck: "lower" | "upper";
  gender?: "male" | "female";
  // Additional properties
  available?: boolean;
  is_ladies_seat?: boolean;
  requiresFemale?: boolean;
  requiresMale?: boolean;
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
  original_price?: number;
  discounted_price?: number;
  seat_res_type?: string;
  fare?: number; // Added fare property to Seat type
}

export interface BoardingPoint {
  id: string;
  name: string;
  address: string;
  time: string;
}

export interface DroppingPoint {
  id: string;
  name: string;
  address: string;
  time: string;
}

export interface Passenger {
  name: string;
  age: number;
  gender: "male" | "female";
  seatId: string;
}

export interface BookingDetails {
  busId: string;
  journeyDate: string;
  seats: Seat[];
  passengers: Passenger[];
  boardingPoint: BoardingPoint;
  droppingPoint: DroppingPoint;
  contactEmail: string;
  contactMobile: string;
  totalFare: number;
}
