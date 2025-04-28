
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
      .eq('is_popular', true);
      
    if (error) {
      console.error('Error fetching popular cities:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }
};

// Route Service
export const RouteService = {
  async getRoute(fromCityId: string, toCityId: string) {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('from_city_id', fromCityId)
      .eq('to_city_id', toCityId)
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
  async searchBuses(routeId: string, journeyDate: string) {
    const { data, error } = await supabase
      .from('bus_list')
      .select(`
        *,
        routes(*)
      `)
      .eq('route_id', routeId)
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
  }
};

// Seat Service
export const SeatService = {
  async getBusLayout(busId: string, journeyDate: string) {
    const { data, error } = await supabase
      .from('bus_layout')
      .select('*')
      .eq('bus_id', busId)
      .eq('date_of_journey', journeyDate);
      
    if (error) {
      console.error('Error fetching bus layout:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }
};

// BoardingPoint Service
export const BoardingPointService = {
  async getBoardingPoints(busId: string) {
    const { data, error } = await supabase
      .from('boarding_points')
      .select('*')
      .eq('bus_id', busId)
      .order('b_time', { ascending: true });
      
    if (error) {
      console.error('Error fetching boarding points:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }
};

// DroppingPoint Service
export const DroppingPointService = {
  async getDroppingPoints(busId: string) {
    const { data, error } = await supabase
      .from('dropping_points')
      .select('*')
      .eq('bus_id', busId)
      .order('d_time', { ascending: true });
      
    if (error) {
      console.error('Error fetching dropping points:', error);
      throw new Error(error.message);
    }
    
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
      throw new Error(error.message);
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
  async getCoupons(fromCityId: string, fromCity: string) {
    const { data, error } = await supabase.functions.invoke('fetch-coupons', {
      body: { fromCityId, fromCity }
    });
    
    if (error) {
      console.error('Error fetching coupons:', error);
      throw new Error(error.message);
    }
    
    return data?.coupons || [];
  },
  
  async validateCoupon(code: string, fare: number) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', code)
      .gte('valid_to', new Date().toISOString().split('T')[0])
      .single();
      
    if (error) {
      console.error('Error validating coupon:', error);
      return { valid: false, message: 'Invalid coupon code' };
    }
    
    if (data.min_fare && fare < data.min_fare) {
      return { valid: false, message: `Minimum fare of ₹${data.min_fare} required` };
    }
    
    const discountAmount = (fare * data.discount / 100);
    const maxDiscount = data.max_discount || Infinity;
    const finalDiscount = Math.min(discountAmount, maxDiscount);
    
    return {
      valid: true,
      discount: data.discount,
      discountAmount: finalDiscount,
      message: `Coupon applied successfully! ₹${finalDiscount.toFixed(2)} discount`
    };
  }
};
