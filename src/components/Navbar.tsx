
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Bus } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/public/lovable-uploads/567c0d7a-923f-4770-99f7-143d16d26b7b.png"
              alt="FAR Logo"
              className="h-12 w-auto"
            />
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium hover:text-far-green transition-colors">Search & Book</Link>
            <Link to="/manage" className="font-medium hover:text-far-green transition-colors">Manage Ticket</Link>
            <Link to="/print-ticket" className="font-medium hover:text-far-green transition-colors">Print Ticket</Link>
            <Link to="/track" className="font-medium hover:text-far-green transition-colors">Track Bus</Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-3">
            <div className="space-y-3">
              <Link 
                to="/"
                className="block font-medium hover:text-far-green py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Search & Book
              </Link>
              <Link 
                to="/manage"
                className="block font-medium hover:text-far-green py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Manage Ticket
              </Link>
              <Link 
                to="/print-ticket"
                className="block font-medium hover:text-far-green py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Print Ticket
              </Link>
              <Link 
                to="/track"
                className="block font-medium hover:text-far-green py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Bus
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
