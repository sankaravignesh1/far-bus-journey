
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, MapPin, ArrowRight, Printer, Bus } from 'lucide-react';
import { CityService } from '../services/api';

const TabTypes = {
  BOOK: 'book',
  PRINT: 'print',
  TRACK: 'track'
};

const SearchForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TabTypes.BOOK);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [journeyDate, setJourneyDate] = useState('');
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  const [pnr, setPnr] = useState('');
  const [mobile, setMobile] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [popularCities, setPopularCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const popularCitiesData = await CityService.getPopularCities();
        setPopularCities(popularCitiesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching popular cities:', error);
        setLoading(false);
      }
    };
    
    fetchCities();
  }, []);

  // Search cities when user types in the from/to fields
  useEffect(() => {
    const searchCities = async () => {
      if (searchQuery.length >= 2) {
        try {
          const citiesData = await CityService.getCities(searchQuery);
          setCities(citiesData);
        } catch (error) {
          console.error('Error searching cities:', error);
        }
      }
    };
    
    searchCities();
  }, [searchQuery]);

  const handleFromCityFocus = () => {
    setFromFocused(true);
    setSearchQuery(fromCity);
  };

  const handleToCityFocus = () => {
    setToFocused(true);
    setSearchQuery(toCity);
  };

  const handleFromCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromCity(e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleToCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToCity(e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === TabTypes.BOOK) {
      if (fromCity && toCity && journeyDate) {
        navigate(`/bus-listing?from=${fromCity}&to=${toCity}&date=${journeyDate}`);
      }
    } else if (activeTab === TabTypes.PRINT) {
      if (pnr && mobile) {
        navigate(`/print-ticket?pnr=${pnr}&mobile=${mobile}`);
      }
    } else if (activeTab === TabTypes.TRACK) {
      if (pnr && mobile) {
        navigate(`/track?pnr=${pnr}&mobile=${mobile}`);
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return <div className="card animate-fade-in overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button className={`flex-1 py-3 font-medium text-center ${activeTab === TabTypes.BOOK ? 'bg-far-black text-far-cream' : 'bg-far-cream text-far-black'}`} onClick={() => setActiveTab(TabTypes.BOOK)}>
          Book
        </button>
        <button className={`flex-1 py-3 font-medium text-center ${activeTab === TabTypes.PRINT ? 'bg-far-black text-far-cream' : 'bg-far-cream text-far-black'}`} onClick={() => setActiveTab(TabTypes.PRINT)}>
          Print
        </button>
        <button className={`flex-1 py-3 font-medium text-center ${activeTab === TabTypes.TRACK ? 'bg-far-black text-far-cream' : 'bg-far-cream text-far-black'}`} onClick={() => setActiveTab(TabTypes.TRACK)}>
          Track
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === TabTypes.BOOK && <>
            <p className="text-center text-far-black/70 mb-4">Where would you like to go?</p>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-center border border-far-gray rounded-md bg-white overflow-hidden">
                    <div className="pl-3">
                      <MapPin className="h-5 w-5 text-far-green" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="From" 
                      className="input-field border-0 flex-grow" 
                      value={fromCity} 
                      onChange={handleFromCityChange}
                      onFocus={handleFromCityFocus}
                      onBlur={() => setTimeout(() => setFromFocused(false), 200)} 
                      required 
                    />
                  </div>
                  {fromFocused && <div className="absolute z-10 mt-1 w-full bg-white border border-far-lightgray rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {loading ? (
                        <div className="px-4 py-2 text-center">Loading cities...</div>
                      ) : searchQuery.length < 2 ? (
                        // Show popular cities when search query is too short
                        <>
                          <div className="px-4 py-2 text-sm text-far-black/70 bg-far-cream">Popular Cities</div>
                          {popularCities.map(city => (
                            <div 
                              key={city.city_id} 
                              className="px-4 py-2 hover:bg-far-cream cursor-pointer" 
                              onClick={() => {
                                setFromCity(city.name);
                                setFromFocused(false);
                              }}
                            >
                              {city.name}
                            </div>
                          ))}
                        </>
                      ) : cities.length > 0 ? (
                        // Show search results
                        cities.map(city => (
                          <div 
                            key={city.city_id} 
                            className="px-4 py-2 hover:bg-far-cream cursor-pointer" 
                            onClick={() => {
                              setFromCity(city.name);
                              setFromFocused(false);
                            }}
                          >
                            {city.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-center text-far-black/70">No cities found</div>
                      )}
                    </div>}
                </div>

                <div className="relative">
                  <div className="flex items-center border border-far-gray rounded-md bg-white overflow-hidden">
                    <div className="pl-3">
                      <MapPin className="h-5 w-5 text-far-green" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="To" 
                      className="input-field border-0 flex-grow" 
                      value={toCity} 
                      onChange={handleToCityChange}
                      onFocus={handleToCityFocus}
                      onBlur={() => setTimeout(() => setToFocused(false), 200)} 
                      required 
                    />
                  </div>
                  {toFocused && <div className="absolute z-10 mt-1 w-full bg-white border border-far-lightgray rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {loading ? (
                        <div className="px-4 py-2 text-center">Loading cities...</div>
                      ) : searchQuery.length < 2 ? (
                        // Show popular cities when search query is too short
                        <>
                          <div className="px-4 py-2 text-sm text-far-black/70 bg-far-cream">Popular Cities</div>
                          {popularCities.map(city => (
                            <div 
                              key={city.city_id} 
                              className="px-4 py-2 hover:bg-far-cream cursor-pointer" 
                              onClick={() => {
                                setToCity(city.name);
                                setToFocused(false);
                              }}
                            >
                              {city.name}
                            </div>
                          ))}
                        </>
                      ) : cities.length > 0 ? (
                        // Show search results
                        cities.map(city => (
                          <div 
                            key={city.city_id} 
                            className="px-4 py-2 hover:bg-far-cream cursor-pointer" 
                            onClick={() => {
                              setToCity(city.name);
                              setToFocused(false);
                            }}
                          >
                            {city.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-center text-far-black/70">No cities found</div>
                      )}
                    </div>}
                </div>

                <div className="flex items-center border border-far-gray rounded-md bg-white overflow-hidden">
                  <div className="pl-3">
                    <Calendar className="h-5 w-5 text-far-green" />
                  </div>
                  <input type="date" className="input-field border-0 flex-grow" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} min={today} required />
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button type="submit" className="w-full bg-far-black hover:bg-far-black/80 text-far-cream py-3 px-4 rounded-md flex items-center justify-center">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </button>
              </div>
            </form>
          </>}

        {(activeTab === TabTypes.PRINT || activeTab === TabTypes.TRACK) && <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex items-center border border-far-gray rounded-md bg-white overflow-hidden">
                <div className="pl-3">
                  <Bus className="h-5 w-5 text-far-green" />
                </div>
                <input type="text" placeholder="PNR Number" className="input-field border-0 flex-grow" value={pnr} onChange={e => setPnr(e.target.value)} required />
              </div>

              <div className="flex items-center border border-far-gray rounded-md bg-white overflow-hidden">
                <div className="pl-3">
                  <Calendar className="h-5 w-5 text-far-green" />
                </div>
                <input type="tel" placeholder="Mobile Number" className="input-field border-0 flex-grow" value={mobile} onChange={e => setMobile(e.target.value)} required />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button type="submit" className="w-full bg-far-black hover:bg-far-black/80 text-far-cream py-3 px-4 rounded-md flex items-center justify-center">
                {activeTab === TabTypes.PRINT ? <>
                    <Printer className="h-5 w-5 mr-2" />
                    Print Ticket
                  </> : <>
                    <Bus className="h-5 w-5 mr-2" />
                    Track Bus
                  </>}
              </button>
            </div>
          </form>}
      </div>
    </div>;
};

export default SearchForm;
