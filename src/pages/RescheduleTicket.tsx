import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
const RescheduleTicket = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pnr = queryParams.get('pnr');
  const mobile = queryParams.get('mobile');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [newDate, setNewDate] = useState('');

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
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 7); // Mock date 7 days from now

        setTicketData({
          pnr: pnrInput,
          passenger: 'John Doe',
          from: 'Chennai',
          to: 'Madurai',
          departureDate: '2025-04-10',
          departureTime: '10:00 AM',
          busOperator: 'FAR Travels',
          busType: 'AC Sleeper',
          seatNumber: 'A4'
        });

        // Initialize new date with the current booking's date
        setNewDate('2025-04-10');
      } else {
        toast({
          title: "No ticket found",
          description: "We couldn't find any ticket with the provided details.",
          variant: "destructive"
        });
      }
      setLoading(false);
    }, 1000);
  };
  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      toast({
        title: "Date required",
        description: "Please select a new date for rescheduling.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      toast({
        title: "Ticket rescheduled",
        description: `Your ticket has been rescheduled to ${newDate}.`
      });

      // Update the ticket data with the new date
      setTicketData({
        ...ticketData,
        departureDate: newDate
      });
      setLoading(false);
    }, 1500);
  };
  const today = new Date().toISOString().split('T')[0];
  return <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Reschedule Ticket</h1>
        
        {!ticketData ? <div className="max-w-md mx-auto card">
            <form onSubmit={fetchTicket}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="pnr" className="block mb-2 text-sm font-medium">PNR Number</label>
                  <input id="pnr" type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter PNR Number" value={pnrInput} onChange={e => setPnrInput(e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="mobile" className="block mb-2 text-sm font-medium">Mobile Number</label>
                  <input id="mobile" type="tel" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter Mobile Number" value={mobileInput} onChange={e => setMobileInput(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-far-black">
                  {loading ? 'Fetching ticket...' : 'Find Ticket'}
                </Button>
              </div>
            </form>
            
            <div className="mt-8 text-sm text-gray-500">
              <p><strong>Note:</strong> For demo purposes, enter PNR: 123456 and Mobile: 9876543210</p>
            </div>
          </div> : <div className="max-w-md mx-auto card">
            <h2 className="text-xl font-bold mb-4">Current Booking Details</h2>
            
            <div className="bg-gray-50 p-4 mb-6 rounded-md">
              <p><span className="font-medium">PNR:</span> {ticketData.pnr}</p>
              <p><span className="font-medium">Passenger:</span> {ticketData.passenger}</p>
              <p><span className="font-medium">Journey:</span> {ticketData.from} to {ticketData.to}</p>
              <p><span className="font-medium">Current Date:</span> {ticketData.departureDate}</p>
              <p><span className="font-medium">Time:</span> {ticketData.departureTime}</p>
              <p><span className="font-medium">Bus Type:</span> {ticketData.busType}</p>
              <p><span className="font-medium">Seat:</span> {ticketData.seatNumber}</p>
            </div>
            
            <form onSubmit={handleReschedule}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newDate" className="block mb-2 font-medium">Select New Date</label>
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <div className="pl-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </div>
                    <input id="newDate" type="date" className="w-full p-2 border-0" min={today} value={newDate} onChange={e => setNewDate(e.target.value)} required />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={loading || !newDate}>
                    {loading ? 'Processing...' : 'Reschedule Ticket'}
                  </Button>
                </div>
              </div>
            </form>
            
            <div className="mt-6 text-sm text-gray-500">
              <p><strong>Note:</strong> Rescheduling charges may apply based on the time difference.</p>
            </div>
          </div>}
      </div>
    </Layout>;
};
export default RescheduleTicket;