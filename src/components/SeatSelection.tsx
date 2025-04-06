
import React, { useState, useEffect } from 'react';
import { Seat } from '../types';
import { Info, HelpCircle, ArrowRight } from 'lucide-react';

interface SeatSelectionProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSelectSeat: (seat: Seat) => void;
  busType: "Sleeper" | "Seater";
  busLayout: "2+1" | "2+1-sleeper-seater" | "seater-sleeper" | "tilted-sleeper" | "all-seater";
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ 
  seats, 
  selectedSeats, 
  onSelectSeat, 
  busType,
  busLayout
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Group seats by deck
  const lowerDeckSeats = seats.filter(seat => seat.deck === "lower");
  const upperDeckSeats = seats.filter(seat => seat.deck === "upper");
  
  useEffect(() => {
    if (seats.length > 0) {
      setIsLoading(false);
    }
  }, [seats]);
  
  const getSeatStatus = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) {
      return 'selected';
    }
    return seat.status;
  }
  
  const getSeatClasses = (seat: Seat) => {
    const status = getSeatStatus(seat);
    
    let classes = 'sleeper-seat flex items-center justify-center text-xs font-medium cursor-pointer h-12 rounded-md ';
    
    if (status === 'available') {
      classes += 'bg-white border border-gray-300 hover:border-far-green ';
    } else if (status === 'booked') {
      classes += 'bg-far-gray text-white cursor-not-allowed ';
    } else if (status === 'female_booked') {
      classes += 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed ';
    } else if (status === 'selected') {
      classes += 'bg-far-green text-white border-far-green ';
    }
    
    return classes;
  };

  const renderDeck = (deckSeats: Seat[], deckType: 'upper' | 'lower') => {
    if (deckSeats.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          No seats available for this deck
        </div>
      );
    }

    // Organize seats into a modified grid with 6 columns now
    const rows = 3;
    const cols = 6;
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    // Map seat numbers to grid positions
    deckSeats.forEach(seat => {
      const seatNum = seat.number;
      // Decode seat number format to row/col (e.g., L01, U23)
      const deckPrefix = deckType === 'lower' ? 'L' : 'U';
      if (seatNum.startsWith(deckPrefix)) {
        const numPart = seatNum.substring(1);
        const row = Math.floor((parseInt(numPart) - 1) / cols);
        const col = (parseInt(numPart) - 1) % cols;
        
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
          grid[row][col] = seat;
        }
      }
    });

    return (
      <div className="mb-8">
        <h3 className="text-lg font-serif mb-2">
          {deckType === 'lower' ? 'Lower Deck' : 'Upper Deck'}
        </h3>
        
        {/* Bus direction indicators */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-2 mt-3">
          {grid.map((row, rowIndex) => (
            <React.Fragment key={`${deckType}-row-${rowIndex}`}>
              {row.map((seat, colIndex) => (
                <div 
                  key={`${deckType}-${rowIndex}-${colIndex}`} 
                  className={`relative ${!seat ? 'opacity-0' : ''} ${
                    // Add pathway between rows 2 and 3 (after row 2)
                    rowIndex === 2 ? 'mt-4' : ''
                  }`}
                >
                  {seat && (
                    <div
                      className={getSeatClasses(seat)}
                      onClick={() => {
                        if (seat.status === 'available') {
                          onSelectSeat(seat);
                        }
                      }}
                    >
                      <span>{seat.number}</span>
                    </div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-serif">Select Seats</h3>
        </div>
        <div className="bg-white border border-far-lightgray rounded-lg p-6">
          <div className="text-center py-12">
            <p>Loading seat layout...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-serif">Select Seats</h3>
        <button 
          className="flex items-center text-sm text-far-black"
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
              <div className="h-5 w-5 bg-white border border-gray-300 mr-2"></div>
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
              <HelpCircle className="h-4 w-4 mr-1 inline-block text-far-black" />
              If a female is booked on a double berth, only another female can book the adjacent seat.
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white border border-far-lightgray rounded-lg p-6">
        {/* Render Lower Deck first - matching the requirement */}
        {renderDeck(lowerDeckSeats, 'lower')}
        
        {/* Render Upper Deck below */}
        {renderDeck(upperDeckSeats, 'upper')}
        
        {seats.length === 0 && (
          <div className="text-center py-8">
            <p>No seats available for this bus.</p>
          </div>
        )}
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
