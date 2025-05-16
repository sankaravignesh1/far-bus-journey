import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seat, BoardingPoint, DroppingPoint } from '../types';
import { Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '../hooks/use-mobile';

interface PassengerFormProps {
  selectedSeats: Seat[];
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
  busId: string;
  journeyDate: string;
  fare: number;
}

interface PassengerDetails {
  seatId: string;
  name: string;
  age: string;
  gender: "male" | "female";
  seatNumber: string;
  requiresFemale?: boolean;
}

const PassengerForm: React.FC<PassengerFormProps> = ({
  selectedSeats,
  boardingPoints,
  droppingPoints,
  busId,
  journeyDate,
  fare,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [contactEmail, setContactEmail] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<string>("");
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState<string>("");
  const [passengers, setPassengers] = useState<PassengerDetails[]>(
    selectedSeats.map(seat => ({
      seatId: seat.id,
      name: "",
      age: "",
      gender: (seat as any).requiresFemale ? "female" : "male",
      seatNumber: seat.number,
      requiresFemale: (seat as any).requiresFemale
    }))
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const handlePassengerChange = (seatId: string, field: keyof PassengerDetails, value: string) => {
    setPassengers(prev =>
      prev.map(p => {
        if (p.seatId === seatId) {
          // Handle gender change for seats with female requirement
          if (field === "gender" && p.requiresFemale && value === "male") {
            toast({
              title: "Gender Restriction",
              description: `Seat ${p.seatNumber} can only be booked for a female passenger due to female passenger neighbour.`,
              variant: "destructive",
            });
            return p; // Don't update, keep as female
          }
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any passenger with female required seat is trying to book as male
    const invalidGenderAssignment = passengers.some(
      p => p.requiresFemale && p.gender === "male"
    );
    
    if (invalidGenderAssignment) {
      toast({
        title: "Gender Restriction",
        description: "Some seats can only be booked for female passengers due to female passenger neighbour.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would validate and submit the data to a backend API
    // For now, we'll just show a success message and navigate back to home
    
    toast({
      title: "Booking Successful",
      description: "Your ticket has been emailed to you.",
      variant: "default",
    });
    
    navigate("/");
  };
  
  // Calculate the total amount based on seat prices
  const totalAmount = selectedSeats.reduce((sum, seat) => {
    // First try to use the discounted price, then original price, then fallback to the base fare
    const seatPrice = seat.discounted_price || seat.original_price || seat.fare || fare;
    return sum + seatPrice;
  }, 0);

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-xl font-serif mb-6">Passenger Details</h3>
          {passengers.map((passenger, index) => (
            <div key={passenger.seatId} className="card mb-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Passenger {index + 1}</h4>
                <span className="text-sm bg-far-cream px-2 py-1 rounded flex items-center">
                  Seat {passenger.seatNumber}
                  {passenger.requiresFemale && (
                    <span className="ml-2 text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded">
                      Female only
                    </span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={passenger.name}
                    onChange={(e) => handlePassengerChange(passenger.seatId, "name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    className="input-field w-full"
                    value={passenger.age}
                    onChange={(e) => handlePassengerChange(passenger.seatId, "age", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Gender</label>
                  <select
                    className={`input-field w-full ${passenger.requiresFemale ? 'bg-pink-50' : ''}`}
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(
                      passenger.seatId, 
                      "gender", 
                      e.target.value as "male" | "female"
                    )}
                    required
                    disabled={passenger.requiresFemale}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {passenger.requiresFemale && (
                    <p className="text-xs text-pink-700 mt-1">
                      Due to female passenger neighbour, this seat can only be booked for a female passenger.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <h3 className="text-xl font-serif mb-6">Contact Details</h3>
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="input-field w-full"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Mobile Number</label>
                <input
                  type="tel"
                  className="input-field w-full"
                  value={contactMobile}
                  onChange={(e) => setContactMobile(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-serif mb-6">Boarding & Dropping Points</h3>
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-1">Boarding Point</label>
                <select
                  className="input-field w-full"
                  value={selectedBoardingPoint}
                  onChange={(e) => setSelectedBoardingPoint(e.target.value)}
                  required
                >
                  <option value="">Select Boarding Point</option>
                  {boardingPoints.map(point => (
                    <option key={point.id} value={point.id}>
                      {point.name} - {point.time}
                    </option>
                  ))}
                </select>
                {selectedBoardingPoint && (
                  <div className="mt-2 text-sm text-far-black/70">
                    {boardingPoints.find(p => p.id === selectedBoardingPoint)?.address}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm mb-1">Dropping Point</label>
                <select
                  className="input-field w-full"
                  value={selectedDroppingPoint}
                  onChange={(e) => setSelectedDroppingPoint(e.target.value)}
                  required
                >
                  <option value="">Select Dropping Point</option>
                  {droppingPoints.map(point => (
                    <option key={point.id} value={point.id}>
                      {point.name} - {point.time}
                    </option>
                  ))}
                </select>
                {selectedDroppingPoint && (
                  <div className="mt-2 text-sm text-far-black/70">
                    {droppingPoints.find(p => p.id === selectedDroppingPoint)?.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-serif mb-6">Fare Summary</h3>
          <div className="card">
            <div className="flex justify-between mb-2">
              <span>Total Base Fare ({selectedSeats.length} seats)</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>GST</span>
              <span>Excluded</span>
            </div>
            <div className="border-t border-far-lightgray my-4"></div>
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-center mb-6">
          By continuing, I agree to the <a href="#" className="text-far-green underline">terms and conditions</a>.  
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="btn-primary flex items-center"
          >
            <Check className="h-4 w-4 mr-2" />
            Proceed to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PassengerForm;
