
import { Bus, Seat } from '../types';

/**
 * Generate seats for a bus with a sleeper layout based on CSV data
 */
export const generateSleeperBusLayout = (busId: string): Seat[] => {
  const csvSeatData = [
    { seatName: "L35", seatType: "Sleeper", deck: "lower", available: true, x: 10, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "U32", seatType: "Sleeper", deck: "upper", available: true, x: 10, y: 2, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L6", seatType: "Sleeper", deck: "lower", available: true, x: 0, y: 0, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "U33", seatType: "Sleeper", deck: "upper", available: true, x: 10, y: 4, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "U7", seatType: "Sleeper", deck: "upper", available: true, x: 2, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L30", seatType: "Sleeper", deck: "lower", available: true, x: 8, y: 0, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "U25", seatType: "Sleeper", deck: "upper", available: true, x: 8, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L34", seatType: "Sleeper", deck: "lower", available: true, x: 10, y: 3, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "U19", seatType: "Sleeper", deck: "upper", available: true, x: 6, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L5", seatType: "Sleeper", deck: "lower", available: true, x: 0, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L36", seatType: "Sleeper", deck: "lower", available: true, x: 10, y: 0, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "U31", seatType: "Sleeper", deck: "upper", available: true, x: 10, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L22", seatType: "Sleeper", deck: "lower", available: true, x: 6, y: 3, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "L28", seatType: "Sleeper", deck: "lower", available: true, x: 8, y: 3, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "U21", seatType: "Sleeper", deck: "upper", available: true, x: 6, y: 4, height: 1, width: 1, isDoubleBirth: false },
    { seatName: "U14", seatType: "Sleeper", deck: "upper", available: true, x: 4, y: 2, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L23", seatType: "Sleeper", deck: "lower", available: true, x: 6, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L17", seatType: "Sleeper", deck: "lower", available: true, x: 4, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L12", seatType: "Sleeper", deck: "lower", available: true, x: 2, y: 0, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "U15", seatType: "Sleeper", deck: "upper", available: true, x: 4, y: 4, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "L29", seatType: "Sleeper", deck: "lower", available: true, x: 8, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "U9", seatType: "Sleeper", deck: "upper", available: true, x: 2, y: 4, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "U27", seatType: "Sleeper", deck: "upper", available: true, x: 8, y: 4, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "U13", seatType: "Sleeper", deck: "upper", available: true, x: 4, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "U20", seatType: "Sleeper", deck: "upper", available: true, x: 6, y: 2, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L10", seatType: "Sleeper", deck: "lower", available: true, x: 2, y: 3, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "L4", seatType: "Sleeper", deck: "lower", available: true, x: 0, y: 3, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "U26", seatType: "Sleeper", deck: "upper", available: true, x: 8, y: 2, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L11", seatType: "Sleeper", deck: "lower", available: true, x: 2, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "U3", seatType: "Sleeper", deck: "upper", available: true, x: 0, y: 4, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "L16", seatType: "Sleeper", deck: "lower", available: true, x: 4, y: 3, height: 2, width: 1, isDoubleBirth: false },
    { seatName: "U1", seatType: "Sleeper", deck: "upper", available: true, x: 0, y: 1, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L24", seatType: "Sleeper", deck: "lower", available: true, x: 6, y: 0, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "L18", seatType: "Sleeper", deck: "lower", available: true, x: 4, y: 0, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "U8", seatType: "Sleeper", deck: "upper", available: true, x: 2, y: 2, height: 2, width: 1, isDoubleBirth: true },
    { seatName: "U2", seatType: "Sleeper", deck: "upper", available: true, x: 0, y: 2, height: 2, width: 1, isDoubleBirth: true }
  ];
  
  const seats: Seat[] = [];
  
  csvSeatData.forEach(seatData => {
    // Randomize seat status
    let status: 'available' | 'booked' | 'female_booked' = 'available';
    const random = Math.random();
    if (random < 0.15) {
      status = 'booked';
    } else if (random < 0.25) {
      status = 'female_booked';
    }
    
    // Create the seat object
    seats.push({
      id: `${busId}-${seatData.seatName}`,
      number: seatData.seatName,
      type: seatData.seatType === "Sleeper" ? "Sleeper" : "Seater",
      status: status,
      position: seatData.isDoubleBirth ? "double" : "single",
      deck: seatData.deck === "lower" ? "lower" : "upper"
    });
  });
  
  return seats;
};

/**
 * Generate seats for a bus with seater layout
 */
export const generateSeaterBusLayout = (busId: string): Seat[] => {
  const seats: Seat[] = [];
  
  // For seater layout: 12 seats per row, 4 rows per deck
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 12; col++) {
      // Skip seats to create a 2+1 layout
      if ((col + 1) % 3 === 0 && col < 9) {
        continue; // Skip every 3rd column to create the 2+1 pattern
      }
      
      const seatNumber = `L${row * 12 + col + 1}`;
      
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.15) {
        status = 'booked';
      } else if (random < 0.25) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Seater",
        status: status,
        position: (col % 3 < 2) ? "double" : "single",
        deck: "lower"
      });
    }
  }
  
  // Add some seats for upper deck in seater layout
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 12; col++) {
      // Skip seats to create a 2+1 layout
      if ((col + 1) % 3 === 0 && col < 9) {
        continue; // Skip every 3rd column to create the 2+1 pattern
      }
      
      const seatNumber = `U${row * 12 + col + 1}`;
      
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.15) {
        status = 'booked';
      } else if (random < 0.25) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Seater",
        status: status,
        position: (col % 3 < 2) ? "double" : "single",
        deck: "upper"
      });
    }
  }
  
  return seats;
};

/**
 * Generate mixed layout (seater + sleeper)
 */
export const generateMixedLayout = (busId: string): Seat[] => {
  const seats: Seat[] = [];
  
  // Add sleeper seats from the CSV data for the first half
  const sleeperSeats = generateSleeperBusLayout(busId);
  seats.push(...sleeperSeats.slice(0, Math.floor(sleeperSeats.length / 2)));
  
  // Add some seater seats
  const seaterSeats = generateSeaterBusLayout(busId);
  seats.push(...seaterSeats.slice(0, Math.floor(seaterSeats.length / 2)));
  
  return seats;
};

/**
 * Generate appropriate seats based on bus layout
 */
export const generateSeatsForBusType = (busId: string, busLayout: string): Seat[] => {
  switch (busLayout) {
    case "2+1":
      return generateSleeperBusLayout(busId);
    case "2+1-sleeper-seater":
    case "seater-sleeper":
      return generateMixedLayout(busId);
    case "tilted-sleeper":
      return generateSleeperBusLayout(busId);
    case "all-seater":
      return generateSeaterBusLayout(busId);
    default:
      return generateSleeperBusLayout(busId);
  }
};
