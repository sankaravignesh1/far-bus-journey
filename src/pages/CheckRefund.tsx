
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";

const CheckRefund = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pnr = queryParams.get('pnr');
  const mobile = queryParams.get('mobile');
  const [loading, setLoading] = useState(false);
  const [refundData, setRefundData] = useState<any>(null);
  
  // If we don't have PNR or mobile in the URL, show the form
  const [pnrInput, setPnrInput] = useState(pnr || '');
  const [mobileInput, setMobileInput] = useState(mobile || '');

  const fetchRefundStatus = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      if (pnrInput === '123456' && mobileInput === '9876543210') {
        setRefundData({
          pnr: pnrInput,
          cancellationDate: '2025-04-02',
          refundAmount: '₹750',
          originalAmount: '₹850',
          cancellationCharge: '₹100',
          status: 'Processed',
          estimatedCreditDate: '2025-04-05',
          paymentMethod: 'Credit Card (xxxx-xxxx-xxxx-1234)',
        });
      } else {
        toast({
          title: "No refund found",
          description: "We couldn't find any refund information with the provided details.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Check Refund Status</h1>
        
        {!refundData ? (
          <div className="max-w-md mx-auto card">
            <form onSubmit={fetchRefundStatus}>
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
                  {loading ? 'Checking status...' : 'Check Refund Status'}
                </Button>
              </div>
            </form>
            
            <div className="mt-8 text-sm text-gray-500">
              <p><strong>Note:</strong> For demo purposes, enter PNR: 123456 and Mobile: 9876543210</p>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Refund Status</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                refundData.status === 'Processed' ? 'bg-green-100 text-green-800' :
                refundData.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {refundData.status}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">PNR Number</span>
                <span>{refundData.pnr}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Cancellation Date</span>
                <span>{refundData.cancellationDate}</span>
              </div>
              
              <div className="border-t border-b py-4 my-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Original Amount</span>
                  <span>{refundData.originalAmount}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Cancellation Charge</span>
                  <span className="text-red-600">- {refundData.cancellationCharge}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Refund Amount</span>
                  <span className="font-bold text-green-600">{refundData.refundAmount}</span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Refund Method</span>
                <span>{refundData.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Estimated Credit Date</span>
                <span>{refundData.estimatedCreditDate}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-gray-600">
                For any queries regarding your refund, please contact our support at 1800-123-4567.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckRefund;
