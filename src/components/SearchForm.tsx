
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, MapPin, ArrowRight } from 'lucide-react';
import { cities } from '../data/mockData';

const SearchForm = () => {
  const navigate = useNavigate();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [journeyDate, setJourneyDate] = useState('');
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromCity && toCity && journeyDate) {
      navigate(`/bus-listing?from=${fromCity}&to=${toCity}&date=${journeyDate}`);
    }
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="card animate-fade-in">
      <h2 className="text-xl font-serif mb-6">Search for Buses</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
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
            className="btn-primary flex items-center mx-auto"
          >
            <Search className="h-4 w-4 mr-2" />
            Search Buses
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
