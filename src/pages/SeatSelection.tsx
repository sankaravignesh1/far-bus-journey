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
      const bus = buses.find(b => b.id === busId);
      if (bus) {
        setCurrentBus(bus);
        const seats = generateSeatsForBusType(busId, bus.layout);
        console.log("Generated seats:", seats);
        setAvailableSeats(seats);
      }
      setLoading(false);
    }
  }, [busId]);
  
  const generateSeatsForBusType = (busId: string, busLayout: string): Seat[] => {
    switch (busLayout) {
      case "2+1-sleeper-seater":
        return generateSleeperSeaterLayout(busId);
      case "all-seater":
        return generateAllSeaterLayout(busId);
      case "seater-sleeper":
        return generateSeaterSleeperLayout(busId);
      default:
        return generateEnhancedBusLayout(busId);
    }
  };
  
  const generateEnhancedBusLayout = (busId: string): Seat[] => {
    const seats: Seat[] = [];
    const rows = 5;
    const seatsPerRow = 6;
    
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = `L${(row * seatsPerRow + col + 1).toString().padStart(2, '0')}`;
        
        let status: 'available' | 'booked' | 'female_booked' = 'available';
        const random = Math.random();
        if (random < 0.15) {
          status = 'booked';
        } else if (random < 0.25) {
          status = 'female_booked';
        }
        
        seats.push({
          id: `${busId}-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: col < seatsPerRow - 1 ? "double" : "single",
          deck: "lower"
        });
      }
    }
    
    for (let row = 3; row < 5; row++) {
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = `L${((row - 1) * seatsPerRow + col + 1).toString().padStart(2, '0')}`;
        
        let status: 'available' | 'booked' | 'female_booked' = 'available';
        const random = Math.random();
        if (random < 0.15) {
          status = 'booked';
        } else if (random < 0.25) {
          status = 'female_booked';
        }
        
        seats.push({
          id: `${busId}-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: col < seatsPerRow - 1 ? "double" : "single",
          deck: "lower"
        });
      }
    }
    
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = `U${(row * seatsPerRow + col + 1).toString().padStart(2, '0')}`;
        
        let status: 'available' | 'booked' | 'female_booked' = 'available';
        const random = Math.random();
        if (random < 0.15) {
          status = 'booked';
        } else if (random < 0.25) {
          status = 'female_booked';
        }
        
        seats.push({
          id: `${busId}-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: col < seatsPerRow - 1 ? "double" : "single",
          deck: "upper"
        });
      }
    }
    
    for (let row = 3; row < 5; row++) {
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = `U${((row - 1) * seatsPerRow + col + 1).toString().padStart(2, '0')}`;
        
        let status: 'available' | 'booked' | 'female_booked' = 'available';
        const random = Math.random();
        if (random < 0.15) {
          status = 'booked';
        } else if (random < 0.25) {
          status = 'female_booked';
        }
        
        seats.push({
          id: `${busId}-${seatNumber}`,
          number: seatNumber,
          type: "Sleeper",
          status: status,
          position: col < seatsPerRow - 1 ? "double" : "single",
          deck: "upper"
        });
      }
    }
    
    return seats;
  };
  
  const generateTwoDeckSleeperSeats = (busId: string): Seat[] => {
    const seats: Seat[] = [];
    const rows = 3;
    const cols = 6;
    const totalSeatsPerDeck = rows * cols;
    
    for (let i = 1; i <= totalSeatsPerDeck; i++) {
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
    
    for (let i = 1; i <= totalSeatsPerDeck; i++) {
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
  
  const generateSleeperSeaterLayout = (busId: string): Seat[] => {
    const seats: Seat[] = [];
    
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
        type: "Seater",
        status: status,
        position: "single",
        deck: "lower"
      });
    }
    
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
  
  const generateAllSeaterLayout = (busId: string): Seat[] => {
    const seats: Seat[] = [];
    
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
  
  const generateSeaterSleeperLayout = (busId: string): Seat[] => {
    const seats: Seat[] = [];
    
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
  
  const isAdjacentToFemaleBookedSeat = (seat: Seat): boolean => {
    const seatNum = seat.number;
    const deckPrefix = seatNum.substring(0, 1);
    const numPart = parseInt(seatNum.substring(1));
    
    let seatCol = 0;
    
    if (currentBus?.layout === "all-seater") {
      seatCol = (numPart - 1) % 12;
    } else if (currentBus?.layout === "2+1-sleeper-seater" || currentBus?.layout === "seater-sleeper") {
      const rowNum = Math.floor((numPart - 1) / 
        (numPart <= 24 ? 12 : 6));
      seatCol = rowNum < 2 ? (numPart - 1) % 12 : (numPart - 1) % 6;
    } else {
      const effectiveNum = numPart > 12 ? numPart - 6 : numPart;
      seatCol = (effectiveNum - 1) % 6;
    }
    
    const rowNum = Math.floor((numPart - 1) / 
      (currentBus?.layout === "all-seater" ? 12 : 
       (currentBus?.layout === "2+1-sleeper-seater" || currentBus?.layout === "seater-sleeper") ? 
       (numPart <= 24 ? 12 : 6) : 6));
    
    if (rowNum >= 2) {
      return false;
    }
    
    return availableSeats
      .filter(s => {
        if (s.status !== "female_booked" || s.deck !== seat.deck) {
          return false;
        }
        
        const femaleNum = s.number;
        const femaleDeckPrefix = femaleNum.substring(0, 1);
        const femaleNumPart = parseInt(femaleNum.substring(1));
        
        if (deckPrefix !== femaleDeckPrefix) {
          return false;
        }
        
        let femaleCol = 0;
        if (currentBus?.layout === "all-seater") {
          femaleCol = (femaleNumPart - 1) % 12;
        } else if (currentBus?.layout === "2+1-sleeper-seater" || currentBus?.layout === "seater-sleeper") {
          const femaleRow = Math.floor((femaleNumPart - 1) / 
            (femaleNumPart <= 24 ? 12 : 6));
          femaleCol = femaleRow < 2 ? (femaleNumPart - 1) % 12 : (femaleNumPart - 1) % 6;
        } else {
          const effectiveFemaleNum = femaleNumPart > 12 ? femaleNumPart - 6 : femaleNumPart;
          femaleCol = (effectiveFemaleNum - 1) % 6;
        }
        
        const femaleRow = Math.floor((femaleNumPart - 1) / 
          (currentBus?.layout === "all-seater" ? 12 : 
          (currentBus?.layout === "2+1-sleeper-seater" || currentBus?.layout === "seater-sleeper") ? 
          (femaleNumPart <= 24 ? 12 : 6) : 6));
        
        if (femaleRow >= 2) {
          return false;
        }
        
        return seatCol === femaleCol && rowNum < 2 && femaleRow < 2;
      }).length > 0;
  };
  
  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length < 6) {
      if (isAdjacentToFemaleBookedSeat(seat)) {
        toast({
          title: "Seating Restriction",
          description: "This seat can only be booked by a female passenger due to female passengers in the same column.",
          variant: "default",
        });
        
        const femaleRequiredSeat = { ...seat, requiresFemale: true };
        setSelectedSeats(prev => [...prev, femaleRequiredSeat]);
      } else {
        setSelectedSeats(prev => [...prev, seat]);
      }
    } else {
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
          <h1 className="text-2xl font-serif mb-4">{currentBus?.name}</h1>
          <div className="flex flex-wrap gap-3">
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">{currentBus?.type}</div>
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">
              {currentBus?.category === "Seater" && ["2+1-sleeper-seater", "seater-sleeper"].includes(currentBus?.layout || "") 
                ? "Seater + Sleeper" 
                : currentBus?.category}
            </div>
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">
              {currentBus?.departureTime} - {currentBus?.arrivalTime}
            </div>
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">{currentBus?.duration}</div>
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
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="mb-4 md:mb-0">
                    <p className="font-medium">Selected Seats: {selectedSeats.map(s => s.number).join(', ')}</p>
                    <p className="text-sm text-far-black/70">Total Fare: ₹{currentBus.fare * selectedSeats.length}</p>
                  </div>
                  <button 
                    className="btn-primary flex items-center justify-center w-full md:w-auto"
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
