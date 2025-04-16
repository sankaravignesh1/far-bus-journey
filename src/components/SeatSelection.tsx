import React, { useState, useEffect } from 'react';
import { Seat } from '../types';
import { Info, HelpCircle, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
    
    let classes = 'flex items-center justify-center text-xs font-medium cursor-pointer rounded-md min-w-[32px] md:min-w-[36px] ';
    
    if (seat.type === "Sleeper") {
      classes += 'h-12 min-h-[48px] ';
    } else {
      classes += 'h-10 min-h-[40px] ';
    }
    
    const seatNum = seat.number;
    const row = getRowFromSeatNumber(seatNum);
    
    if ((busLayout === "2+1-sleeper-seater" || busLayout === "all-seater") && row === 2) {
      classes += 'w-full aspect-square ';
    } else {
      classes += 'w-full ';
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

  const getRowFromSeatNumber = (seatNum: string) => {
    const deckPrefix = seatNum.substring(0, 1);
    const numPart = parseInt(seatNum.substring(1));
    
    if (busLayout === "all-seater") {
      return Math.floor((numPart - 1) / 12);
    } else if (busLayout === "2+1-sleeper-seater" || busLayout === "seater-sleeper") {
      if (numPart <= 12) return 0;
      else if (numPart <= 24) return 1;
      else return 2;
    } else {
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

    const rows = 5;
    const cols = 12;
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    deckSeats.forEach(seat => {
      const seatNum = seat.number;
      const deckPrefix = deckType === 'lower' ? 'L' : 'U';
      
      if (seatNum.startsWith(deckPrefix)) {
        const numPart = parseInt(seatNum.substring(1));
        
        let row = 0;
        let col = 0;
        
        if (numPart <= 6) {
          row = 0;
          col = numPart - 1;
        } else if (numPart <= 12) {
          row = 1;
          col = numPart - 7;
        } else if (numPart <= 18) {
          row = 3;
          col = numPart - 13;
        } else if (numPart <= 24) {
          row = 4;
          col = numPart - 19;
        }
        
        if (col < 9) {
          grid[row][col] = seat;
        } else if (col >= 9 && col < 12) {
          grid[row][11] = seat;
        }
      }
    });

    return (
      <div className="relative">
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        <div className="overflow-auto pb-3">
          <ScrollArea className="h-auto max-h-[520px] w-full" orientation="horizontal">
            <div className="grid grid-cols-12 gap-1 sm:gap-2 mt-3 mx-auto max-w-4xl min-w-[800px]">
              {grid.map((row, rowIndex) => (
                <React.Fragment key={`${deckType}-row-${rowIndex}`}>
                  {rowIndex === 2 ? (
                    <React.Fragment>
                      {Array(12).fill(null).map((_, colIndex) => (
                        <div 
                          key={`${deckType}-pathway-${colIndex}`}
                          className="h-16 bg-blue-50 border border-dashed border-blue-200 rounded-md flex items-center justify-center col-span-1"
                        >
                          {colIndex === 5 && (
                            <span className="text-xs text-blue-600 font-medium opacity-0">Pathway</span>
                          )}
                        </div>
                      ))}
                    </React.Fragment>
                  ) : (
                    row.map((seat, colIndex) => (
                      <div 
                        key={`${deckType}-${rowIndex}-${colIndex}`}
                        className={`relative ${!seat ? 'opacity-0' : ''} col-span-1 ${
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

    const rows = 3;
    const cols = 6;
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    deckSeats.forEach(seat => {
      const seatNum = seat.number;
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
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        <div className="overflow-auto pb-3">
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="grid grid-cols-6 gap-1 sm:gap-2 mt-3 mx-auto max-w-md min-w-[600px]">
              {grid.map((row, rowIndex) => (
                <React.Fragment key={`${deckType}-row-${rowIndex}`}>
                  {row.map((seat, colIndex) => (
                    <div 
                      key={`${deckType}-${rowIndex}-${colIndex}`} 
                      className={`relative ${!seat ? 'opacity-0' : ''} ${
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
          </ScrollArea>
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

    const firstTwoRows = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart <= 12;
    });
    
    const thirdRow = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart > 12;
    });

    return (
      <div>
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        <div className="overflow-auto pb-3">
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="grid grid-cols-6 gap-1 sm:gap-2 mx-auto max-w-md min-w-[600px]">
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
          </ScrollArea>
        </div>
        
        <div className="h-16"></div>
        
        <div className="overflow-auto pb-3">
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="grid grid-cols-12 gap-1 mx-auto max-w-md min-w-[800px]">
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
          </ScrollArea>
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

    const firstTwoRows = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart <= 24;
    });
    
    const thirdRow = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart > 24;
    });

    return (
      <div>
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        <div className="overflow-auto pb-3">
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="grid grid-cols-12 gap-1 mx-auto max-w-md min-w-[800px]">
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
          </ScrollArea>
        </div>
        
        <div className="h-16"></div>
        
        <div className="overflow-auto pb-3">
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="grid grid-cols-12 gap-1 mx-auto max-w-md min-w-[800px]">
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
          </ScrollArea>
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

    const firstTwoRows = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart <= 24;
    });
    
    const thirdRow = deckSeats.filter(seat => {
      const numPart = parseInt(seat.number.substring(1));
      return numPart > 24;
    });

    return (
      <div>
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
            Back
          </div>
        </div>
        
        <div className="overflow-auto pb-3">
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="grid grid-cols-12 gap-1 mx-auto max-w-md min-w-[800px]">
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
          </ScrollArea>
        </div>
        
        <div className="h-16"></div>
        
        <div className="overflow-auto pb-3">
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="grid grid-cols-6 gap-1 sm:gap-2 mx-auto max-w-md min-w-[600px]">
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
          </ScrollArea>
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
          renderDefaultDeck(deckSeats, deckType)
        ) : (
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
        {renderDeck(lowerDeckSeats, 'lower')}
        
        <Separator className="my-6 bg-blue-100 h-[2px]" />
        
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
