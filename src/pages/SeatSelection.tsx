
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SeatSelection from '../components/SeatSelection';
import PassengerForm from '../components/PassengerForm';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Seat, Bus } from '../types';
import { buses, boardingPoints, droppingPoints } from '../data/mockData';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const SeatSelectionPage = () => {
  const { busId } = useParams<{ busId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const journeyDate = queryParams.get('date') || '';
  
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [currentBus, setCurrentBus] = useState<Bus | null>(null);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (busId) {
      // Find the bus from our mock data
      const bus = buses.find(b => b.id === busId);
      if (bus) {
        setCurrentBus(bus);
        // Generate seats based on bus layout
        const seats = generateSeatsForBusType(busId, bus.layout);
        console.log("Generated seats:", seats);
        setAvailableSeats(seats);
      }
      setLoading(false);
    }
  }, [busId]);
  
  // Generate seats based on bus layout
  const generateSeatsForBusType = (busId: string, busLayout: string): Seat[] => {
    switch (busLayout) {
      case "2+1-sleeper-seater":
        return generateSleeperSeaterLayout(busId);
      case "all-seater":
        return generateAllSeaterLayout(busId);
      case "seater-sleeper":
        return generateSeaterSleeperLayout(busId);
      default:
        return generateTwoDeckSleeperSeats(busId);
    }
  };
  
  // Standard two-deck sleeper layout with 3x6 grid per deck
  const generateTwoDeckSleeperSeats = (busId: string): Seat[] => {
    const seats: Seat[] = [];
    const rows = 3;
    const cols = 6;
    const totalSeatsPerDeck = rows * cols;
    
    // Generate lower deck seats (L01 to L18)
    for (let i = 1; i <= totalSeatsPerDeck; i++) {
      const seatNumber = `L${i.toString().padStart(2, '0')}`;
      
      // Randomize some seats as booked or female_booked for demonstration
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.2) {
        status = 'booked';
      } else if (random < 0.3) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Sleeper",
        status: status,
        position: "double", // Default to double position
        deck: "lower"
      });
    }
    
    // Generate upper deck seats (U01 to U18)
    for (let i = 1; i <= totalSeatsPerDeck; i++) {
      const seatNumber = `U${i.toString().padStart(2, '0')}`;
      
      // Randomize some seats as booked or female_booked
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.2) {
        status = 'booked';
      } else if (random < 0.3) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Sleeper",
        status: status,
        position: "double", // Default to double position
        deck: "upper"
      });
    }
    
    return seats;
  };
  
  // Mixed sleeper-seater layout (2x6 + 1x12 in lower deck, standard in upper)
  const generateSleeperSeaterLayout = (busId: string): Seat[] => {
    const seats: Seat[] = [];
    
    // Generate lower deck: First 2 rows (2x6) sleeper, third row (1x12) seater
    
    // Row 1 and 2: 12 sleeper seats
    for (let i = 1; i <= 12; i++) {
      const seatNumber = `L${i.toString().padStart(2, '0')}`;
      
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.2) {
        status = 'booked';
      } else if (random < 0.3) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Sleeper",
        status: status,
        position: "double",
        deck: "lower"
      });
    }
    
    // Row 3: 12 seater seats
    for (let i = 13; i <= 24; i++) {
      const seatNumber = `L${i.toString().padStart(2, '0')}`;
      
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.2) {
        status = 'booked';
      } else if (random < 0.3) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Seater", // These are seater seats
        status: status,
        position: "single", // Seater position
        deck: "lower"
      });
    }
    
    // Upper deck: Standard 3x6 sleeper
    for (let i = 1; i <= 18; i++) {
      const seatNumber = `U${i.toString().padStart(2, '0')}`;
      
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.2) {
        status = 'booked';
      } else if (random < 0.3) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Sleeper",
        status: status,
        position: "double",
        deck: "upper"
      });
    }
    
    return seats;
  };
  
  // All seater layout (2x12 + 1x12 in lower deck, 3x6 sleeper in upper)
  const generateAllSeaterLayout = (busId: string): Seat[] => {
    const seats: Seat[] = [];
    
    // Lower deck: 3 rows of 12 seater seats (36 total)
    for (let i = 1; i <= 36; i++) {
      const seatNumber = `L${i.toString().padStart(2, '0')}`;
      
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.2) {
        status = 'booked';
      } else if (random < 0.3) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Seater",
        status: status,
        position: "single",
        deck: "lower"
      });
    }
    
    // Upper deck: Standard 3x6 sleeper
    for (let i = 1; i <= 18; i++) {
      const seatNumber = `U${i.toString().padStart(2, '0')}`;
      
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.2) {
        status = 'booked';
      } else if (random < 0.3) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Sleeper",
        status: status,
        position: "double",
        deck: "upper"
      });
    }
    
    return seats;
  };
  
  // Seater-sleeper layout (2x12 + 1x6 in lower deck, 3x6 sleeper in upper)
  const generateSeaterSleeperLayout = (busId: string): Seat[] => {
    const seats: Seat[] = [];
    
    // Lower deck: First 2 rows (2x12) seater, third row (1x6) sleeper
    
    // Row 1 and 2: 24 seater seats
    for (let i = 1; i <= 24; i++) {
      const seatNumber = `L${i.toString().padStart(2, '0')}`;
      
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.2) {
        status = 'booked';
      } else if (random < 0.3) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Seater",
        status: status,
        position: "single",
        deck: "lower"
      });
    }
    
    // Row 3: 6 sleeper seats
    for (let i = 25; i <= 30; i++) {
      const seatNumber = `L${i.toString().padStart(2, '0')}`;
      
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.2) {
        status = 'booked';
      } else if (random < 0.3) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Sleeper",
        status: status,
        position: "double",
        deck: "lower"
      });
    }
    
    // Upper deck: Standard 3x6 sleeper
    for (let i = 1; i <= 18; i++) {
      const seatNumber = `U${i.toString().padStart(2, '0')}`;
      
      let status: 'available' | 'booked' | 'female_booked' = 'available';
      const random = Math.random();
      if (random < 0.2) {
        status = 'booked';
      } else if (random < 0.3) {
        status = 'female_booked';
      }
      
      seats.push({
        id: `${busId}-${seatNumber}`,
        number: seatNumber,
        type: "Sleeper",
        status: status,
        position: "double",
        deck: "upper"
      });
    }
    
    return seats;
  };
  
  // Function to check if a seat is adjacent to a female booked seat
  const isAdjacentToFemaleBookedSeat = (seat: Seat): boolean => {
    // Only apply the female seat restriction to the first two rows
    const seatNum = seat.number;
    const deckPrefix = seatNum.substring(0, 1); // L or U
    const numPart = parseInt(seatNum.substring(1));
    
    // Determine row based on bus layout
    let rowNum = 0;
    if (currentBus?.layout === "all-seater") {
      rowNum = Math.floor((numPart - 1) / 12);
    } else if (currentBus?.layout === "2+1-sleeper-seater" || currentBus?.layout === "seater-sleeper") {
      rowNum = numPart <= 12 ? 0 : numPart <= 24 ? 1 : 2;
    } else {
      rowNum = Math.floor((numPart - 1) / 6);
    }
    
    // Only apply to rows 0 and 1 (first two rows)
    if (rowNum >= 2) {
      return false;
    }
    
    // Find seats in the same row and check if any adjacent seat is female booked
    return availableSeats
      .filter(s => s.status === "female_booked" && s.deck === seat.deck)
      .some(s => {
        const femaleNum = s.number;
        const femaleDeckPrefix = femaleNum.substring(0, 1);
        const femaleNumPart = parseInt(femaleNum.substring(1));
        
        // Make sure they're on the same deck
        if (deckPrefix !== femaleDeckPrefix) {
          return false;
        }
        
        // Get row and column for both seats
        let femaleRow = 0;
        let femaleCol = 0;
        let seatCol = 0;
        
        if (currentBus?.layout === "all-seater") {
          // For all-seater: 12 seats per row
          femaleRow = Math.floor((femaleNumPart - 1) / 12);
          femaleCol = (femaleNumPart - 1) % 12;
          seatCol = (numPart - 1) % 12;
        } else if (currentBus?.layout === "2+1-sleeper-seater" || currentBus?.layout === "seater-sleeper") {
          // For mixed layouts
          femaleRow = femaleNumPart <= 12 ? 0 : femaleNumPart <= 24 ? 1 : 2;
          femaleCol = femaleRow < 2 ? (femaleNumPart - 1) % 6 : (femaleNumPart - 1) % 12;
          seatCol = rowNum < 2 ? (numPart - 1) % 6 : (numPart - 1) % 12;
        } else {
          // Default 6 seats per row layout
          femaleRow = Math.floor((femaleNumPart - 1) / 6);
          femaleCol = (femaleNumPart - 1) % 6;
          seatCol = (numPart - 1) % 6;
        }
        
        // Check if they're in the same row and adjacent columns
        return rowNum === femaleRow && Math.abs(seatCol - femaleCol) === 1;
      });
  };
  
  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) {
      // If seat is already selected, unselect it
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length < 6) {
      // Check for female restriction on adjacent seats
      if (isAdjacentToFemaleBookedSeat(seat)) {
        toast({
          title: "Seating Restriction",
          description: "This seat can only be booked by a female passenger due to an adjacent female passenger.",
          variant: "default",
        });
        
        // Mark the seat for female passenger only
        const femaleRequiredSeat = { ...seat, requiresFemale: true };
        setSelectedSeats(prev => [...prev, femaleRequiredSeat]);
      } else {
        setSelectedSeats(prev => [...prev, seat]);
      }
    } else {
      // If we've reached the limit, show a toast notification
      toast({
        title: "Selection Limit Reached",
        description: "You can select a maximum of 6 seats per booking",
        variant: "default",
      });
    }
  };
  
  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No Seats Selected",
        description: "Please select at least one seat to continue",
        variant: "default",
      });
      return;
    }
    setShowPassengerForm(true);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <p>Loading bus details...</p>
        </div>
      </Layout>
    );
  }

  if (!currentBus) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <p>Bus not found. Please try again.</p>
          <button 
            onClick={() => navigate(-1)}
            className="btn-outline mt-4"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-far-black mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bus List
        </button>
        
        <div className="card mb-8">
          <h1 className="text-2xl font-serif mb-4">{currentBus.name}</h1>
          <div className="flex flex-wrap gap-3">
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">{currentBus.type}</div>
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">{currentBus.category}</div>
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">
              {currentBus.departureTime} - {currentBus.arrivalTime}
            </div>
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">{currentBus.duration}</div>
          </div>
        </div>
        
        {!showPassengerForm ? (
          <div>
            <SeatSelection
              seats={availableSeats}
              selectedSeats={selectedSeats}
              onSelectSeat={handleSeatSelect}
              busType={currentBus.category}
              busLayout={currentBus.layout}
            />
            
            {selectedSeats.length > 0 && (
              <div className="bg-white border border-far-lightgray mt-6 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Selected Seats: {selectedSeats.map(s => s.number).join(', ')}</p>
                    <p className="text-sm text-far-black/70">Total Fare: ₹{currentBus.fare * selectedSeats.length}</p>
                  </div>
                  <button 
                    className="btn-primary flex items-center"
                    onClick={handleContinue}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <PassengerForm
              selectedSeats={selectedSeats}
              boardingPoints={boardingPoints[busId!] || []}
              droppingPoints={droppingPoints[busId!] || []}
              busId={busId!}
              journeyDate={journeyDate}
              fare={currentBus.fare}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SeatSelectionPage;
