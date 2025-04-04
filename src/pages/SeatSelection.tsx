
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SeatSelection from '../components/SeatSelection';
import PassengerForm from '../components/PassengerForm';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Seat, Bus } from '../types';
import { buses, generateSeats, boardingPoints, droppingPoints } from '../data/mockData';
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
  
  useEffect(() => {
    if (busId) {
      // Find the bus from our mock data
      const bus = buses.find(b => b.id === busId);
      if (bus) {
        setCurrentBus(bus);
        // Generate seats for this bus
        const seats = generateSeats(busId, bus.category, bus.layout);
        setAvailableSeats(seats);
      }
    }
  }, [busId]);
  
  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) {
      // If seat is already selected, unselect it
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length < 6) {
      // If seat is not selected and we haven't reached the limit, select it
      // Check for gender restriction on adjacent seats
      const isDoublePosition = seat.position === "double";
      const isFemaleRestricted = isDoublePosition && 
                                availableSeats
                                  .filter(s => s.status === "female_booked")
                                  .some(s => {
                                    // Check if this is an adjacent seat (based on seat number pattern)
                                    const seatNum = seat.number;
                                    const femaleNum = s.number;
                                    
                                    // For sleeper layouts, seats are typically numbered like L11, L12 where L11 and L12 are adjacent
                                    if (seatNum.length === 3 && femaleNum.length === 3) {
                                      const seatPrefix = seatNum.charAt(0);
                                      const femalePrefix = femaleNum.charAt(0);
                                      
                                      if (seatPrefix === femalePrefix) {
                                        const seatRow = seatNum.charAt(1);
                                        const femaleRow = femaleNum.charAt(1);
                                        
                                        if (seatRow === femaleRow) {
                                          const seatCol = parseInt(seatNum.charAt(2));
                                          const femaleCol = parseInt(femaleNum.charAt(2));
                                          
                                          return Math.abs(seatCol - femaleCol) === 1 && seatCol % 3 !== 0 && femaleCol % 3 !== 0;
                                        }
                                      }
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
  
  if (!currentBus) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <p>Loading...</p>
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
