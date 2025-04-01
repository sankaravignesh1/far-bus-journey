
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
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-far-green mb-6"
        >
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-far-lightgray p-4 sticky top-4">
              <h3 className="text-lg font-medium mb-4">Modify Search</h3>
              <SearchForm />
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
