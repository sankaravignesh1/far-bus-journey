import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
const SendTicket = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pnr = queryParams.get('pnr');
  const mobile = queryParams.get('mobile');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [emailInput, setEmailInput] = useState('');
  const [mobileInput2, setMobileInput2] = useState('');

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
          departureTime: '10:00 AM'
        });
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
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock API call
    setTimeout(() => {
      toast({
        title: "Email sent",
        description: `Ticket has been sent to ${emailInput}`
      });
      setLoading(false);
    }, 1000);
  };
  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock API call
    setTimeout(() => {
      toast({
        title: "SMS sent",
        description: `Ticket has been sent to ${mobileInput2}`
      });
      setLoading(false);
    }, 1000);
  };
  return <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Send Ticket</h1>
        
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
            <h2 className="text-xl font-bold mb-4">Ticket Found</h2>
            
            <div className="bg-gray-50 p-4 mb-6 rounded-md">
              <p><span className="font-medium">PNR:</span> {ticketData.pnr}</p>
              <p><span className="font-medium">Passenger:</span> {ticketData.passenger}</p>
              <p><span className="font-medium">Journey:</span> {ticketData.from} to {ticketData.to}</p>
              <p><span className="font-medium">Date & Time:</span> {ticketData.departureDate}, {ticketData.departureTime}</p>
            </div>
            
            <div className="space-y-6">
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Send via Email</h3>
                <form onSubmit={handleSendEmail}>
                  <div className="flex items-center space-x-2">
                    <input type="email" placeholder="Enter email address" className="flex-1 p-2 border border-gray-300 rounded-md" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
                    <Button type="submit" disabled={loading || !emailInput}>
                      <Send className="h-4 w-4 mr-1" /> Email
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Send via SMS</h3>
                <form onSubmit={handleSendSMS}>
                  <div className="flex items-center space-x-2">
                    <input type="tel" placeholder="Enter mobile number" className="flex-1 p-2 border border-gray-300 rounded-md" value={mobileInput2} onChange={e => setMobileInput2(e.target.value)} required />
                    <Button type="submit" disabled={loading || !mobileInput2}>
                      <Send className="h-4 w-4 mr-1" /> SMS
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>}
      </div>
    </Layout>;
};
export default SendTicket;