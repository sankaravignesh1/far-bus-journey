
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
  
  const renderSleeperLayout = (deckSeats: Seat[], layout: string) => {
    const singleSeats = deckSeats.filter(seat => seat.position === "single");
    const doubleSeats = deckSeats.filter(seat => seat.position === "double");
    const tiltedSeats = deckSeats.filter(seat => seat.position === "tilted");
    
    if (layout === "2+1") {
      // Render 6 seats per row (2+1) in 3 rows
      const rows = 3;
      const seatsPerRow = 6;
      
      return (
        <div className="grid grid-flow-row gap-y-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-6 gap-2">
              {Array.from({ length: seatsPerRow }).map((_, colIndex) => {
                const seatIndex = rowIndex * seatsPerRow + colIndex;
                const seat = deckSeats[seatIndex];
                
                if (!seat) return <div key={`empty-${rowIndex}-${colIndex}`} className="h-16 w-full"></div>;
                
                const isSelected = selectedSeats.some(s => s.id === seat.id);
                const isBooked = seat.status === 'booked';
                const isFemaleBooked = seat.status === 'female_booked';
                const isSingle = colIndex === 2 || colIndex === 5;
                
                return (
                  <div
                    key={seat.id}
                    className={`
                      h-16 w-full border-2 rounded-sm cursor-pointer relative flex items-center justify-center transition-all
                      ${seat.status === 'available' ? 'bg-white border-far-gray hover:border-far-cream' : ''}
                      ${isBooked ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                      ${isFemaleBooked ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                      ${isSelected ? 'bg-far-black border-far-black text-far-cream' : ''}
                      ${isSingle ? 'col-span-2' : ''}
                    `}
                    onClick={() => {
                      if (seat.status === 'available') {
                        onSelectSeat(seat);
                      }
                    }}
                  >
                    <span className="font-medium text-sm">{seat.number}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    } else if (layout.includes("tilted")) {
      // Render tilted layout (3 rows of 5 plus 1 tilted)
      const regularSeats = deckSeats.filter(seat => seat.position !== "tilted");
      const tilted = deckSeats.find(seat => seat.position === "tilted");
      
      return (
        <div className="relative">
          <div className="grid grid-cols-5 gap-2 mb-6">
            {regularSeats.map((seat) => {
              const isSelected = selectedSeats.some(s => s.id === seat.id);
              const isBooked = seat.status === 'booked';
              const isFemaleBooked = seat.status === 'female_booked';
              
              return (
                <div
                  key={seat.id}
                  className={`
                    h-16 w-full border-2 rounded-sm cursor-pointer relative flex items-center justify-center transition-all
                    ${seat.status === 'available' ? 'bg-white border-far-gray hover:border-far-cream' : ''}
                    ${isBooked ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                    ${isFemaleBooked ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-black border-far-black text-far-cream' : ''}
                  `}
                  onClick={() => {
                    if (seat.status === 'available') {
                      onSelectSeat(seat);
                    }
                  }}
                >
                  <span className="font-medium text-sm">{seat.number}</span>
                </div>
              );
            })}
          </div>
          
          {tilted && (
            <div 
              className={`
                absolute right-0 h-28 w-16 border-2 rounded-sm cursor-pointer flex items-center justify-center transition-all transform rotate-90 translate-y-[-32px] translate-x-4
                ${tilted.status === 'available' ? 'bg-white border-far-gray hover:border-far-cream' : ''}
                ${tilted.status === 'booked' ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                ${tilted.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                ${selectedSeats.some(s => s.id === tilted.id) ? 'bg-far-black border-far-black text-far-cream' : ''}
              `}
              onClick={() => {
                if (tilted.status === 'available') {
                  onSelectSeat(tilted);
                }
              }}
            >
              <span className="font-medium text-sm transform -rotate-90">{tilted.number}</span>
            </div>
          )}
        </div>
      );
    } else if (layout.includes("sleeper-seater")) {
      // Render mixed sleeper-seater layout
      const sleeperSeats = deckSeats.filter(seat => seat.type === "Sleeper");
      const seaterSeats = deckSeats.filter(seat => seat.type === "Seater");
      
      return (
        <div>
          {sleeperSeats.length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-medium mb-2">Sleeper Berths</h5>
              <div className="grid grid-cols-6 gap-2">
                {sleeperSeats.map((seat) => {
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  const isBooked = seat.status === 'booked';
                  const isFemaleBooked = seat.status === 'female_booked';
                  
                  return (
                    <div
                      key={seat.id}
                      className={`
                        h-16 w-full border-2 rounded-sm cursor-pointer relative flex items-center justify-center transition-all
                        ${seat.status === 'available' ? 'bg-white border-far-gray hover:border-far-cream' : ''}
                        ${isBooked ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                        ${isFemaleBooked ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                        ${isSelected ? 'bg-far-black border-far-black text-far-cream' : ''}
                      `}
                      onClick={() => {
                        if (seat.status === 'available') {
                          onSelectSeat(seat);
                        }
                      }}
                    >
                      <span className="font-medium text-sm">{seat.number}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {seaterSeats.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-2">Seater Seats</h5>
              <div className="grid grid-cols-4 gap-2">
                {seaterSeats.map((seat) => {
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  const isBooked = seat.status === 'booked';
                  const isFemaleBooked = seat.status === 'female_booked';
                  
                  return (
                    <div
                      key={seat.id}
                      className={`
                        seat
                        ${seat.status === 'available' ? 'seat-available' : ''}
                        ${isBooked ? 'seat-booked' : ''}
                        ${isFemaleBooked ? 'seat-female' : ''}
                        ${isSelected ? 'seat-selected' : ''}
                      `}
                      onClick={() => {
                        if (seat.status === 'available') {
                          onSelectSeat(seat);
                        }
                      }}
                    >
                      {seat.number}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // Fallback to default layout
      return (
        <div className="grid grid-cols-3 gap-4">
          {deckSeats.map((seat) => (
            <div
              key={seat.id}
              className={`
                h-16 w-full border-2 rounded-sm cursor-pointer relative flex items-center justify-center transition-all
                ${seat.status === 'available' ? 'bg-white border-far-gray hover:border-far-cream' : ''}
                ${seat.status === 'booked' ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                ${seat.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                ${selectedSeats.some(s => s.id === seat.id) ? 'bg-far-black border-far-black text-far-cream' : ''}
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
    }
  };
  
  const renderSeaterLayout = (deckSeats: Seat[], layout: string) => {
    if (layout === "all-seater") {
      // Render all seater layout (3 rows of 12 + side seat)
      const regularSeats = deckSeats.filter(seat => seat.number !== "S");
      const sideSeat = deckSeats.find(seat => seat.number === "S");
      
      // Group seats by rows
      const rows: { [key: string]: Seat[] } = {};
      regularSeats.forEach(seat => {
        const rowNum = seat.number.charAt(0);
        if (!rows[rowNum]) rows[rowNum] = [];
        rows[rowNum].push(seat);
      });
      
      return (
        <div className="relative">
          {Object.entries(rows).map(([rowNum, rowSeats]) => (
            <div key={rowNum} className="grid grid-cols-12 gap-1 mb-4">
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.some(s => s.id === seat.id);
                const isBooked = seat.status === 'booked';
                const isFemaleBooked = seat.status === 'female_booked';
                const isSingle = seat.position === "single";
                
                return (
                  <div
                    key={seat.id}
                    className={`
                      seat ${isSingle ? 'col-span-2' : ''}
                      ${seat.status === 'available' ? 'seat-available' : ''}
                      ${isBooked ? 'seat-booked' : ''}
                      ${isFemaleBooked ? 'seat-female' : ''}
                      ${isSelected ? 'seat-selected' : ''}
                    `}
                    onClick={() => {
                      if (seat.status === 'available') {
                        onSelectSeat(seat);
                      }
                    }}
                  >
                    {seat.number}
                  </div>
                );
              })}
            </div>
          ))}
          
          {sideSeat && (
            <div 
              className={`
                absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 border-2 rounded-sm cursor-pointer flex items-center justify-center transition-all
                ${sideSeat.status === 'available' ? 'bg-white border-far-gray hover:border-far-cream' : ''}
                ${sideSeat.status === 'booked' ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                ${sideSeat.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                ${selectedSeats.some(s => s.id === sideSeat.id) ? 'bg-far-black border-far-black text-far-cream' : ''}
              `}
              onClick={() => {
                if (sideSeat.status === 'available') {
                  onSelectSeat(sideSeat);
                }
              }}
            >
              <span className="font-medium text-sm">{sideSeat.number}</span>
            </div>
          )}
        </div>
      );
    } else {
      // Fallback to default seater layout
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
  
  // Determine the layout from the first seat or default to "2+1"
  const layout = seats.length > 0 ? 
    seats[0].number.startsWith('L') || seats[0].number.startsWith('U') ? "2+1" : 
    seats.some(s => s.position === "tilted") ? "tilted-sleeper" :
    seats.some(s => s.type === "Seater") && seats.some(s => s.type === "Sleeper") ? "sleeper-seater" : 
    seats.every(s => s.type === "Seater") ? "all-seater" : "2+1"
    : "2+1";
  
  const renderSeats = (deckSeats: Seat[]) => {
    if (busType === "Sleeper" || (deckSeats.length > 0 && deckSeats[0].type === "Sleeper")) {
      return renderSleeperLayout(deckSeats, layout);
    } else {
      return renderSeaterLayout(deckSeats, layout);
    }
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
              <div className="h-5 w-5 bg-far-black mr-2"></div>
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
        <div className="mb-8">
          <h4 className="font-medium mb-4 flex items-center">
            <span className="bg-far-black/20 text-far-black text-xs px-2 py-1 rounded-md mr-2">Lower Deck</span>
          </h4>
          <div className="overflow-x-auto pb-2">
            {renderSeats(lowerDeckSeats)}
          </div>
        </div>
        
        {upperDeckSeats.length > 0 && (
          <div>
            <h4 className="font-medium mb-4 flex items-center">
              <span className="bg-far-black/10 text-far-black/80 text-xs px-2 py-1 rounded-md mr-2">Upper Deck</span>
            </h4>
            <div className="overflow-x-auto pb-2">
              {renderSeats(upperDeckSeats)}
            </div>
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
