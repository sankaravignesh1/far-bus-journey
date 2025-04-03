
import React from 'react';
import Layout from '../components/Layout';
import SearchForm from '../components/SearchForm';
import { Link } from 'react-router-dom';
import { Bus, Globe, Ticket } from 'lucide-react';

const Index = () => {
  return <Layout>
      <section className="bg-far-cream py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl font-bold text-far-black mb-4">
                Book Bus Tickets Online
              </h1>
              <p className="text-lg mb-4 text-far-black/80">
                Find the best fares across hundreds of buses
              </p>
              
              {/* Discount Banner */}
              <div className="inline-block bg-far-green text-white px-4 py-2 rounded-md mb-6 transform -rotate-2 shadow-lg">
                <span className="font-bold">Flat 7.9% Off - Forever</span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <a href="#search" className="btn-primary">
                  Book Now
                </a>
                <Link to="/manage" className="btn-outline">
                  Manage Booking
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2 flex items-center justify-center">
              <div className="text-5xl md:text-7xl font-bold text-far-black transform rotate-[-5deg]" style={{
              textShadow: "3px 3px 0 #4a5d23, 6px 6px 0 rgba(0,0,0,0.2)",
              letterSpacing: "-1px"
            }}>
                7.9% <span className="block md:mt-2">FLAT DISCOUNT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" id="search">
        <div className="container-custom max-w-3xl">
          <SearchForm />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-serif mb-12 text-center">Why Choose FAR</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="mx-auto bg-far-cream p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-far-black" />
              </div>
              <h3 className="font-serif text-xl mb-2">Wide Selection</h3>
              <p className="text-far-black/70">
                Choose from hundreds of buses and routes for your perfect journey
              </p>
            </div>
            <div className="card text-center">
              <div className="mx-auto bg-far-cream p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Bus className="h-8 w-8 text-far-black" />
              </div>
              <h3 className="font-serif text-xl mb-2">Forever 7.9% Off</h3>
              <p className="text-far-black/70">
                Enjoy our permanent discount on all bookings, every time you travel
              </p>
            </div>
            <div className="card text-center">
              <div className="mx-auto bg-far-cream p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Ticket className="h-8 w-8 text-far-black" />
              </div>
              <h3 className="font-serif text-xl mb-2">Easy Management</h3>
              <p className="text-far-black/70">
                Simple tools to print, cancel, or reschedule your tickets anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-far-cream">
        <div className="container-custom">
          <h2 className="text-3xl font-serif mb-4 text-center">Quick Access</h2>
          <p className="text-center mb-12 text-far-black/70 max-w-2xl mx-auto">
            Manage your bookings with ease using our convenient services
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Link to="/cancel-ticket" className="card hover:shadow-lg transition-shadow text-center py-8">
              <h3 className="font-serif text-xl mb-2">Cancel Ticket</h3>
              <p className="text-far-black/70 text-sm">
                Cancel your booking and get a refund
              </p>
            </Link>
            <Link to="/print-ticket" className="card hover:shadow-lg transition-shadow text-center py-8">
              <h3 className="font-serif text-xl mb-2">Print Ticket</h3>
              <p className="text-far-black/70 text-sm">
                Download or print your ticket easily
              </p>
            </Link>
            <Link to="/track" className="card hover:shadow-lg transition-shadow text-center py-8">
              <h3 className="font-serif text-xl mb-2">Track Bus</h3>
              <p className="text-far-black/70 text-sm">
                Real-time tracking to ensure you board on time
              </p>
            </Link>
          </div>
        </div>
      </section>
    </Layout>;
};
export default Index;
