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
    
    // Fixed dimensions that won't shrink on mobile
    if (seat.type === "Sleeper") {
      // Sleeper seats are same width but taller (height: 2 units)
      classes += 'w-[36px] h-[72px] '; 
    } else {
      // Seater seats are square (width: 1, height: 1)
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

  const renderExtendedBusLayout = (deckSeats: Seat[], deckType: 'upper' | 'lower') => {
    if (deckSeats.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          No seats available for this deck
        </div>
      );
    }

    // Create a 5-row by 12-column grid structure
    const rows = 5;
    const cols = 12;
    
    // Create an empty grid
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    // Map seats to the grid
    deckSeats.forEach(seat => {
      const seatNum = seat.number;
      const deckPrefix = seatNum.substring(0, 1);
      const numPart = parseInt(seatNum.substring(1));
      
      let rowIndex, colIndex;
      
      // Enhanced placement logic based on seat number
      if (numPart <= 12) {
        // First row
        rowIndex = 0;
        colIndex = numPart - 1;
      } else if (numPart <= 24) {
        // Second row
        rowIndex = 1;
        colIndex = numPart - 13;
      } else if (numPart <= 36) {
        // Fourth row (skip third row for pathway)
        rowIndex = 3;
        colIndex = numPart - 25;
      } else {
        // Fifth row
        rowIndex = 4;
        colIndex = numPart - 37;
      }
      
      // Place seat in grid (if valid position)
      if (rowIndex >= 0 && rowIndex < rows && colIndex >= 0 && colIndex < cols) {
        grid[rowIndex][colIndex] = seat;
      }
    });

    return (
      <div className="relative">
        {/* Bus direction indicators */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        {/* Scrollable seat layout container with horizontal scroll for mobile */}
        <div className="overflow-x-auto">
          <ScrollArea className="w-full">
            <div className="min-w-[600px] px-4">
              {grid.map((row, rowIndex) => (
                <React.Fragment key={`${deckType}-row-${rowIndex}`}>
                  {/* Skip rendering the third row (index 2) as it's the pathway */}
                  {rowIndex !== 2 ? (
                    <div className="flex my-1">
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
                              <span className="text-[6px] absolute bottom-1 opacity-60">
                                ({colIndex},{rowIndex},{deckType === 'lower' ? '0' : '1'})
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Empty space for pathway row - just add margin
                    <div className="h-8 my-2 flex items-center pl-4">
                      <div className="text-[10px] text-blue-600 font-medium">Pathway</div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  const renderDefaultDeck = (deckSeats: Seat[], deckType: 'upper' | 'lower') => {
    if (deckSeats.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          No seats available for this deck
        </div>
      );
    }

    // Standard 3x6 grid
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
      <div>
        {/* Bus direction indicators */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-1 sm:gap-2 mt-3 mx-auto max-w-md">
          {grid.map((row, rowIndex) => (
            <React.Fragment key={`${deckType}-row-${rowIndex}`}>
              {row.map((seat, colIndex) => (
                <div 
                  key={`${deckType}-${rowIndex}-${colIndex}`} 
                  className={`relative ${!seat ? 'opacity-0' : ''} ${
                    // Increased pathway between rows 2 and 3
                    rowIndex === 2 ? 'mt-16' : ''
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

  const renderMixedLowerDeck = (deckSeats: Seat[]) => {
    if (deckSeats.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          No seats available for this deck
        </div>
      );
    }

    // For 2+1-sleeper-seater: First two rows 2x6, third row 1x12
    // For this layout, we'll create a custom grid
    const firstTwoRows = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart <= 12; // First 12 seats (first 2 rows)
    });
    
    const thirdRow = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart > 12; // Seats 13-24 (third row)
    });

    return (
      <div>
        {/* Bus direction indicators */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        {/* First two rows - 2x6 grid - ensure consistent width on mobile */}
        <div className="grid grid-cols-6 gap-1 sm:gap-2 mx-auto max-w-md">
          {firstTwoRows.map((seat, index) => (
            <div 
              key={`lower-mixed-${index}`}
              className="relative"
            >
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
            </div>
          ))}
        </div>
        
        {/* Spacer - pathway - increased height */}
        <div className="h-16"></div>
        
        {/* Third row - 1x12 grid (seater format) - ensure equal cells on mobile */}
        <div className="grid grid-cols-12 gap-1 mx-auto max-w-md">
          {thirdRow.map((seat, index) => (
            <div 
              key={`lower-mixed-third-${index}`}
              className="relative"
            >
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
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAllSeaterLowerDeck = (deckSeats: Seat[]) => {
    if (deckSeats.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          No seats available for this deck
        </div>
      );
    }

    // For all-seater: 12 seats per row, all 3 rows
    const firstTwoRows = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart <= 24; // First 24 seats (first 2 rows)
    });
    
    const thirdRow = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart > 24; // Seats 25-36 (third row)
    });

    return (
      <div>
        {/* Bus direction indicators */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        {/* First two rows - 2x12 grid - ensure fixed width on mobile */}
        <div className="grid grid-cols-12 gap-1 mx-auto max-w-md">
          {firstTwoRows.map((seat, index) => (
            <div 
              key={`lower-seater-${index}`}
              className="relative"
            >
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
            </div>
          ))}
        </div>
        
        {/* Spacer - pathway - increased height */}
        <div className="h-16"></div>
        
        {/* Third row - 1x12 grid (also seater) - ensure equal cells on mobile */}
        <div className="grid grid-cols-12 gap-1 mx-auto max-w-md">
          {thirdRow.map((seat, index) => (
            <div 
              key={`lower-seater-third-${index}`}
              className="relative"
            >
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
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSeaterSleeperLowerDeck = (deckSeats: Seat[]) => {
    if (deckSeats.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          No seats available for this deck
        </div>
      );
    }

    // For seater-sleeper: First two rows 2x12, third row 1x6
    const firstTwoRows = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart <= 24; // First 24 seats (first 2 rows)
    });
    
    const thirdRow = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart > 24; // Seats 25-30 (third row has 6 seats)
    });

    return (
      <div>
        {/* Bus direction indicators */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        {/* First two rows - 2x12 grid - ensure fixed width on mobile */}
        <div className="grid grid-cols-12 gap-1 mx-auto max-w-md">
          {firstTwoRows.map((seat, index) => (
            <div 
              key={`lower-seatersleeper-${index}`}
              className="relative"
            >
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
            </div>
          ))}
        </div>
        
        {/* Spacer - pathway - increased height */}
        <div className="h-16"></div>
        
        {/* Third row - 1x6 grid - ensure equal cells on mobile */}
        <div className="grid grid-cols-6 gap-1 sm:gap-2 mx-auto max-w-md">
          {thirdRow.map((seat, index) => (
            <div 
              key={`lower-seatersleeper-third-${index}`}
              className="relative"
            >
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
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDeck = (deckSeats: Seat[], deckType: 'upper' | 'lower') => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-serif mb-2">
          {deckType === 'lower' ? 'Lower Deck' : 'Upper Deck'}
        </h3>
        
        {deckType === 'upper' ? (
          // Always use default layout for upper deck
          renderDefaultDeck(deckSeats, deckType)
        ) : (
          // For lower deck, layout depends on bus type
          busLayout === "2+1-sleeper-seater" ? 
            renderMixedLowerDeck(deckSeats) :
          busLayout === "all-seater" ?
            renderAllSeaterLowerDeck(deckSeats) :
          busLayout === "seater-sleeper" ?
            renderSeaterSleeperLowerDeck(deckSeats) :
            renderDefaultDeck(deckSeats, deckType)
        )}
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
        {/* Render Lower Deck first - matching the requirement */}
        <div className="mb-8">
          <h3 className="text-lg font-serif mb-2 flex items-center">
            <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full mr-2 flex items-center justify-center text-sm">L</div>
            Lower Deck
          </h3>
          {renderExtendedBusLayout(lowerDeckSeats, 'lower')}
        </div>
        
        {/* Clear separator between decks */}
        <Separator className="my-6 bg-gray-200 h-0.5" />
        
        {/* Render Upper Deck below */}
        <div className="mb-8">
          <h3 className="text-lg font-serif mb-2 flex items-center">
            <div className="w-6 h-6 bg-red-100 text-red-800 rounded-full mr-2 flex items-center justify-center text-sm">U</div>
            Upper Deck
          </h3>
          {renderExtendedBusLayout(upperDeckSeats, 'upper')}
        </div>
        
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
