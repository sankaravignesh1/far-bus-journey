
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
    const seatMap = new Map(deckSeats.map(seat => [seat.number, seat]));
    
    if (deck === 'upper') {
      const row1Seats = ['DU1', 'DU3', 'DU5', 'DU7', 'DU9', 'DU11'].filter(num => 
        deckSeats.some(seat => seat.number === num)
      );
      
      const row2Seats = ['DU2', 'DU4', 'DU6', 'DU8', 'DU10', 'DU12'].filter(num => 
        deckSeats.some(seat => seat.number === num)
      );
      
      const row3Seats = ['SU1', 'SU2', 'SU3', 'SU4', 'SU5', 'SU6'].filter(num => 
        deckSeats.some(seat => seat.number === num)
      );
      
      return (
        <div className="mb-8">
          <div className="text-sm text-far-black/70 mb-2">Upper Deck</div>
          
          <div className="grid grid-cols-6 gap-1 mb-2">
            {['DU2', 'DU4', 'DU6', 'DU8', 'DU10', 'DU12'].map(num => {
              const actualSeat = seatMap.get(num);
              const isSelected = actualSeat && selectedSeats.some(s => s.id === actualSeat.id);
              const seatExists = deckSeats.some(s => s.number === num);
              
              if (!seatExists) {
                return <div key={`empty-${num}`} className="h-10 rounded-md flex items-center justify-center text-xs font-medium" />;
              }
              
              return (
                <div
                  key={num}
                  className={`
                    h-10 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!actualSeat ? 'opacity-0' : ''}
                    ${actualSeat?.status === 'available' ? 'bg-white border border-gray-300 hover:border-far-green' : ''}
                    ${actualSeat?.status === 'booked' ? 'bg-far-gray text-white cursor-not-allowed' : ''}
                    ${actualSeat?.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-green border-far-green text-white' : ''}
                  `}
                  onClick={() => {
                    if (actualSeat && actualSeat.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {num}
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-6 gap-1 mb-4">
            {['DU1', 'DU3', 'DU5', 'DU7', 'DU9', 'DU11'].map(num => {
              const actualSeat = seatMap.get(num);
              const isSelected = actualSeat && selectedSeats.some(s => s.id === actualSeat.id);
              const seatExists = deckSeats.some(s => s.number === num);
              
              if (!seatExists) {
                return <div key={`empty-${num}`} className="h-10 rounded-md flex items-center justify-center text-xs font-medium" />;
              }
              
              return (
                <div
                  key={num}
                  className={`
                    h-10 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!actualSeat ? 'opacity-0' : ''}
                    ${actualSeat?.status === 'available' ? 'bg-white border border-gray-300 hover:border-far-green' : ''}
                    ${actualSeat?.status === 'booked' ? 'bg-far-gray text-white cursor-not-allowed' : ''}
                    ${actualSeat?.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-green border-far-green text-white' : ''}
                  `}
                  onClick={() => {
                    if (actualSeat && actualSeat.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {num}
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-6 gap-1">
            {['SU1', 'SU2', 'SU3', 'SU4', 'SU5', 'SU6'].map(num => {
              const actualSeat = seatMap.get(num);
              const isSelected = actualSeat && selectedSeats.some(s => s.id === actualSeat.id);
              const seatExists = deckSeats.some(s => s.number === num);
              
              if (!seatExists) {
                return <div key={`empty-${num}`} className="h-10 rounded-md flex items-center justify-center text-xs font-medium" />;
              }
              
              return (
                <div
                  key={num}
                  className={`
                    h-10 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!actualSeat ? 'opacity-0' : ''}
                    ${actualSeat?.status === 'available' ? 'bg-white border border-gray-300 hover:border-far-green' : ''}
                    ${actualSeat?.status === 'booked' ? 'bg-far-gray text-white cursor-not-allowed' : ''}
                    ${actualSeat?.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-green border-far-green text-white' : ''}
                  `}
                  onClick={() => {
                    if (actualSeat && actualSeat.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {num}
                </div>
              );
            })}
          </div>
          
          <div className="w-12 h-1.5 bg-green-500 mt-2 rounded-sm"></div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="text-sm text-far-black/70 mb-2">Lower Deck</div>
          
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center mr-2">
              <span className="text-xs">👨‍✈️</span>
            </div>
          </div>
          
          <div className="grid grid-cols-6 gap-1 mb-2">
            {['DL2', 'DL4', 'DL6', 'DL8', 'DL10', 'DL12'].map(num => {
              const actualSeat = seatMap.get(num);
              const isSelected = actualSeat && selectedSeats.some(s => s.id === actualSeat.id);
              const seatExists = deckSeats.some(s => s.number === num);
              
              if (!seatExists) {
                return <div key={`empty-${num}`} className="h-10 rounded-md flex items-center justify-center text-xs font-medium" />;
              }
              
              return (
                <div
                  key={num}
                  className={`
                    h-10 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!actualSeat ? 'opacity-0' : ''}
                    ${actualSeat?.status === 'available' ? 'bg-white border border-gray-300 hover:border-far-green' : ''}
                    ${actualSeat?.status === 'booked' ? 'bg-far-gray text-white cursor-not-allowed' : ''}
                    ${actualSeat?.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-green border-far-green text-white' : ''}
                  `}
                  onClick={() => {
                    if (actualSeat && actualSeat.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {num}
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-6 gap-1 mb-4">
            {['DL1', 'DL3', 'DL5', 'DL7', 'DL9', 'DL11'].map(num => {
              const actualSeat = seatMap.get(num);
              const isSelected = actualSeat && selectedSeats.some(s => s.id === actualSeat.id);
              const seatExists = deckSeats.some(s => s.number === num);
              
              if (!seatExists) {
                return <div key={`empty-${num}`} className="h-10 rounded-md flex items-center justify-center text-xs font-medium" />;
              }
              
              return (
                <div
                  key={num}
                  className={`
                    h-10 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!actualSeat ? 'opacity-0' : ''}
                    ${actualSeat?.status === 'available' ? 'bg-white border border-gray-300 hover:border-far-green' : ''}
                    ${actualSeat?.status === 'booked' ? 'bg-far-gray text-white cursor-not-allowed' : ''}
                    ${actualSeat?.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-green border-far-green text-white' : ''}
                  `}
                  onClick={() => {
                    if (actualSeat && actualSeat.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {num}
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-6 gap-1">
            {['SL1', 'SL2', 'SL3', 'SL4', 'SL5', 'SL6'].map(num => {
              const actualSeat = seatMap.get(num);
              const isSelected = actualSeat && selectedSeats.some(s => s.id === actualSeat.id);
              const seatExists = deckSeats.some(s => s.number === num);
              
              if (!seatExists) {
                return <div key={`empty-${num}`} className="h-10 rounded-md flex items-center justify-center text-xs font-medium" />;
              }
              
              return (
                <div
                  key={num}
                  className={`
                    h-10 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer
                    ${!actualSeat ? 'opacity-0' : ''}
                    ${actualSeat?.status === 'available' ? 'bg-white border border-gray-300 hover:border-far-green' : ''}
                    ${actualSeat?.status === 'booked' ? 'bg-far-gray text-white cursor-not-allowed' : ''}
                    ${actualSeat?.status === 'female_booked' ? 'bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-far-green border-far-green text-white' : ''}
                  `}
                  onClick={() => {
                    if (actualSeat && actualSeat.status === 'available') {
                      onSelectSeat(actualSeat);
                    }
                  }}
                >
                  {num}
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
              ${seat.status === 'available' ? 'bg-white border-gray-300 hover:border-far-green' : ''}
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
