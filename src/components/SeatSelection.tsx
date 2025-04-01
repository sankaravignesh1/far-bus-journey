
import React, { useState } from 'react';
import { Seat } from '../types';
import { Info, HelpCircle } from 'lucide-react';

interface SeatSelectionProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSelectSeat: (seat: Seat) => void;
  busType: "Sleeper" | "Seater";
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ 
  seats, 
  selectedSeats, 
  onSelectSeat, 
  busType 
}) => {
  const [showInfo, setShowInfo] = useState(false);
  
  const lowerDeckSeats = seats.filter(seat => seat.deck === "lower");
  const upperDeckSeats = seats.filter(seat => seat.deck === "upper");
  
  const renderSeats = (deckSeats: Seat[]) => {
    if (busType === "Sleeper") {
      return (
        <div className="grid grid-cols-3 gap-4">
          {deckSeats.map((seat) => (
            <div
              key={seat.id}
              className={`
                h-16 w-full border-2 rounded-sm cursor-pointer relative flex items-center justify-center transition-all
                ${seat.status === 'available' ? 'bg-white border-far-gray hover:border-far-green' : ''}
                ${seat.status === 'booked' ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                ${seat.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                ${selectedSeats.some(s => s.id === seat.id) ? 'bg-far-green border-far-green text-white' : ''}
              `}
              onClick={() => {
                if (seat.status === 'available') {
                  onSelectSeat(seat);
                }
              }}
            >
              <span className="font-medium text-sm">{seat.number}</span>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-5 gap-2">
          {deckSeats.map((seat) => (
            <div
              key={seat.id}
              className={`
                seat
                ${seat.status === 'available' ? 'seat-available' : ''}
                ${seat.status === 'booked' ? 'seat-booked' : ''}
                ${seat.status === 'female_booked' ? 'seat-female' : ''}
                ${selectedSeats.some(s => s.id === seat.id) ? 'seat-selected' : ''}
              `}
              onClick={() => {
                if (seat.status === 'available') {
                  onSelectSeat(seat);
                }
              }}
            >
              {seat.number}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-serif">Select Seats</h3>
        <button 
          className="flex items-center text-sm text-far-green"
          onClick={() => setShowInfo(!showInfo)}
        >
          <Info className="h-4 w-4 mr-1" />
          Seat Info
        </button>
      </div>
      
      {showInfo && (
        <div className="bg-far-cream rounded-md p-4 mb-6">
          <h4 className="font-medium mb-2">Seat Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="h-5 w-5 bg-white border border-far-gray mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 bg-far-gray mr-2"></div>
              <span className="text-sm">Booked</span>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 bg-pink-200 mr-2"></div>
              <span className="text-sm">Female Booked</span>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 bg-far-green mr-2"></div>
              <span className="text-sm">Selected</span>
            </div>
          </div>
          <div className="mt-3 text-sm text-far-black/70">
            <p className="flex items-center">
              <HelpCircle className="h-4 w-4 mr-1 inline-block text-far-green" />
              If a female is booked on a double berth, only another female can book the adjacent seat.
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white border border-far-lightgray rounded-lg p-6">
        <div className="mb-8">
          <h4 className="font-medium mb-4 flex items-center">
            <span className="bg-far-green/20 text-far-green text-xs px-2 py-1 rounded-md mr-2">Lower Deck</span>
          </h4>
          <div className="overflow-x-auto pb-2">
            {renderSeats(lowerDeckSeats)}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-4 flex items-center">
            <span className="bg-far-black/10 text-far-black/80 text-xs px-2 py-1 rounded-md mr-2">Upper Deck</span>
          </h4>
          <div className="overflow-x-auto pb-2">
            {renderSeats(upperDeckSeats)}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-far-black/70">
          You can select a maximum of 6 seats per booking
        </p>
      </div>
    </div>
  );
};

export default SeatSelection;
