
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
      // For sleeper seats: width 1, height 2 - horizontal orientation
      classes += 'w-[36px] h-[72px] '; 
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

  // Helper function to find the maximum X and Y values in a deck
  const findGridDimensions = (deckSeats: Seat[]) => {
    let maxX = 0;
    let maxY = 0;
    
    deckSeats.forEach(seat => {
      // Extract coordinates from seat number for demonstration
      // In real implementation, these would come from your backend
      const seatNum = seat.number;
      const numPart = parseInt(seatNum.substring(1));
      
      // Use X and Y based on bus layout
      let x = 0;
      let y = 0;
      
      if (busLayout === "2+1") {
        // Map according to CSV data
        if (numPart === 6) { x = 0; y = 0; }
        else if (numPart === 5) { x = 0; y = 1; }
        else if (numPart === 4) { x = 0; y = 3; }
        else if (numPart === 12) { x = 2; y = 0; }
        else if (numPart === 11) { x = 2; y = 1; }
        else if (numPart === 10) { x = 2; y = 3; }
        else if (numPart === 18) { x = 4; y = 0; }
        else if (numPart === 17) { x = 4; y = 1; }
        else if (numPart === 16) { x = 4; y = 3; }
        else if (numPart === 24) { x = 6; y = 0; }
        else if (numPart === 23) { x = 6; y = 1; }
        else if (numPart === 22) { x = 6; y = 3; }
        else if (numPart === 30) { x = 8; y = 0; }
        else if (numPart === 29) { x = 8; y = 1; }
        else if (numPart === 28) { x = 8; y = 3; }
        else if (numPart === 36) { x = 10; y = 0; }
        else if (numPart === 35) { x = 10; y = 1; }
        else if (numPart === 34) { x = 10; y = 3; }
      }
      
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    
    return { rows: maxY + 1, cols: maxX + 1 };
  };

  const renderBusLayout = (deckSeats: Seat[], deckType: 'upper' | 'lower') => {
    if (deckSeats.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          No seats available for this deck
        </div>
      );
    }

    // Create a grid based on the CSV data
    const grid: (Seat | null)[][] = [];
    const maxX = 10; // Based on the CSV data, max X coordinate is 10
    const maxY = 4;  // Based on the CSV data, max Y coordinate is 4
    
    // Initialize grid with null values
    for (let y = 0; y <= maxY; y++) {
      grid[y] = [];
      for (let x = 0; x <= maxX; x++) {
        grid[y][x] = null;
      }
    }
    
    // Map seats to the grid using the CSV coordinates
    deckSeats.forEach(seat => {
      const seatNum = seat.number;
      const numPart = parseInt(seatNum.substring(1));
      
      // Find X, Y coordinates from the CSV data
      let x = 0;
      let y = 0;
      
      // Using a mapping based on the CSV data
      // This is a simplified example - in production, you would get these from your data
      if (deckType === 'lower') {
        if (numPart === 6) { x = 0; y = 0; }
        else if (numPart === 5) { x = 0; y = 1; }
        else if (numPart === 4) { x = 0; y = 3; }
        else if (numPart === 12) { x = 2; y = 0; }
        else if (numPart === 11) { x = 2; y = 1; }
        else if (numPart === 10) { x = 2; y = 3; }
        else if (numPart === 18) { x = 4; y = 0; }
        else if (numPart === 17) { x = 4; y = 1; }
        else if (numPart === 16) { x = 4; y = 3; }
        else if (numPart === 24) { x = 6; y = 0; }
        else if (numPart === 23) { x = 6; y = 1; }
        else if (numPart === 22) { x = 6; y = 3; }
        else if (numPart === 30) { x = 8; y = 0; }
        else if (numPart === 29) { x = 8; y = 1; }
        else if (numPart === 28) { x = 8; y = 3; }
        else if (numPart === 36) { x = 10; y = 0; }
        else if (numPart === 35) { x = 10; y = 1; }
        else if (numPart === 34) { x = 10; y = 3; }
      } else { // Upper deck
        if (numPart === 1) { x = 0; y = 1; }
        else if (numPart === 2) { x = 0; y = 2; }
        else if (numPart === 3) { x = 0; y = 4; }
        else if (numPart === 7) { x = 2; y = 1; }
        else if (numPart === 8) { x = 2; y = 2; }
        else if (numPart === 9) { x = 2; y = 4; }
        else if (numPart === 13) { x = 4; y = 1; }
        else if (numPart === 14) { x = 4; y = 2; }
        else if (numPart === 15) { x = 4; y = 4; }
        else if (numPart === 19) { x = 6; y = 1; }
        else if (numPart === 20) { x = 6; y = 2; }
        else if (numPart === 21) { x = 6; y = 4; }
        else if (numPart === 25) { x = 8; y = 1; }
        else if (numPart === 26) { x = 8; y = 2; }
        else if (numPart === 27) { x = 8; y = 4; }
        else if (numPart === 31) { x = 10; y = 1; }
        else if (numPart === 32) { x = 10; y = 2; }
        else if (numPart === 33) { x = 10; y = 4; }
      }
      
      // Place seat in grid if coordinates are valid
      if (x >= 0 && x <= maxX && y >= 0 && y <= maxY) {
        grid[y][x] = seat;
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
              // Skip row index 2 which is the pathway
              rowIndex !== 2 && (
                <div key={`${deckType}-row-${rowIndex}`} className="flex my-2">
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
                      {!seat && (
                        <div className="w-[40px] h-[40px]"></div>
                      )}
                    </div>
                  ))}
                </div>
              )
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
