
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
  },

  // Method to subscribe to realtime bus updates
  subscribeToRealtimeBusUpdates(callback: (payload: any) => void) {
    const channel = supabase.channel('public:bus_list')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'bus_list' 
      }, payload => {
        callback(payload);
      })
      .subscribe((status) => {
        console.log('Bus realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

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

  // Method to subscribe to realtime seat updates
  subscribeToRealtimeSeatUpdates(busId: string, callback: (payload: any) => void) {
    console.log(`Setting up realtime subscription for bus ${busId} seats`);
    const channel = supabase.channel('public:bus_layout')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'bus_layout',
        filter: `bus_id=eq.${busId}` 
      }, payload => {
        console.log('Received seat update:', payload);
        callback(payload);
      })
      .subscribe((status) => {
        console.log('Seat realtime subscription status:', status);
      });

    return () => {
      console.log(`Removing realtime subscription for bus ${busId} seats`);
      supabase.removeChannel(channel);
    };
  }
};

// BoardingPoint Service
export const BoardingPointService = {
  async getBoardingPoints(busId: string) {
    console.log(`Fetching boarding points for bus: ${busId}`);
    const { data, error } = await supabase
      .from('boarding_points')
      .select('*')
      .eq('bus_id', busId)
      .order('b_time', { ascending: true });
      
    if (error) {
      console.error('Error fetching boarding points:', error);
      throw new Error(error.message);
    }
    
    console.log(`Found ${data?.length || 0} boarding points for bus ${busId}`);
    return data || [];
  },
  
  // Method to subscribe to realtime boarding point updates
  subscribeToRealtimeBoardingPointUpdates(busId: string, callback: (payload: any) => void) {
    console.log(`Setting up realtime subscription for bus ${busId} boarding points`);
    const channel = supabase.channel('public:boarding_points')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'boarding_points',
        filter: `bus_id=eq.${busId}` 
      }, payload => {
        console.log('Received boarding point update:', payload);
        callback(payload);
      })
      .subscribe((status) => {
        console.log('Boarding point realtime subscription status:', status);
      });

    return () => {
      console.log(`Removing realtime subscription for bus ${busId} boarding points`);
      supabase.removeChannel(channel);
    };
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
      .order('d_time', { ascending: true });
      
    if (error) {
      console.error('Error fetching dropping points:', error);
      throw new Error(error.message);
    }
    
    console.log(`Found ${data?.length || 0} dropping points for bus ${busId}`);
    return data || [];
  },
  
  // Method to subscribe to realtime dropping point updates
  subscribeToRealtimeDroppingPointUpdates(busId: string, callback: (payload: any) => void) {
    console.log(`Setting up realtime subscription for bus ${busId} dropping points`);
    const channel = supabase.channel('public:dropping_points')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'dropping_points',
        filter: `bus_id=eq.${busId}` 
      }, payload => {
        console.log('Received dropping point update:', payload);
        callback(payload);
      })
      .subscribe((status) => {
        console.log('Dropping point realtime subscription status:', status);
      });

    return () => {
      console.log(`Removing realtime subscription for bus ${busId} dropping points`);
      supabase.removeChannel(channel);
    };
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

// Database Initialization Service - to seed the database with real data
export const InitDatabaseService = {
  async initializeDatabase() {
    try {
      console.log('Initializing database...');
      const { data, error } = await supabase.functions.invoke('init-database', {
        body: {}
      });
      
      if (error) {
        console.error('Error initializing database:', error);
        throw new Error(error.message);
      }
      
      console.log('Database initialization complete!', data);
      return data;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
};
