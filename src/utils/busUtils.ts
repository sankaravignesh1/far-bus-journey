
import { format, addMinutes, parseISO } from 'date-fns';

// Format time string from 24-hour format to 12-hour with AM/PM
export const formatTime = (timeStr: string) => {
  try {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeStr;
  }
};

// Format date to display format
export const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return format(date, 'EEE, dd MMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};

// Calculate arrival date-time considering overnight journeys
export const calculateArrivalDateTime = (
  departureDate: string,
  departureTime: string,
  arrivalTime: string
) => {
  try {
    const depHours = Number(departureTime.split(':')[0]);
    const arrHours = Number(arrivalTime.split(':')[0]);
    
    // Create departure date-time
    const depDate = new Date(departureDate);
    depDate.setHours(depHours);
    depDate.setMinutes(Number(departureTime.split(':')[1]));
    
    // Create arrival date-time (initially same day)
    const arrDate = new Date(departureDate);
    arrDate.setHours(arrHours);
    arrDate.setMinutes(Number(arrivalTime.split(':')[1]));
    
    // If arrival time is earlier than departure time, it's likely next day
    if (arrHours < depHours) {
      arrDate.setDate(arrDate.getDate() + 1);
    }
    
    return {
      departureDateTime: depDate,
      arrivalDateTime: arrDate,
      formattedDeparture: format(depDate, 'EEE, dd MMM yyyy h:mm a'),
      formattedArrival: format(arrDate, 'EEE, dd MMM yyyy h:mm a')
    };
  } catch (error) {
    console.error('Error calculating arrival date-time:', error);
    return {
      departureDateTime: new Date(),
      arrivalDateTime: new Date(),
      formattedDeparture: `${departureDate} ${departureTime}`,
      formattedArrival: `${departureDate} ${arrivalTime}`
    };
  }
};

// Calculate cancellation policy text based on journey date and time
export const formatCancellationPolicy = (
  policy: any,
  departureDate: string,
  departureTime: string
) => {
  if (!policy) return [];
  
  try {
    const depDateTime = new Date(`${departureDate}T${departureTime}`);
    const policyDetails = [];
    
    // Format the cancellation policy time frames
    if (policy.before_two_weeks) {
      const cutoffDate = new Date(depDateTime);
      cutoffDate.setDate(cutoffDate.getDate() - 14);
      policyDetails.push({
        timePeriod: `Before ${format(cutoffDate, 'dd MMM yyyy h:mm a')}`,
        refund: `${policy.before_two_weeks}% refund`
      });
    }
    
    if (policy.before_week) {
      const twoWeeksCutoff = new Date(depDateTime);
      twoWeeksCutoff.setDate(twoWeeksCutoff.getDate() - 14);
      
      const oneWeekCutoff = new Date(depDateTime);
      oneWeekCutoff.setDate(oneWeekCutoff.getDate() - 7);
      
      policyDetails.push({
        timePeriod: `Between ${format(twoWeeksCutoff, 'dd MMM yyyy h:mm a')} and ${format(oneWeekCutoff, 'dd MMM yyyy h:mm a')}`,
        refund: `${policy.before_week}% refund`
      });
    }
    
    if (policy.before_48hrs) {
      const oneWeekCutoff = new Date(depDateTime);
      oneWeekCutoff.setDate(oneWeekCutoff.getDate() - 7);
      
      const twoDaysCutoff = new Date(depDateTime);
      twoDaysCutoff.setHours(twoDaysCutoff.getHours() - 48);
      
      policyDetails.push({
        timePeriod: `Between ${format(oneWeekCutoff, 'dd MMM yyyy h:mm a')} and ${format(twoDaysCutoff, 'dd MMM yyyy h:mm a')}`,
        refund: `${policy.before_48hrs}% refund`
      });
    }
    
    if (policy.before_24hrs) {
      const twoDaysCutoff = new Date(depDateTime);
      twoDaysCutoff.setHours(twoDaysCutoff.getHours() - 48);
      
      const oneDayCutoff = new Date(depDateTime);
      oneDayCutoff.setHours(oneDayCutoff.getHours() - 24);
      
      policyDetails.push({
        timePeriod: `Between ${format(twoDaysCutoff, 'dd MMM yyyy h:mm a')} and ${format(oneDayCutoff, 'dd MMM yyyy h:mm a')}`,
        refund: `${policy.before_24hrs}% refund`
      });
    }
    
    if (policy.before_12hrs) {
      const oneDayCutoff = new Date(depDateTime);
      oneDayCutoff.setHours(oneDayCutoff.getHours() - 24);
      
      const twelveHoursCutoff = new Date(depDateTime);
      twelveHoursCutoff.setHours(twelveHoursCutoff.getHours() - 12);
      
      policyDetails.push({
        timePeriod: `Between ${format(oneDayCutoff, 'dd MMM yyyy h:mm a')} and ${format(twelveHoursCutoff, 'dd MMM yyyy h:mm a')}`,
        refund: `${policy.before_12hrs}% refund`
      });
    }
    
    if (policy.before_6hrs) {
      const twelveHoursCutoff = new Date(depDateTime);
      twelveHoursCutoff.setHours(twelveHoursCutoff.getHours() - 12);
      
      const sixHoursCutoff = new Date(depDateTime);
      sixHoursCutoff.setHours(sixHoursCutoff.getHours() - 6);
      
      policyDetails.push({
        timePeriod: `Between ${format(twelveHoursCutoff, 'dd MMM yyyy h:mm a')} and ${format(sixHoursCutoff, 'dd MMM yyyy h:mm a')}`,
        refund: `${policy.before_6hrs}% refund`
      });
    }
    
    if (policy.lessthan_6hrs !== undefined) {
      const sixHoursCutoff = new Date(depDateTime);
      sixHoursCutoff.setHours(sixHoursCutoff.getHours() - 6);
      
      policyDetails.push({
        timePeriod: `Less than ${format(sixHoursCutoff, 'dd MMM yyyy h:mm a')}`,
        refund: `${policy.lessthan_6hrs}% refund`
      });
    }
    
    return policyDetails;
  } catch (error) {
    console.error('Error formatting cancellation policy:', error);
    return [];
  }
};

// Generate seat grid layout based on bus configuration
export const generateSeatLayout = (seats: any[]) => {
  if (!seats || seats.length === 0) return { lowerDeck: [], upperDeck: [] };
  
  // Get layout dimensions from the first seat
  const firstSeat = seats[0];
  const maxLowerColumn = firstSeat.max_lower_column || 10;
  const maxLowerRow = firstSeat.max_lower_row || 4;
  const maxUpperColumn = firstSeat.max_upper_column || 10;
  const maxUpperRow = firstSeat.max_upper_row || 4;
  
  // Initialize empty grid for both decks
  const lowerDeck = Array(maxLowerRow).fill(null).map(() => Array(maxLowerColumn).fill(null));
  const upperDeck = Array(maxUpperRow).fill(null).map(() => Array(maxUpperColumn).fill(null));
  
  // Place seats in the grid
  seats.forEach(seat => {
    const { x_pos, y_pos, z_pos, width, height } = seat;
    
    // Skip if position is out of bounds
    if (z_pos === 0) { // Lower deck
      if (y_pos >= maxLowerRow || x_pos >= maxLowerColumn) return;
    } else { // Upper deck
      if (y_pos >= maxUpperRow || x_pos >= maxUpperColumn) return;
    }
    
    const deck = z_pos === 0 ? lowerDeck : upperDeck;
    
    // Place the seat
    for (let y = y_pos; y < y_pos + width && y < (z_pos === 0 ? maxLowerRow : maxUpperRow); y++) {
      for (let x = x_pos; x < x_pos + height && x < (z_pos === 0 ? maxLowerColumn : maxUpperColumn); x++) {
        if (y === y_pos && x === x_pos) {
          // Primary seat position
          deck[y][x] = { ...seat, isPrimary: true };
        } else {
          // Extended part of the seat
          deck[y][x] = { ...seat, isPrimary: false, primaryX: x_pos, primaryY: y_pos };
        }
      }
    }
  });
  
  return { lowerDeck, upperDeck };
};

// Calculate GSTv
export const calculateGST = (baseFare: number, gstPercent: number = 5) => {
  return (baseFare * gstPercent / 100).toFixed(2);
};

// Calculate discount
export const calculateDiscount = (baseFare: number, discountPercent: number) => {
  return (baseFare * discountPercent / 100).toFixed(2);
};

// Format currency
export const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};
