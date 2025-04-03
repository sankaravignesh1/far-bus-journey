
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/lovable-uploads/ac7201ae-197c-46b6-9ff1-5805df5d326e.png"
              alt="FAR Logo"
              className="h-10 w-auto"
            />
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium hover:text-far-green transition-colors">Home</Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="font-medium hover:text-far-green transition-colors focus:outline-none">
                Manage Ticket
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white">
                <DropdownMenuItem asChild>
                  <Link to="/print-ticket" className="w-full">Print Ticket</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cancel-ticket" className="w-full">Cancel Ticket</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/track" className="w-full">Track Bus</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/download-ticket" className="w-full">Download Ticket</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/send-ticket" className="w-full">Send SMS / Email</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/reschedule-ticket" className="w-full">Reschedule Ticket</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/check-refund" className="w-full">Check Refund Status</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                Home
              </Link>
              <div className="block font-medium hover:text-far-green py-2">
                Manage Ticket
              </div>
              <div className="pl-4 space-y-2">
                <Link 
                  to="/print-ticket"
                  className="block text-sm hover:text-far-green py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Print Ticket
                </Link>
                <Link 
                  to="/cancel-ticket"
                  className="block text-sm hover:text-far-green py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cancel Ticket
                </Link>
                <Link 
                  to="/track"
                  className="block text-sm hover:text-far-green py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Track Bus
                </Link>
                <Link 
                  to="/download-ticket"
                  className="block text-sm hover:text-far-green py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Download Ticket
                </Link>
                <Link 
                  to="/send-ticket"
                  className="block text-sm hover:text-far-green py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Send SMS / Email
                </Link>
                <Link 
                  to="/reschedule-ticket"
                  className="block text-sm hover:text-far-green py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Reschedule Ticket
                </Link>
                <Link 
                  to="/check-refund"
                  className="block text-sm hover:text-far-green py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Check Refund Status
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
