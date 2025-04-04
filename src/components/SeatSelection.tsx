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
  
  const renderSleeperLayout = (deckSeats: Seat[], deck: 'upper' | 'lower') => {
    const seatNumbers = deckSeats.map(seat => seat.number);
    
    if (deck === 'upper') {
      const seatMap = new Map(deckSeats.map(seat => [seat.number, seat]));
      
      const row1Seats = ['DU1', 'DU3', 'DU5', 'DU7', 'DU9', 'DU11'].map(num => 
        seatMap.get(num) || {
          id: `placeholder-${num}`,
          number: num,
          status: 'available' as const
        }
      );
      
      const row2Seats = ['DU2', 'DU4', 'DU6', 'DU8', 'DU10', 'DU12'].map(num => 
        seatMap.get(num) || {
          id: `placeholder-${num}`,
          number: num,
          status: 'available' as const
        }
      );
      
      const row3Seats = ['SU1', 'SU2', 'SU3', 'SU4', 'SU5', 'SU6'].map(num => 
        seatMap.get(num) || {
          id: `placeholder-${num}`,
          number: num,
          status: 'available' as const
        }
      );
      
      return (
        <div className="mb-8">
          <div className="text-sm text-far-black/70 mb-2">Upper Deck</div>
          
          <div className="grid grid-cols-12 gap-1 mb-2">
            {row2Seats.map((seat, index) => {
              const actualSeat = seatMap.get(seat.number);
              if (!actualSeat && seat.id.includes('placeholder')) {
                return <div key={`empty-${index}`} className="col-span-2"></div>;
              }
              
              const isSelected = selectedSeats.some(s => s.id === actualSeat?.id);
              const isBooked = actualSeat?.status === 'booked';
              const isFemaleBooked = actualSeat?.status === 'female_booked';
              const isSingle = seat.number.startsWith('SU');
              const seatExists = deckSeats.some(s => s.number === seat.number);
              
              return (
                <div
                  key={seat.id}
                  className={`
                    col-span-2 h-10 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!seatExists ? 'opacity-0' : ''}
                    ${seatExists && actualSeat?.status === 'available' ? 'bg-[#00BCD4] text-white border border-[#0097A7]' : ''}
                    ${isBooked ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                    ${isFemaleBooked ? 'bg-[#F48FB1] border-[#EC407A] text-white cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-black border-far-black text-far-cream' : ''}
                  `}
                  onClick={() => {
                    if (seatExists && actualSeat?.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {seatExists ? seat.number : ''}
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-12 gap-1 mb-6">
            {row1Seats.map((seat, index) => {
              const actualSeat = seatMap.get(seat.number);
              if (!actualSeat && seat.id.includes('placeholder')) {
                return <div key={`empty-${index}`} className="col-span-2"></div>;
              }
              
              const isSelected = selectedSeats.some(s => s.id === actualSeat?.id);
              const isBooked = actualSeat?.status === 'booked';
              const isFemaleBooked = actualSeat?.status === 'female_booked';
              const isSingle = seat.number.startsWith('SU');
              const seatExists = deckSeats.some(s => s.number === seat.number);
              
              return (
                <div
                  key={seat.id}
                  className={`
                    col-span-2 h-10 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!seatExists ? 'opacity-0' : ''}
                    ${seatExists && actualSeat?.status === 'available' ? 'bg-[#00BCD4] text-white border border-[#0097A7]' : ''}
                    ${isBooked ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                    ${isFemaleBooked ? 'bg-[#F48FB1] border-[#EC407A] text-white cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-black border-far-black text-far-cream' : ''}
                  `}
                  onClick={() => {
                    if (seatExists && actualSeat?.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {seatExists ? seat.number : ''}
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-12 gap-1">
            {row3Seats.map((seat, index) => {
              const actualSeat = seatMap.get(seat.number);
              if (!actualSeat && seat.id.includes('placeholder')) {
                return <div key={`empty-${index}`} className="col-span-2"></div>;
              }
              
              const isSelected = selectedSeats.some(s => s.id === actualSeat?.id);
              const isBooked = actualSeat?.status === 'booked';
              const isFemaleBooked = actualSeat?.status === 'female_booked';
              const seatExists = deckSeats.some(s => s.number === seat.number);
              
              return (
                <div
                  key={seat.id}
                  className={`
                    col-span-2 h-10 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!seatExists ? 'opacity-0' : ''}
                    ${seatExists && actualSeat?.status === 'available' ? 'bg-[#00BCD4] text-white border border-[#0097A7]' : ''}
                    ${isBooked ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                    ${isFemaleBooked ? 'bg-[#F48FB1] border-[#EC407A] text-white cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-black border-far-black text-far-cream' : ''}
                  `}
                  onClick={() => {
                    if (seatExists && actualSeat?.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {seatExists ? seat.number : ''}
                </div>
              );
            })}
          </div>
          
          <div className="w-12 h-1.5 bg-green-500 mt-2 rounded-sm"></div>
        </div>
      );
    } else {
      const seatMap = new Map(deckSeats.map(seat => [seat.number, seat]));
      
      const row1Seats = ['DL1', 'DL3', 'DL5', 'DL7', 'DL9', 'DL11'].map(num => 
        seatMap.get(num) || {
          id: `placeholder-${num}`,
          number: num,
          status: 'available' as const
        }
      );
      
      const row2Seats = ['DL2', 'DL4', 'DL6', 'DL8', 'DL10', 'DL12'].map(num => 
        seatMap.get(num) || {
          id: `placeholder-${num}`,
          number: num,
          status: 'available' as const
        }
      );
      
      const row3Seats = ['SL1', 'SL2', 'SL3', 'SL4', 'SL5', 'SL6'].map(num => 
        seatMap.get(num) || {
          id: `placeholder-${num}`,
          number: num,
          status: 'available' as const
        }
      );
      
      return (
        <div>
          <div className="text-sm text-far-black/70 mb-2">Lower Deck</div>
          
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center mr-2">
              <span className="text-xs">👨‍✈️</span>
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-1 mb-2">
            {row2Seats.map((seat, index) => {
              const actualSeat = seatMap.get(seat.number);
              if (!actualSeat && seat.id.includes('placeholder')) {
                return <div key={`empty-${index}`} className="col-span-2"></div>;
              }
              
              const isSelected = selectedSeats.some(s => s.id === actualSeat?.id);
              const isBooked = actualSeat?.status === 'booked';
              const isFemaleBooked = actualSeat?.status === 'female_booked';
              const seatExists = deckSeats.some(s => s.number === seat.number);
              
              return (
                <div
                  key={seat.id}
                  className={`
                    col-span-2 h-10 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!seatExists ? 'opacity-0' : ''}
                    ${seatExists && actualSeat?.status === 'available' ? 'bg-[#00BCD4] text-white border border-[#0097A7]' : ''}
                    ${isBooked ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                    ${isFemaleBooked ? 'bg-[#F48FB1] border-[#EC407A] text-white cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-black border-far-black text-far-cream' : ''}
                  `}
                  onClick={() => {
                    if (seatExists && actualSeat?.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {seatExists ? seat.number : ''}
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-12 gap-1 mb-6">
            {row1Seats.map((seat, index) => {
              const actualSeat = seatMap.get(seat.number);
              if (!actualSeat && seat.id.includes('placeholder')) {
                return <div key={`empty-${index}`} className="col-span-2"></div>;
              }
              
              const isSelected = selectedSeats.some(s => s.id === actualSeat?.id);
              const isBooked = actualSeat?.status === 'booked';
              const isFemaleBooked = actualSeat?.status === 'female_booked';
              const seatExists = deckSeats.some(s => s.number === seat.number);
              
              return (
                <div
                  key={seat.id}
                  className={`
                    col-span-2 h-10 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!seatExists ? 'opacity-0' : ''}
                    ${seatExists && actualSeat?.status === 'available' ? 'bg-[#00BCD4] text-white border border-[#0097A7]' : ''}
                    ${isBooked ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                    ${isFemaleBooked ? 'bg-[#F48FB1] border-[#EC407A] text-white cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-black border-far-black text-far-cream' : ''}
                  `}
                  onClick={() => {
                    if (seatExists && actualSeat?.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {seatExists ? seat.number : ''}
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-12 gap-1">
            {row3Seats.map((seat, index) => {
              const actualSeat = seatMap.get(seat.number);
              if (!actualSeat && seat.id.includes('placeholder')) {
                return <div key={`empty-${index}`} className="col-span-2"></div>;
              }
              
              const isSelected = selectedSeats.some(s => s.id === actualSeat?.id);
              const isBooked = actualSeat?.status === 'booked';
              const isFemaleBooked = actualSeat?.status === 'female_booked';
              const seatExists = deckSeats.some(s => s.number === seat.number);
              
              return (
                <div
                  key={seat.id}
                  className={`
                    col-span-2 h-10 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!seatExists ? 'opacity-0' : ''}
                    ${seatExists && actualSeat?.status === 'available' ? 'bg-[#00BCD4] text-white border border-[#0097A7]' : ''}
                    ${isBooked ? 'bg-far-gray border-far-gray text-white cursor-not-allowed' : ''}
                    ${isFemaleBooked ? 'bg-[#F48FB1] border-[#EC407A] text-white cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-black border-far-black text-far-cream' : ''}
                  `}
                  onClick={() => {
                    if (seatExists && actualSeat?.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {seatExists ? seat.number : ''}
                </div>
              );
            })}
          </div>
          
          <div className="w-12 h-1.5 bg-green-500 mt-2 rounded-sm"></div>
        </div>
      );
    }
  };
  
  const renderSeaterLayout = (deckSeats: Seat[]) => {
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
              <div className="h-5 w-5 bg-[#00BCD4] border border-[#0097A7] mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 bg-far-gray mr-2"></div>
              <span className="text-sm">Booked</span>
            </div>
            <div className="flex items-center">
              <div className="h-5 w-5 bg-[#F48FB1] mr-2"></div>
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
        {upperDeckSeats.length > 0 && (
          <div className="mb-8">
            {renderSleeperLayout(upperDeckSeats, 'upper')}
          </div>
        )}
        
        {lowerDeckSeats.length > 0 && (
          <div>
            {busType === 'Sleeper' ? renderSleeperLayout(lowerDeckSeats, 'lower') : renderSeaterLayout(lowerDeckSeats)}
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
