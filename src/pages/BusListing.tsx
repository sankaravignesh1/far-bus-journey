
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchForm from '../components/SearchForm';
import BusList from '../components/BusList';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { CityIdService, RouteService, BusService } from '../services/api';
import { Bus } from '../types';

const BusListing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const fromCity = queryParams.get('from') || '';
  const toCity = queryParams.get('to') || '';
  const journeyDate = queryParams.get('date') || '';

  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    // Departure Time
    morning: false,  // 6AM - 12PM
    afternoon: false, // 12PM - 6PM
    evening: false,  // 6PM - 12AM
    night: false,    // 12AM - 6AM
    
    // Bus Type
    ac: false,
    nonAc: false,
    sleeper: false,
    seater: false,
    
    // Seat Features
    singleSeats: false,
    
    // Amenities
    wifi: false,
    chargingPoint: false,
    blanket: false,
    waterBottle: false,
  });

  const handleFilterChange = (filterName: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName as keyof typeof prev]
    }));
  };

  useEffect(() => {
    const fetchBuses = async () => {
      if (!fromCity || !toCity || !journeyDate) {
        setError('Please provide from city, to city and journey date');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        // First get the route ID
        const fromCityData= await CityIdService.getCityID(fromCity);
        const toCityData= await CityIdService.getCityID(toCity);
        if (!fromCityData || !toCityData || fromCityData.length === 0 || toCityData.length === 0) {
           setError(`Invalid city name: ${!fromCityData ? fromCity : toCity}`);
           setLoading(false);
           return;
        } 
        
        const fromcityID = fromCityData[0].city_id;
        const tocityID = toCityData[0].city_id;
        const route = await RouteService.getRoute(fromcityID, tocityID);
        
        if (!route) {
          setError(`No routes found from ${fromCity} to ${toCity}`);
          setLoading(false);
          return;
        }
        
        // Then fetch buses for this route and date
        const busesData = await BusService.searchBuses(fromCity, toCity, route.route_id, journeyDate);
        
        // Convert the API response to match our Bus type
        const formattedBuses: Bus[] = busesData.map((bus: any) => ({
          id: bus.bus_id,
          name: bus.operator_name,
          type: bus.bus_type,
          
          departureTime: bus.departure_time ? bus.departure_time.substring(0, 5) : '00:00',
          arrivalTime: bus.arrival_time ? bus.arrival_time.substring(0, 5) : '00:00',
          duration: bus.duration,
          availableSeats: bus.available_seats,
          singleSeats: bus.singleseats_available,
          fare: bus.starting_fare,
          amenities: bus.amenities ? (typeof bus.amenities === 'string' ? JSON.parse(bus.amenities) : bus.amenities) : [],
          
        }));
        
        setBuses(formattedBuses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching buses:', error);
        setError('Error fetching buses. Please try again.');
        setLoading(false);
      }
    };
    
    fetchBuses();
  }, [fromCity, toCity, journeyDate]);

  // Filter buses based on selected filters
  const filteredBuses = buses.filter(bus => {
    // If no filters are selected, return all buses
    if (Object.values(filters).every(value => value === false)) {
      return true;
    }

    // Apply Departure Time filters
    const departureHour = parseInt(bus.departureTime.split(':')[0]);
    if (filters.morning && (departureHour >= 6 && departureHour < 12)) {
      return true;
    }
    if (filters.afternoon && (departureHour >= 12 && departureHour < 18)) {
      return true;
    }
    if (filters.evening && (departureHour >= 18 && departureHour < 24)) {
      return true;
    }
    if (filters.night && (departureHour >= 0 && departureHour < 6)) {
      return true;
    }

    // Apply Bus Type filters
    if (filters.ac && bus.type.toLowerCase().includes('ac') && !bus.type.toLowerCase().includes('non')) {
      return true;
    }
    if (filters.nonAc && bus.type.toLowerCase().includes('non')) {
      return true;
    }
    if (filters.sleeper && bus.type.toLowerCase().includes('sleeper')) {
      return true;
    }
    if (filters.seater && bus.type.toLowerCase().includes('seater')) {
      return true;
    }

    // Apply Seat Features filters
    if (filters.singleSeats && bus.singleSeats > 0) {
      return true;
    }

    // Apply Amenities filters
    if (filters.wifi && bus.amenities.includes('WiFi')) {
      return true;
    }
    if (filters.chargingPoint && bus.amenities.includes('Charging Point')) {
      return true;
    }
    if (filters.blanket && bus.amenities.includes('Blanket')) {
      return true;
    }
    if (filters.waterBottle && bus.amenities.includes('Water Bottle')) {
      return true;
    }

    return false;
  });

  return (
    <Layout>
      <div className="container-custom py-8">
        <button onClick={() => navigate('/')} className="flex items-center text-far-black mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </button>
        
        <div className="mb-8">
          <h1 className="text-2xl font-serif mb-2">
            {fromCity} to {toCity}
          </h1>
          <p className="text-far-black/70">
            {new Date(journeyDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 card h-fit p-4">
            <h3 className="text-lg font-serif mb-4">Advanced Filters</h3>
            <div className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="departure-time">
                  <AccordionTrigger className="text-sm font-medium py-2">Departure Time</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.morning}
                          onChange={() => handleFilterChange('morning')}
                        />
                        <span className="text-sm">Morning (6AM - 12PM)</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.afternoon}
                          onChange={() => handleFilterChange('afternoon')}
                        />
                        <span className="text-sm">Afternoon (12PM - 6PM)</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.evening}
                          onChange={() => handleFilterChange('evening')}
                        />
                        <span className="text-sm">Evening (6PM - 12AM)</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.night}
                          onChange={() => handleFilterChange('night')}
                        />
                        <span className="text-sm">Night (12AM - 6AM)</span>
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="bus-type">
                  <AccordionTrigger className="text-sm font-medium py-2">Bus Type</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.ac}
                          onChange={() => handleFilterChange('ac')}
                        />
                        <span className="text-sm">AC</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.nonAc}
                          onChange={() => handleFilterChange('nonAc')}
                        />
                        <span className="text-sm">Non-AC</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.sleeper}
                          onChange={() => handleFilterChange('sleeper')}
                        />
                        <span className="text-sm">Sleeper</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.seater}
                          onChange={() => handleFilterChange('seater')}
                        />
                        <span className="text-sm">Seater</span>
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="seat-features">
                  <AccordionTrigger className="text-sm font-medium py-2">Seat Features</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.singleSeats}
                          onChange={() => handleFilterChange('singleSeats')}
                        />
                        <span className="text-sm">Single Seats Available</span>
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="amenities">
                  <AccordionTrigger className="text-sm font-medium py-2">Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.wifi}
                          onChange={() => handleFilterChange('wifi')}
                        />
                        <span className="text-sm">WiFi</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.chargingPoint}
                          onChange={() => handleFilterChange('chargingPoint')}
                        />
                        <span className="text-sm">Charging Point</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.blanket}
                          onChange={() => handleFilterChange('blanket')}
                        />
                        <span className="text-sm">Blanket</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={filters.waterBottle}
                          onChange={() => handleFilterChange('waterBottle')}
                        />
                        <span className="text-sm">Water Bottle</span>
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {loading ? (
              <div className="card text-center py-10">
                <p className="text-lg font-medium">Loading buses...</p>
              </div>
            ) : error ? (
              <div className="card text-center py-10">
                <p className="text-lg font-medium text-red-500">{error}</p>
                <button 
                  className="btn-outline mt-4"
                  onClick={() => navigate('/')}
                >
                  Back to Search
                </button>
              </div>
            ) : (
              <BusList buses={filteredBuses} journeyDate={journeyDate} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BusListing;
