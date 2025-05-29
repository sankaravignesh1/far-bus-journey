
import { supabase } from "@/integrations/supabase/client";

// City Service
export const CityService = {
  async getCities(query?: string) {
    let citiesQuery = supabase.from('cities').select('*');
    
    if (query) {
      citiesQuery = citiesQuery.ilike('name', `%${query}%`);
    }
    
    const { data, error } = await citiesQuery;
    
    if (error) {
      console.error('Error fetching cities:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  },
  
  async getPopularCities() {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_popular', true)
      .order('name');
      
    if (error) {
      console.error('Error fetching popular cities:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }
};
// Get city id by name (case-insensitive)
async function getCityByName(cityName: string) {
  const { data, error } = await supabase
    .from('cities')
    .select('city_id')
    .ilike('name', cityName.trim()); // Case-insensitive

  if (error) throw new Error(error.message || 'DB error');
  if (!data || data.length === 0) return null; // Not found
  return data[0];
}





// Route Service
export const RouteService = {
  async getRoute(fromCity: string, toCity: string) {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('from_city_name', fromCity.trim())
      .eq('to_city_name', toCity.trim())
      .single();
      
    if (error) {
      console.error('Error fetching route:', error);
      return null;
    }
    
    return data;
  }
};

// Bus Service
export const BusService = {
  async searchBuses(fromCity: string, toCity: string, routeId: string, journeyDate: string) {
    const { data, error } = await supabase
      .from('bus_list')
      .select(`
        *,
        routes(*)
      `)
      .eq('route_id', routeId)
      .eq('from_city', fromCity)
      .eq('to_city', toCity)
      .eq('journey_date', journeyDate);
      
    if (error) {
      console.error('Error searching buses:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  },
  
  async getBusDetails(busId: string, journeyDate: string) {
    const { data, error } = await supabase
      .from('bus_list')
      .select(`
        *,
        routes(*)
      `)
      .eq('bus_id', busId)
      .eq('journey_date', journeyDate)
      .single();
      
    if (error) {
      console.error('Error fetching bus details:', error);
      throw new Error(error.message);
    }
    
    return data;
  },


// Seat Service
export const SeatService = {
  async getBusLayout(busId: string, journeyDate: string) {
    console.log(`Fetching bus layout for busId: ${busId}, date: ${journeyDate}`);
    const { data, error } = await supabase
      .from('bus_layout')
      .select('*')
      .eq('bus_id', busId)
      .eq('date_of_journey', journeyDate);
      
    if (error) {
      console.error('Error fetching bus layout:', error);
      throw new Error(error.message);
    }
    
    console.log(`Found ${data?.length || 0} seats for bus ${busId}`);
    return data || [];
  },


// BoardingPoint Service
export const BoardingPointService = {
  async getBoardingPoints(busId: string) {
    console.log(`Fetching boarding points for bus: ${busId}`);
    const { data, error } = await supabase
      .from('boarding_points')
      .select('*')
      .eq('bus_id', busId)
      .eq('route_id', routeId)
      .order('b_time', { ascending: true });
      
    if (error) {
      console.error('Error fetching boarding points:', error);
      throw new Error(error.message);
    }
    
    console.log(`Found ${data?.length || 0} boarding points for bus ${busId}`);
    return data || [];
  }
};
 
// DroppingPoint Service
export const DroppingPointService = {
  async getDroppingPoints(busId: string) {
    console.log(`Fetching dropping points for bus: ${busId}`);
    const { data, error } = await supabase
      .from('dropping_points')
      .select('*')
      .eq('bus_id', busId)
      .eq('route_id', routeId)
      .order('d_time', { ascending: true });
      
    if (error) {
      console.error('Error fetching dropping points:', error);
      throw new Error(error.message);
    }
    
    console.log(`Found ${data?.length || 0} dropping points for bus ${busId}`);
    return data || [];
  }
};

// CancellationPolicy Service
export const CancellationPolicyService = {
  async getCancellationPolicy(operatorId: string) {
    const { data, error } = await supabase
      .from('cancellation_policy')
      .select('*')
      .eq('operator_id', operatorId)
      .single();
      
    if (error) {
      console.error('Error fetching cancellation policy:', error);
      return null;
    }
    
    return data;
  }
};

// TravelPolicy Service
export const TravelPolicyService = {
  async getTravelPolicies() {
    const { data, error } = await supabase
      .from('travel_policy')
      .select('*');
      
    if (error) {
      console.error('Error fetching travel policies:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }
};

// GST Service
export const GstService = {
  async getGstRate(operatorId: string) {
    const { data, error } = await supabase
      .from('gst_rates')
      .select('*')
      .eq('operator_id', operatorId)
      .single();
      
    if (error) {
      console.error('Error fetching GST rate:', error);
      return { gst_percent: 5.00 }; // Default GST rate
    }
    
    return data;
  }
};

// Booking Service
export const BookingService = {
  async lockSeats(bookingDetails: any) {
    const { data, error } = await supabase.functions.invoke('lock-seats', {
      body: bookingDetails
    });
    
    if (error) {
      console.error('Error locking seats:', error);
      throw new Error(error.message);
    }
    
    return data;
  },
  
  async processPayment(paymentDetails: any) {
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: paymentDetails
    });
    
    if (error) {
      console.error('Error processing payment:', error);
      throw new Error(error.message);
    }
    
    return data;
  },
  
  async getBookingByPNR(pnr: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('pnr', pnr)
      .single();
      
    if (error) {
      console.error('Error fetching booking by PNR:', error);
      throw new Error(error.message);
    }
    
    return data;
  },
  
  async getBookingByMobile(mobile: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('mobile', mobile);
      
    if (error) {
      console.error('Error fetching bookings by mobile:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  },
  
  async getBookingByEmail(email: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('email', email);
      
    if (error) {
      console.error('Error fetching bookings by email:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }
};

// Coupon Service
export const CouponService = {
  async getCoupons(fromCityId: string) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('from_city_id', fromCityId)
      .gte('valid_to', new Date().toISOString().split('T')[0]);
      
    if (error) {
      console.error('Error fetching coupons:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  },
  
  async validateCoupon(code: string, fare: number, fromCityId: string) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', code)
      .eq('from_city_id', fromCityId)
      .gte('valid_to', new Date().toISOString().split('T')[0])
      .single();
      
    if (error) {
      console.error('Error validating coupon:', error);
      return { valid: false, message: 'Invalid coupon code' };
    }
    
    const finalDiscount = (fare * data.discount / 100);
    
    return {
      valid: true,
      discount: data.discount,
      discountAmount: finalDiscount,
      message: `Coupon applied successfully! ₹${finalDiscount.toFixed(2)} discount`
    };
  }
};

