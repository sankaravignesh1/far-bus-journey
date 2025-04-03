
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";

const PrintTicket = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pnr = queryParams.get('pnr');
  const mobile = queryParams.get('mobile');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  // If we don't have PNR or mobile in the URL, show the form
  const [pnrInput, setPnrInput] = useState(pnr || '');
  const [mobileInput, setMobileInput] = useState(mobile || '');

  const fetchTicket = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      if (pnrInput === '123456' && mobileInput === '9876543210') {
        setTicketData({
          pnr: pnrInput,
          passenger: 'John Doe',
          from: 'Chennai',
          to: 'Madurai',
          departureDate: '2025-04-10',
          departureTime: '10:00 AM',
          busType: 'AC Sleeper',
          seatNumber: 'A4',
          fare: '₹850'
        });
      } else {
        toast({
          title: "No ticket found",
          description: "We couldn't find any ticket with the provided details.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1000);
  };

  const printTicket = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Print Your Ticket</h1>
        
        {!ticketData ? (
          <div className="max-w-md mx-auto card">
            <form onSubmit={fetchTicket}>
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
                  {loading ? 'Fetching ticket...' : 'Fetch Ticket'}
                </Button>
              </div>
            </form>
            
            <div className="mt-8 text-sm text-gray-500">
              <p><strong>Note:</strong> For demo purposes, enter PNR: 123456 and Mobile: 9876543210</p>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto card print:shadow-none">
            <div className="border-b pb-4 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Ticket Details</h2>
              <Button onClick={printTicket} className="print:hidden">
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">PNR Number:</span>
                <span>{ticketData.pnr}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Passenger Name:</span>
                <span>{ticketData.passenger}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Journey:</span>
                <span>{ticketData.from} to {ticketData.to}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Date & Time:</span>
                <span>{ticketData.departureDate}, {ticketData.departureTime}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Bus Type:</span>
                <span>{ticketData.busType}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Seat Number:</span>
                <span>{ticketData.seatNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Fare:</span>
                <span>{ticketData.fare}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t text-center">
              <p className="text-sm text-gray-600">Thank you for traveling with FAR Bus Service!</p>
              <p className="text-xs text-gray-500 mt-1">This is an electronic copy of your ticket.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PrintTicket;
