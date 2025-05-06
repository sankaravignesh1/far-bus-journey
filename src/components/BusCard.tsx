
import React from 'react';
import { Bus } from '../types';
import { Clock, User, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BusCardProps {
  bus: Bus;
  journeyDate: string;
}

const BusCard: React.FC<BusCardProps> = ({ bus, journeyDate }) => {
  return (
    <div className="card my-4 hover:shadow-lg transition-shadow">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-serif">{bus.operator_name}</h3>
          <div className="flex items-center gap-3 mt-2 text-sm text-far-black/70">
            <span className={`px-2 py-1 rounded ${bus.bus_type.toLowerCase().includes('ac') ? 'bg-far-cream text-far-black' : 'bg-far-black/10 text-far-black/60' }`} >
               {bus.bus_type}                                     
            </span>
          </div>
          <div className="mt-4 flex justify-between">
            <div>
              <p className="text-2xl font-semibold">{bus.departure_time}</p>
              <p className="text-xs text-far-black/60">Departure</p>
            </div>
            <div className="flex items-center px-4">
              <div className="w-2 h-2 rounded-full bg-far-cream"></div>
              <div className="flex-1 h-px bg-far-cream/30 mx-1"></div>
              <div className="w-2 h-2 rounded-full bg-far-cream"></div>
            </div>
            <div>
              <p className="text-2xl font-semibold">{bus.arrival_time}</p>
              <p className="text-xs text-far-black/60">Arrival</p>
            </div>
          </div>
        </div>
        
        <div className="lg:border-l lg:border-l-far-lightgray lg:pl-6">
          <div className="hidden lg:block mb-2 text-sm text-far-black/70">Amenities</div>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(bus.amenities) && bus.amenities.map((amenity, index) => (
              <span key={index} className="text-xs px-2 py-1 rounded-full bg-far-cream border border-far-lightgray">
                {amenity}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-far-cream" />
              <span><span className="font-semibold">{bus.available_seats}</span> Seats Available</span>
            </div>
            {bus.singleseats_available > 0 && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1 text-far-cream" />
                <span><span className="font-semibold">{bus.singleseats_available}</span> Single Seats</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center flex flex-col justify-between lg:border-l lg:border-l-far-lightgray lg:pl-6">
          <div>
            <p className="text-far-black text-2xl font-semibold">₹{bus.starting_fare}</p>
            <p className="text-xs text-far-black/60">Per seat</p>
          </div>
          <Link 
            to={`/seat-selection/${bus.id}?date=${journeyDate}`} 
            className="btn-primary mt-4"
          >
            Select Seats
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
