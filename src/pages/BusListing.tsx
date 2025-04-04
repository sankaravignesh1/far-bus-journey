
import React from 'react';
import Layout from '../components/Layout';
import SearchForm from '../components/SearchForm';
import BusList from '../components/BusList';
import { useLocation, useNavigate } from 'react-router-dom';
import { buses } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';

const BusListing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const fromCity = queryParams.get('from') || '';
  const toCity = queryParams.get('to') || '';
  const journeyDate = queryParams.get('date') || '';

  // In a real app, we would fetch buses based on the search criteria
  // For this demo, we'll just use all the mock buses

  return (
    <Layout>
      <div className="container-custom py-8">
        <button onClick={() => navigate('/')} className="flex items-center text-far-black mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </button>
        
        <div className="mb-8">
          <h1 className="text-2xl font-serif mb-2">
            {fromCity} to {toCity}
          </h1>
          <p className="text-far-black/70">
            {new Date(journeyDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 card h-fit p-4">
            <h3 className="text-lg font-serif mb-4">Advanced Filters</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Departure Time</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Morning (6AM - 12PM)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Afternoon (12PM - 6PM)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Evening (6PM - 12AM)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Night (12AM - 6AM)</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Bus Type</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">AC</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Non-AC</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Sleeper</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Seater</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Seat Features</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Single Seats Available</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Amenities</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">WiFi</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Charging Point</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Blanket</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Water Bottle</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <BusList buses={buses} journeyDate={journeyDate} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BusListing;
