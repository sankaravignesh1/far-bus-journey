
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bus } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const TrackBus = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pnr = queryParams.get('pnr');
  const mobile = queryParams.get('mobile');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  
  // If we don't have PNR or mobile in the URL, show the form
  const [pnrInput, setPnrInput] = useState(pnr || '');
  const [mobileInput, setMobileInput] = useState(mobile || '');

  const fetchTracking = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      if (pnrInput === '123456' && mobileInput === '9876543210') {
        setTrackingData({
          pnr: pnrInput,
          busOperator: 'FAR Travels',
          from: 'Chennai',
          to: 'Madurai',
          departureDate: '2025-04-10',
          departureTime: '10:00 AM',
          estimatedArrival: '3:30 PM',
          currentLocation: 'Trichy',
          lastUpdated: '10:45 AM',
          status: 'On Time',
          distance: '120 km',
          progress: 60,
        });
      } else {
        toast({
          title: "No tracking information found",
          description: "We couldn't find any bus with the provided details.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Track Bus</h1>
        
        {!trackingData ? (
          <div className="max-w-md mx-auto card">
            <form onSubmit={fetchTracking}>
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
                  {loading ? 'Fetching tracking info...' : 'Track Bus'}
                </Button>
              </div>
            </form>
            
            <div className="mt-8 text-sm text-gray-500">
              <p><strong>Note:</strong> For demo purposes, enter PNR: 123456 and Mobile: 9876543210</p>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto card">
            <div className="border-b pb-4 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Live Tracking</h2>
              <Button onClick={() => fetchTracking()} className="flex items-center gap-2">
                <Bus className="h-4 w-4" /> Refresh
              </Button>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{trackingData.from}</span>
                <span className="font-medium">{trackingData.to}</span>
              </div>
              
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div 
                  className="absolute top-0 left-0 h-2 bg-far-green rounded-full" 
                  style={{ width: `${trackingData.progress}%` }}
                ></div>
                <div 
                  className="absolute -top-1 h-4 w-4 bg-far-black rounded-full border-2 border-white" 
                  style={{ left: `${trackingData.progress}%`, transform: 'translateX(-50%)' }}
                ></div>
              </div>
              
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>{trackingData.departureTime}</span>
                <span>{trackingData.estimatedArrival}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Current Location:</span>
                <span>{trackingData.currentLocation}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={trackingData.status === 'On Time' ? 'text-green-600' : 'text-red-600'}>
                  {trackingData.status}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Distance to Destination:</span>
                <span>{trackingData.distance}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Last Updated:</span>
                <span>{trackingData.lastUpdated}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t">
              <h3 className="font-medium mb-2">Journey Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">PNR:</span> {trackingData.pnr}</p>
                <p><span className="font-medium">Bus Operator:</span> {trackingData.busOperator}</p>
                <p><span className="font-medium">Journey Date:</span> {trackingData.departureDate}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrackBus;
