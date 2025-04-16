import React, { useState, useEffect } from 'react';
import { Seat } from '../types';
import { Info, HelpCircle, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from '@/hooks/use-mobile';

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
    
    // Base classes - maintaining fixed size regardless of screen size
    let classes = 'flex items-center justify-center text-xs font-medium cursor-pointer rounded-md ';
    
    // Fixed size for all screen sizes
    if (seat.type === "Sleeper") {
      classes += 'w-12 h-12 min-w-[48px] min-h-[48px] '; // Fixed size for sleeper
    } else {
      classes += 'w-10 h-10 min-w-[40px] min-h-[40px] '; // Fixed size for seater
    }
    
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

  // Helper function to determine row from seat number
  const getRowFromSeatNumber = (seatNum: string) => {
    const deckPrefix = seatNum.substring(0, 1);
    const numPart = parseInt(seatNum.substring(1));
    
    // Enhanced layout with more rows
    if (busLayout === "all-seater") {
      // For all-seater: 12 seats per row
      return Math.floor((numPart - 1) / 12);
    } else if (busLayout === "2+1-sleeper-seater" || busLayout === "seater-sleeper") {
      // For mixed layouts
      if (numPart <= 12) return 0;
      else if (numPart <= 24) return 1;
      else return 2;
    } else {
      // Default 6 seats per row layout
      return Math.floor((numPart - 1) / 6);
    }
  };

  const renderExtendedBusLayout = (deckSeats: Seat[], deckType: 'upper' | 'lower') => {
    if (deckSeats.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          No seats available for this deck
        </div>
      );
    }

    // Enhanced 5x12 grid layout
    const rows = 5; // Maximum of 5 rows
    const cols = 12; // Maximum of 12 columns
    
    // Create an empty grid
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    // Map seats to the grid based on the predetermined pattern
    deckSeats.forEach(seat => {
      const seatNum = seat.number;
      const deckPrefix = deckType === 'lower' ? 'L' : 'U';
      
      if (seatNum.startsWith(deckPrefix)) {
        const numPart = parseInt(seatNum.substring(1));
        
        // Custom mapping based on the 2+1 layout
        // First row (0-based index): seats 1-6
        // Second row: seats 7-12
        // Third row: empty (pathway)
        // Fourth row: seats 13-18
        // Fifth row: seats 19-24
        
        let row = 0;
        let col = 0;
        
        if (numPart <= 6) {
          // First row
          row = 0;
          col = numPart - 1;
        } else if (numPart <= 12) {
          // Second row
          row = 1;
          col = numPart - 7;
        } else if (numPart <= 18) {
          // Fourth row (third is pathway)
          row = 3;
          col = numPart - 13;
        } else if (numPart <= 24) {
          // Fifth row
          row = 4;
          col = numPart - 19;
        }
        
        // For 2+1 layout, leave last three columns empty for single seats
        if (col < 9) {
          grid[row][col] = seat;
        } else if (col >= 9 && col < 12) {
          // Single seat area (for the "+1" in "2+1")
          grid[row][11] = seat; // Place in last column
        }
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
        
        {/* Scrollable seat layout container */}
        <ScrollArea className="h-auto max-h-[520px] w-full">
          <div className="grid grid-cols-12 gap-1 sm:gap-2 mt-3 mx-auto max-w-4xl min-w-[320px]">
            {grid.map((row, rowIndex) => (
              <React.Fragment key={`${deckType}-row-${rowIndex}`}>
                {/* Skip the third row (index 2) as it's the pathway */}
                {rowIndex === 2 ? (
                  // Pathway row - special styling
                  <React.Fragment>
                    {Array(12).fill(null).map((_, colIndex) => (
                      <div 
                        key={`${deckType}-pathway-${colIndex}`}
                        className="h-16 bg-blue-50 border border-dashed border-blue-200 rounded-md flex items-center justify-center col-span-1"
                      >
                        {colIndex === 5 && (
                          <span className="text-xs text-blue-600 font-medium">Pathway</span>
                        )}
                      </div>
                    ))}
                  </React.Fragment>
                ) : (
                  // Regular rows with seats
                  row.map((seat, colIndex) => (
                    <div 
                      key={`${deckType}-${rowIndex}-${colIndex}`}
                      className={`relative ${!seat ? 'opacity-0' : ''} col-span-1 ${
                        // Add spacing between seat columns
                        colIndex === 2 || colIndex === 5 || colIndex === 8 ? 'mr-2' : ''
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
                          <span className="text-[8px] opacity-70">
                            ({rowIndex},{colIndex},{deckType === 'lower' ? '0' : '1'})
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
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
        <h3 className="text-lg font-serif mb-2 bg-far-cream p-2 rounded-lg">
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
        
        {/* Scrollable container for seat layout */}
        <div className="relative overflow-x-auto">
          <ScrollArea className="h-auto w-full" orientation="horizontal">
            <div className="min-w-[600px]">
              {deckSeats.length === 0 ? (
                <div className="py-4 text-center text-gray-500">
                  No seats available for this deck
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-2 pb-4">
                  {deckSeats.map((seat) => {
                    // Calculate position based on X, Y coordinates
                    const X = parseInt(seat.number.substring(1)) % 12;
                    const Y = Math.floor(parseInt(seat.number.substring(1)) / 12);
                    
                    // 2+1 layout - every 3rd column is for single seats
                    const colSpan = seat.position === "single" ? 1 : 2;
                    const colStart = (X * colSpan) + 1;
                    
                    return (
                      <div
                        key={seat.id}
                        className={`col-start-${colStart} col-span-${colSpan} row-start-${Y+1} flex justify-center`}
                        style={{ 
                          gridColumn: `${colStart} / span ${colSpan}`,
                          gridRow: `${Y+1}`,
                          margin: '2px'
                        }}
                      >
                        <div
                          className={getSeatClasses(seat)}
                          onClick={() => {
                            if (seat.status === 'available') {
                              onSelectSeat(seat);
                            }
                          }}
                        >
                          {seat.number}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
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
        {/* Visually separate the decks with styling */}
        <div className="mb-8">
          {renderDeck(lowerDeckSeats, 'lower')}
        </div>
        
        <div className="border-t-2 border-far-cream pt-4">
          {renderDeck(upperDeckSeats, 'upper')}
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
