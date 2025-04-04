
import React, { useState } from 'react';
import { Seat } from '../types';
import { Info, HelpCircle } from 'lucide-react';

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
  
  const lowerDeckSeats = seats.filter(seat => seat.deck === "lower");
  const upperDeckSeats = seats.filter(seat => seat.deck === "upper");
  
  const getSeatClasses = (seat?: Seat) => {
    if (!seat) return 'opacity-0';
    
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    let classes = 'h-10 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer ';
    
    if (seat.status === 'available') {
      classes += 'bg-white border border-gray-300 hover:border-far-green ';
    } else if (seat.status === 'booked') {
      classes += 'bg-far-gray text-white cursor-not-allowed ';
    } else if (seat.status === 'female_booked') {
      classes += 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed ';
    }
    
    if (isSelected) {
      classes += 'bg-far-green border-far-green text-white ';
    }
    
    return classes;
  };
  
  const renderSleeperLayout = (deckSeats: Seat[], deck: 'upper' | 'lower') => {
    // Create a map for quick lookup
    const seatMap = new Map<string, Seat>();
    deckSeats.forEach(seat => {
      seatMap.set(seat.number, seat);
    });
    
    // Define the seat arrangement patterns based on layout
    let doubleRow1: string[] = [];
    let doubleRow2: string[] = [];
    let singleRow: string[] = [];
    
    if (deck === 'upper') {
      doubleRow1 = ['DU2', 'DU4', 'DU6', 'DU8', 'DU10', 'DU12'];
      doubleRow2 = ['DU1', 'DU3', 'DU5', 'DU7', 'DU9', 'DU11'];
      singleRow = ['SU1', 'SU2', 'SU3', 'SU4', 'SU5', 'SU6'];
    } else { // lower deck
      doubleRow1 = ['DL2', 'DL4', 'DL6', 'DL8', 'DL10', 'DL12'];
      doubleRow2 = ['DL1', 'DL3', 'DL5', 'DL7', 'DL9', 'DL11'];
      singleRow = ['SL1', 'SL2', 'SL3', 'SL4', 'SL5', 'SL6'];
    }
    
    return (
      <div className="mb-8">
        <div className="text-sm text-far-black/70 mb-2">{deck === 'upper' ? 'Upper Deck' : 'Lower Deck'}</div>
        
        {deck === 'lower' && (
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center mr-2">
              <span className="text-xs">👨‍✈️</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-6 gap-1 mb-2">
          {doubleRow1.map((seatNumber) => {
            const seat = seatMap.get(seatNumber);
            const classes = getSeatClasses(seat);
            
            return (
              <div
                key={seatNumber}
                className={classes}
                onClick={() => {
                  if (seat && seat.status === 'available') {
                    onSelectSeat(seat);
                  }
                }}
              >
                {seatNumber}
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-6 gap-1 mb-4">
          {doubleRow2.map((seatNumber) => {
            const seat = seatMap.get(seatNumber);
            const classes = getSeatClasses(seat);
            
            return (
              <div
                key={seatNumber}
                className={classes}
                onClick={() => {
                  if (seat && seat.status === 'available') {
                    onSelectSeat(seat);
                  }
                }}
              >
                {seatNumber}
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-6 gap-1">
          {singleRow.map((seatNumber) => {
            const seat = seatMap.get(seatNumber);
            const classes = getSeatClasses(seat);
            
            return (
              <div
                key={seatNumber}
                className={classes}
                onClick={() => {
                  if (seat && seat.status === 'available') {
                    onSelectSeat(seat);
                  }
                }}
              >
                {seatNumber}
              </div>
            );
          })}
        </div>
        
        <div className="w-12 h-1.5 bg-green-500 mt-2 rounded-sm"></div>
      </div>
    );
  };
  
  const renderSeaterLayout = (deckSeats: Seat[]) => {
    // Group seats by rows
    const seatsByRow = deckSeats.reduce((acc: Record<string, Seat[]>, seat) => {
      const row = seat.number.charAt(0);
      if (!acc[row]) {
        acc[row] = [];
      }
      acc[row].push(seat);
      return acc;
    }, {});
    
    return (
      <div>
        <div className="text-sm text-far-black/70 mb-2">Seating Arrangement</div>
        
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center mr-2">
            <span className="text-xs">👨‍✈️</span>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {deckSeats.map((seat) => (
            <div
              key={seat.id}
              className={`
                seat h-10 rounded-md flex items-center justify-center text-xs font-medium
                ${seat.status === 'available' ? 'bg-white border border-gray-300 hover:border-far-green cursor-pointer' : ''}
                ${seat.status === 'booked' ? 'bg-far-gray text-white cursor-not-allowed' : ''}
                ${seat.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                ${selectedSeats.some(s => s.id === seat.id) ? 'bg-far-green border-far-green text-white' : ''}
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
      </div>
    );
  };
  
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
        {upperDeckSeats.length > 0 && renderSleeperLayout(upperDeckSeats, 'upper')}
        
        {lowerDeckSeats.length > 0 && (
          busType === 'Sleeper' ? renderSleeperLayout(lowerDeckSeats, 'lower') : renderSeaterLayout(lowerDeckSeats)
        )}
        
        {lowerDeckSeats.length === 0 && upperDeckSeats.length === 0 && (
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
