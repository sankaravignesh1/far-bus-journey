
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";

interface Passenger {
  id: string;
  name: string;
  age: string;
  gender: string;
  seatNumber: string;
  selected: boolean;
}

interface BookingDetails {
  pnr: string;
  busOperator: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  passengers: Passenger[];
}

const CancelTicket = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pnr = queryParams.get('pnr');
  const mobile = queryParams.get('mobile');
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // If we don't have PNR or mobile in the URL, show the form
  const [pnrInput, setPnrInput] = useState(pnr || '');
  const [mobileInput, setMobileInput] = useState(mobile || '');

  const fetchBooking = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      if (pnrInput === '123456' && mobileInput === '9876543210') {
        setBookingDetails({
          pnr: pnrInput,
          busOperator: 'FAR Travels',
          from: 'Chennai',
          to: 'Madurai',
          departureDate: '2025-04-10',
          departureTime: '10:00 AM',
          passengers: [
            { id: '1', name: 'John Doe', age: '35', gender: 'Male', seatNumber: 'A1', selected: false },
            { id: '2', name: 'Jane Smith', age: '28', gender: 'Female', seatNumber: 'A2', selected: false },
            { id: '3', name: 'Tom Black', age: '42', gender: 'Male', seatNumber: 'B3', selected: false },
          ]
        });
      } else {
        toast({
          title: "No booking found",
          description: "We couldn't find any booking with the provided details.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1000);
  };

  const toggleSeatSelection = (passengerId: string) => {
    if (bookingDetails) {
      setBookingDetails({
        ...bookingDetails,
        passengers: bookingDetails.passengers.map(passenger => 
          passenger.id === passengerId 
            ? { ...passenger, selected: !passenger.selected } 
            : passenger
        )
      });
    }
  };

  const handleCancelTickets = () => {
    const selectedPassengers = bookingDetails?.passengers.filter(p => p.selected) || [];
    
    if (selectedPassengers.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select at least one seat to cancel.",
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmation(true);
  };

  const confirmCancellation = () => {
    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      const selectedSeats = bookingDetails?.passengers
        .filter(p => p.selected)
        .map(p => p.seatNumber)
        .join(', ');
      
      toast({
        title: "Cancellation successful",
        description: `Seats ${selectedSeats} have been cancelled. Refund will be processed within 7 days.`,
      });
      
      setLoading(false);
      setShowConfirmation(false);
      
      // Update booking details to remove cancelled passengers
      if (bookingDetails) {
        setBookingDetails({
          ...bookingDetails,
          passengers: bookingDetails.passengers.filter(p => !p.selected)
        });
      }
    }, 1500);
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Cancel Ticket</h1>
        
        {!bookingDetails ? (
          <div className="max-w-md mx-auto card">
            <form onSubmit={fetchBooking}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="pnr" className="block mb-2 text-sm font-medium">PNR Number</label>
                  <input
                    id="pnr"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter PNR Number"
                    value={pnrInput}
                    onChange={(e) => setPnrInput(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="mobile" className="block mb-2 text-sm font-medium">Mobile Number</label>
                  <input
                    id="mobile"
                    type="tel"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter Mobile Number"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-far-green hover:bg-far-green/90"
                  disabled={loading}
                >
                  {loading ? 'Fetching booking...' : 'Fetch Booking'}
                </Button>
              </div>
            </form>
            
            <div className="mt-8 text-sm text-gray-500">
              <p><strong>Note:</strong> For demo purposes, enter PNR: 123456 and Mobile: 9876543210</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto card">
            {showConfirmation ? (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-4">Confirm Cancellation</h2>
                <p className="mb-6">
                  Are you sure you want to cancel the selected seats? This action cannot be undone.
                </p>
                <div className="bg-gray-100 p-4 mb-6 rounded-md">
                  <h3 className="font-medium mb-2">Selected seats for cancellation:</h3>
                  <ul>
                    {bookingDetails.passengers
                      .filter(passenger => passenger.selected)
                      .map(passenger => (
                        <li key={passenger.id}>
                          {passenger.name} - Seat {passenger.seatNumber}
                        </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfirmation(false)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmCancellation}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Confirm Cancellation'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">Booking Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">PNR:</span> {bookingDetails.pnr}</p>
                      <p><span className="font-medium">Bus Operator:</span> {bookingDetails.busOperator}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Journey:</span> {bookingDetails.from} to {bookingDetails.to}</p>
                      <p><span className="font-medium">Date & Time:</span> {bookingDetails.departureDate}, {bookingDetails.departureTime}</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold mb-4">Select seats to cancel:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Select</th>
                        <th className="px-4 py-2 text-left">Passenger Name</th>
                        <th className="px-4 py-2 text-left">Age</th>
                        <th className="px-4 py-2 text-left">Gender</th>
                        <th className="px-4 py-2 text-left">Seat Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingDetails.passengers.map((passenger) => (
                        <tr key={passenger.id} className="border-b">
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={passenger.selected}
                              onChange={() => toggleSeatSelection(passenger.id)}
                              className="h-4 w-4"
                            />
                          </td>
                          <td className="px-4 py-2">{passenger.name}</td>
                          <td className="px-4 py-2">{passenger.age}</td>
                          <td className="px-4 py-2">{passenger.gender}</td>
                          <td className="px-4 py-2">{passenger.seatNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    onClick={handleCancelTickets} 
                    variant="destructive"
                    disabled={!bookingDetails.passengers.some(p => p.selected)}
                  >
                    Cancel Selected Seats
                  </Button>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p><strong>Note:</strong> Cancellation charges may apply based on the time remaining before departure.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CancelTicket;
