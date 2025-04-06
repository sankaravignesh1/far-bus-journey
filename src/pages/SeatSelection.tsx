
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SeatSelection from '../components/SeatSelection';
import PassengerForm from '../components/PassengerForm';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Seat, Bus } from '../types';
import { buses, boardingPoints, droppingPoints } from '../data/mockData';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const SeatSelectionPage = () => {
  const { busId } = useParams<{ busId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
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
        // Generate the new 3x6 grid for both decks
        const seats = generateTwoDeckSleeperSeats(busId);
        console.log("Generated seats:", seats);
        setAvailableSeats(seats);
      }
      setLoading(false);
    }
  }, [busId]);
  
  // Updated function to generate the 3x6 grid layout for both decks
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
  
  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) {
      // If seat is already selected, unselect it
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length < 6) {
      // If seat is not selected and we haven't reached the limit, select it
      // Check for gender restriction on adjacent seats
      const isFemaleRestricted = availableSeats
        .filter(s => s.status === "female_booked")
        .some(s => {
          // For our grid layout, we need to check if seats are adjacent
          const seatNum = seat.number;
          const femaleNum = s.number;
          
          // Check if they're on the same deck
          if (seatNum[0] === femaleNum[0]) {
            const seatIndex = parseInt(seatNum.substring(1));
            const femaleIndex = parseInt(femaleNum.substring(1));
            
            // Check if they're in the same row and adjacent columns
            // For a 6-column layout
            const seatRow = Math.floor((seatIndex - 1) / 6);
            const seatCol = (seatIndex - 1) % 6;
            const femaleRow = Math.floor((femaleIndex - 1) / 6);
            const femaleCol = (femaleIndex - 1) % 6;
            
            return seatRow === femaleRow && Math.abs(seatCol - femaleCol) === 1;
          }
          return false;
        });
      
      if (isFemaleRestricted) {
        alert("This seat can only be booked by a female passenger due to an adjacent female passenger.");
        return;
      }
      
      setSelectedSeats(prev => [...prev, seat]);
    } else {
      // If we've reached the limit, show an alert
      alert("You can select a maximum of 6 seats per booking");
    }
  };
  
  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to continue");
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
