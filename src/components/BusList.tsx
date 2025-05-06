
import React, { useState } from 'react';
import { Bus } from '../types';
import BusCard from './BusCard';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface BusListProps {
  buses: Bus[];
  journeyDate: string;
}

const BusList: React.FC<BusListProps> = ({ buses, journeyDate }) => {
  const [filters, setFilters] = useState({
    ac: false,
    nonAc: false,
    sleeper: false,
    seater: false,
    singleSeats: false,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  const toggleFilter = (filterName: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      ac: false,
      nonAc: false,
      sleeper: false,
      seater: false,
      singleSeats: false,
    });
  };
  
  const filteredBuses = buses.filter(bus => {
    // If no filters are active, show all buses
    if (!filters.ac && !filters.nonAc && !filters.sleeper && !filters.seater && !filters.singleSeats) {
      return true;
    }
    
    // Apply AC/Non-AC filter
    const typeMatch = 
      (filters.ac && bus.bus_type.toLowerCase().includes('ac') && !bus.bus_type.toLowerCase().includes('non-ac')) ||
      (filters.nonAc && bus.bus_type.toLowerCase().includes('non-ac')) ||
      (!filters.ac && !filters.nonAc);
    
    // Apply Sleeper/Seater filter
    const categoryMatch = 
      (filters.sleeper && bus.bus_type.toLowerCase().includes('sleeper')) ||
      (filters.seater && bus.bus_type.toLowerCase().includes('seater')) || 
      (!filters.sleeper && !filters.seater);
    
    // Apply Single Seats filter
    const singleSeatsMatch = 
      (filters.singleSeats && bus.singleseats_available > 0) || 
      !filters.singleSeats;
    
    return typeMatch && categoryMatch && singleSeatsMatch;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">{buses.length} Buses Found</h2>
        <button 
          className="flex items-center px-4 py-2 bg-far-cream text-far-black rounded-md"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" /> 
          Filters 
          {showFilters ? 
            <ChevronUp className="h-4 w-4 ml-2" /> : 
            <ChevronDown className="h-4 w-4 ml-2" />
          }
        </button>
      </div>
      
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-far-lightgray mb-6 animate-fade-in">
          <h3 className="text-lg font-medium mb-3">Filter Buses</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                filters.ac ? 'bg-far-black text-far-cream' : 'border-far-gray bg-white'
              }`}
              onClick={() => toggleFilter('ac')}
            >
              AC
            </button>
            <button
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                filters.nonAc ? 'bg-far-black text-far-cream' : 'border-far-gray bg-white'
              }`}
              onClick={() => toggleFilter('nonAc')}
            >
              Non-AC
            </button>
            <button
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                filters.sleeper ? 'bg-far-black text-far-cream' : 'border-far-gray bg-white'
              }`}
              onClick={() => toggleFilter('sleeper')}
            >
              Sleeper
            </button>
            <button
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                filters.seater ? 'bg-far-black text-far-cream' : 'border-far-gray bg-white'
              }`}
              onClick={() => toggleFilter('seater')}
            >
              Seater
            </button>
            <button
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                filters.singleSeats ? 'bg-far-black text-far-cream' : 'border-far-gray bg-white'
              }`}
              onClick={() => toggleFilter('singleSeats')}
            >
              Single Seats
            </button>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              className="text-sm text-far-black underline"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      {filteredBuses.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-lg font-medium">No buses found matching your filters.</p>
          <button 
            className="btn-outline mt-4"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        filteredBuses.map(bus => (
          <BusCard key={bus.bus_id} bus={bus} journeyDate={journeyDate} />
        ))
      )}
    </div>
  );
};

export default BusList;
