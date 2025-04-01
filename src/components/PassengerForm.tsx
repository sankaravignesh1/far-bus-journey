
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seat, BoardingPoint, DroppingPoint } from '../types';
import { Check } from 'lucide-react';

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
  const [contactEmail, setContactEmail] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<string>("");
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState<string>("");
  const [passengers, setPassengers] = useState<PassengerDetails[]>(
    selectedSeats.map(seat => ({
      seatId: seat.id,
      name: "",
      age: "",
      gender: "male",
    }))
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const handlePassengerChange = (seatId: string, field: keyof PassengerDetails, value: string) => {
    setPassengers(prev =>
      prev.map(p => {
        if (p.seatId === seatId) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would validate and submit the data to a backend API
    // For now, we'll just show a success message and navigate back to home
    
    alert("Booking successful! Your ticket has been emailed to you.");
    navigate("/");
  };
  
  const totalAmount = fare * selectedSeats.length;

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-xl font-serif mb-6">Passenger Details</h3>
          {selectedSeats.map((seat, index) => (
            <div key={seat.id} className="card mb-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Passenger {index + 1}</h4>
                <span className="text-sm bg-far-cream px-2 py-1 rounded">Seat {seat.number}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={passengers[index].name}
                    onChange={(e) => handlePassengerChange(seat.id, "name", e.target.value)}
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
                    value={passengers[index].age}
                    onChange={(e) => handlePassengerChange(seat.id, "age", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Gender</label>
                  <select
                    className="input-field w-full"
                    value={passengers[index].gender}
                    onChange={(e) => handlePassengerChange(
                      seat.id, 
                      "gender", 
                      e.target.value as "male" | "female"
                    )}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
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
              <span>Base Fare ({selectedSeats.length} seats)</span>
              <span>₹{fare} × {selectedSeats.length} = ₹{totalAmount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>GST</span>
              <span>Included</span>
            </div>
            <div className="border-t border-far-lightgray my-4"></div>
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-start space-x-2 mb-6">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1"
            required
          />
          <label htmlFor="terms" className="text-sm">
            I accept the <a href="#" className="text-far-green">terms and conditions</a> and <a href="#" className="text-far-green">cancellation policy</a>
          </label>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="btn-primary flex items-center"
            disabled={!acceptedTerms}
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
