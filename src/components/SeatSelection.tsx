
import React, { useState, useEffect } from 'react';
import { Seat } from '../types';
import { Info, HelpCircle, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
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
    
    // Base classes
    let classes = 'flex items-center justify-center text-xs font-medium cursor-pointer rounded-md ';
    
    // Fixed dimensions based on seat type
    if (seat.type === "Sleeper") {
      // For sleeper seats: width 1, height 2 - rotated 90 degrees
      classes += 'w-[72px] h-[36px] '; 
    } else {
      // For seater seats: width 1, height 1
      classes += 'w-[36px] h-[36px] '; 
    }
    
    // Add spacing between seats
    classes += 'mx-[2px] my-[2px] ';
    
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

  const renderBusLayout = (deckSeats: Seat[], deckType: 'upper' | 'lower') => {
    if (deckSeats.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          No seats available for this deck
        </div>
      );
    }

    // For 2+1 layout
    const rows = deckType === 'lower' ? 4 : 2;
    const cols = 12;
    
    // Create an empty grid
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    // Map seats to the grid
    deckSeats.forEach(seat => {
      const seatNum = seat.number;
      const numPart = parseInt(seatNum.substring(1));
      
      let rowIndex, colIndex;
      
      if (deckType === 'lower') {
        if (numPart <= 12) {
          // First row
          rowIndex = 0;
          colIndex = numPart - 1;
        } else if (numPart <= 24) {
          // Second row
          rowIndex = 1;
          colIndex = numPart - 13;
        } else if (numPart <= 36) {
          // Third row (after pathway)
          rowIndex = 3;
          colIndex = numPart - 25;
        }
      } else { // Upper deck
        if (numPart <= 12) {
          // First row of upper deck
          rowIndex = 0;
          colIndex = numPart - 1;
        } else if (numPart <= 18) {
          // Second row of upper deck
          rowIndex = 1;
          colIndex = numPart - 13;
        }
      }
      
      // Place seat in grid (if valid position)
      if (rowIndex !== undefined && colIndex !== undefined && 
          rowIndex >= 0 && rowIndex < rows && colIndex >= 0 && colIndex < cols) {
        grid[rowIndex][colIndex] = seat;
      }
    });

    return (
      <div className="relative mb-6">
        {/* Bus deck header with colored badge */}
        <div className="flex items-center mb-3">
          <div className={`w-8 h-8 ${deckType === 'lower' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'} rounded-full flex items-center justify-center text-lg font-medium mr-2`}>
            {deckType === 'lower' ? 'L' : 'U'}
          </div>
          <h3 className="text-lg font-serif">
            {deckType === 'lower' ? 'Lower Deck' : 'Upper Deck'}
          </h3>
        </div>
        
        {/* Direction indicators */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-3 py-1 rounded">
            Back
          </div>
        </div>
        
        {/* Scrollable seat layout */}
        <div className="overflow-x-auto">
          <div className="min-w-[650px] px-2">
            {grid.map((row, rowIndex) => (
              <React.Fragment key={`${deckType}-row-${rowIndex}`}>
                {/* Skip rendering pathways (row index 2) */}
                {rowIndex !== 2 ? (
                  <div className="flex my-2">
                    {row.map((seat, colIndex) => (
                      <div 
                        key={`${deckType}-${rowIndex}-${colIndex}`}
                        className="relative"
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
                  </div>
                ) : null}
              </React.Fragment>
            ))}
          </div>
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
              If a female passenger is seated in rows 1-2, the adjacent seats (same column) can only be booked by female passengers.
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white border border-far-lightgray rounded-lg p-4 sm:p-6">
        {/* Render Lower Deck first */}
        {renderBusLayout(lowerDeckSeats, 'lower')}
        
        {/* Clear separator between decks */}
        <Separator className="my-6 bg-gray-200 h-0.5" />
        
        {/* Render Upper Deck below */}
        {renderBusLayout(upperDeckSeats, 'upper')}
        
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
