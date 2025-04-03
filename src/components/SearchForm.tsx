
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, MapPin, ArrowRight, Printer, Bus } from 'lucide-react';
import { cities } from '../data/mockData';

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

  return (
    <div className="card animate-fade-in overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 font-medium text-center ${activeTab === TabTypes.BOOK ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
          onClick={() => setActiveTab(TabTypes.BOOK)}
        >
          Book
        </button>
        <button
          className={`flex-1 py-3 font-medium text-center ${activeTab === TabTypes.PRINT ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
          onClick={() => setActiveTab(TabTypes.PRINT)}
        >
          Print
        </button>
        <button
          className={`flex-1 py-3 font-medium text-center ${activeTab === TabTypes.TRACK ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
          onClick={() => setActiveTab(TabTypes.TRACK)}
        >
          Track
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === TabTypes.BOOK && (
          <>
            <p className="text-center text-gray-600 mb-4">Where would you like to go?</p>
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
                      onChange={(e) => setFromCity(e.target.value)}
                      onFocus={() => setFromFocused(true)}
                      onBlur={() => setTimeout(() => setFromFocused(false), 200)}
                      required
                    />
                  </div>
                  {fromFocused && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-far-lightgray rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {cities
                        .filter(city => city.name.toLowerCase().includes(fromCity.toLowerCase()))
                        .map((city) => (
                          <div
                            key={city.id}
                            className="px-4 py-2 hover:bg-far-cream cursor-pointer"
                            onClick={() => {
                              setFromCity(city.name);
                              setFromFocused(false);
                            }}
                          >
                            {city.name}
                          </div>
                        ))}
                    </div>
                  )}
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
                      onChange={(e) => setToCity(e.target.value)}
                      onFocus={() => setToFocused(true)}
                      onBlur={() => setTimeout(() => setToFocused(false), 200)}
                      required
                    />
                  </div>
                  {toFocused && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-far-lightgray rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {cities
                        .filter(city => city.name.toLowerCase().includes(toCity.toLowerCase()))
                        .map((city) => (
                          <div
                            key={city.id}
                            className="px-4 py-2 hover:bg-far-cream cursor-pointer"
                            onClick={() => {
                              setToCity(city.name);
                              setToFocused(false);
                            }}
                          >
                            {city.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center border border-far-gray rounded-md bg-white overflow-hidden">
                  <div className="pl-3">
                    <Calendar className="h-5 w-5 text-far-green" />
                  </div>
                  <input
                    type="date"
                    className="input-field border-0 flex-grow"
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    min={today}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md flex items-center justify-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </button>
              </div>
            </form>
          </>
        )}

        {(activeTab === TabTypes.PRINT || activeTab === TabTypes.TRACK) && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex items-center border border-far-gray rounded-md bg-white overflow-hidden">
                <div className="pl-3">
                  <Bus className="h-5 w-5 text-far-green" />
                </div>
                <input
                  type="text"
                  placeholder="PNR Number"
                  className="input-field border-0 flex-grow"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center border border-far-gray rounded-md bg-white overflow-hidden">
                <div className="pl-3">
                  <Calendar className="h-5 w-5 text-far-green" />
                </div>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  className="input-field border-0 flex-grow"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md flex items-center justify-center"
              >
                {activeTab === TabTypes.PRINT ? (
                  <>
                    <Printer className="h-5 w-5 mr-2" />
                    Print Ticket
                  </>
                ) : (
                  <>
                    <Bus className="h-5 w-5 mr-2" />
                    Track Bus
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
