
import React, { useState } from 'react';
import { Bus } from '../types';
import BusCard from './BusCard';
import { Filter } from 'lucide-react';

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
  
  const toggleFilter = (filterName: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };
  
  const filteredBuses = buses.filter(bus => {
    // If no filters are active, show all buses
    if (!filters.ac && !filters.nonAc && !filters.sleeper && !filters.seater && !filters.singleSeats) {
      return true;
    }
    
    let matchesFilter = false;
    
    // Apply AC/Non-AC filter
    if (filters.ac && bus.type === 'AC') {
      matchesFilter = true;
    }
    if (filters.nonAc && bus.type === 'Non-AC') {
      matchesFilter = true;
    }
    
    // Apply Sleeper/Seater filter
    if (filters.sleeper && bus.category === 'Sleeper') {
      matchesFilter = true;
    }
    if (filters.seater && bus.category === 'Seater') {
      matchesFilter = true;
    }
    
    // Apply Single Seats filter
    if (filters.singleSeats && bus.singleSeats > 0) {
      matchesFilter = true;
    }
    
    return matchesFilter;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">{buses.length} Buses Found</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filters:
          </span>
          <button
            className={`px-3 py-1 text-sm rounded-full border ${
              filters.ac ? 'bg-far-black text-far-cream' : 'border-far-gray bg-white'
            }`}
            onClick={() => toggleFilter('ac')}
          >
            AC
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full border ${
              filters.nonAc ? 'bg-far-black text-far-cream' : 'border-far-gray bg-white'
            }`}
            onClick={() => toggleFilter('nonAc')}
          >
            Non-AC
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full border ${
              filters.sleeper ? 'bg-far-black text-far-cream' : 'border-far-gray bg-white'
            }`}
            onClick={() => toggleFilter('sleeper')}
          >
            Sleeper
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full border ${
              filters.seater ? 'bg-far-black text-far-cream' : 'border-far-gray bg-white'
            }`}
            onClick={() => toggleFilter('seater')}
          >
            Seater
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full border ${
              filters.singleSeats ? 'bg-far-black text-far-cream' : 'border-far-gray bg-white'
            }`}
            onClick={() => toggleFilter('singleSeats')}
          >
            Single Seats
          </button>
        </div>
      </div>
      
      {filteredBuses.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-lg font-medium">No buses found matching your filters.</p>
          <button 
            className="btn-outline mt-4"
            onClick={() => setFilters({ac: false, nonAc: false, sleeper: false, seater: false, singleSeats: false})}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        filteredBuses.map(bus => (
          <BusCard key={bus.id} bus={bus} journeyDate={journeyDate} />
        ))
      )}
    </div>
  );
};

export default BusList;
