
import React from 'react';
import Layout from '../components/Layout';
import SearchForm from '../components/SearchForm';
import { Bus, Truck, Filter, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <Layout>
      <section className="bg-far-cream py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl font-serif mb-6">
                Your Journey, Our Responsibility
              </h1>
              <p className="text-lg mb-8 text-far-black/80">
                Search, book, and manage your intercity bus travel with ease. 
                Enjoy comfortable seating options, real-time tracking, and hassle-free booking.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#search" className="btn-primary">
                  Book Now
                </a>
                <Link to="/manage" className="btn-outline">
                  Manage Booking
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Bus Travel" 
                className="rounded-lg shadow-lg w-full h-64 md:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" id="search">
        <div className="container-custom">
          <SearchForm />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-serif mb-12 text-center">Why Choose FAR</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="mx-auto bg-far-cream p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Bus className="h-8 w-8 text-far-black" />
              </div>
              <h3 className="font-serif text-xl mb-2">Comfort & Safety</h3>
              <p className="text-far-black/70">
                Travel in comfort with spacious seating options and safety as our top priority
              </p>
            </div>
            <div className="card text-center">
              <div className="mx-auto bg-far-cream p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-far-black" />
              </div>
              <h3 className="font-serif text-xl mb-2">Live Tracking</h3>
              <p className="text-far-black/70">
                Track your bus in real-time to ensure you never miss your journey
              </p>
            </div>
            <div className="card text-center">
              <div className="mx-auto bg-far-cream p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-far-black" />
              </div>
              <h3 className="font-serif text-xl mb-2">Punctuality</h3>
              <p className="text-far-black/70">
                We value your time with on-time departures and arrivals
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
            <Link to="/manage" className="card hover:shadow-lg transition-shadow text-center py-8">
              <h3 className="font-serif text-xl mb-2">Manage Ticket</h3>
              <p className="text-far-black/70 text-sm">
                Cancel, reschedule, or check refund status
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
    </Layout>
  );
};

export default Index;
