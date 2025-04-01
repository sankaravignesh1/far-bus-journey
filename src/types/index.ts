
export interface City {
  id: string;
  name: string;
}

export interface Bus {
  id: string;
  name: string;
  type: "AC" | "Non-AC";
  category: "Sleeper" | "Seater";
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableSeats: number;
  fare: number;
  amenities: string[];
}

export interface Seat {
  id: string;
  number: string;
  type: "Seater" | "Sleeper";
  status: "available" | "booked" | "female_booked" | "selected";
  position: "lower" | "upper";
  deck: "lower" | "upper";
  gender?: "male" | "female";
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
