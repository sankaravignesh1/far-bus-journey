
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Seat, BoardingPoint, DroppingPoint, Passenger } from "@/types";

interface BookingContextType {
  // Search parameters
  fromCity: { id: string; name: string } | null;
  toCity: { id: string; name: string } | null;
  journeyDate: Date | null;
  
  // Selected bus details
  selectedBus: any | null;
  selectedSeats: Seat[];
  boardingPoint: BoardingPoint | null;
  droppingPoint: DroppingPoint | null;
  
  // Passenger details
  passengers: Passenger[];
  contactMobile: string;
  contactEmail: string;
  
  // Payment details
  baseTotal: number;
  gstAmount: number;
  discountAmount: number;
  totalFare: number;
  couponCode: string;
  couponDiscount: number;
  
  // Booking details
  bookingId: string | null;
  pnr: string | null;
  
  // Actions
  setFromCity: (city: { id: string; name: string } | null) => void;
  setToCity: (city: { id: string; name: string } | null) => void;
  setJourneyDate: (date: Date | null) => void;
  setSelectedBus: (bus: any | null) => void;
  setSelectedSeats: (seats: Seat[]) => void;
  addSeat: (seat: Seat) => void;
  removeSeat: (seatId: string) => void;
  setBoardingPoint: (point: BoardingPoint | null) => void;
  setDroppingPoint: (point: DroppingPoint | null) => void;
  setPassengers: (passengers: Passenger[]) => void;
  updatePassenger: (index: number, data: Partial<Passenger>) => void;
  setContactMobile: (mobile: string) => void;
  setContactEmail: (email: string) => void;
  setBaseTotal: (amount: number) => void;
  setGstAmount: (amount: number) => void;
  setDiscountAmount: (amount: number) => void;
  setTotalFare: (amount: number) => void;
  setCouponCode: (code: string) => void;
  setCouponDiscount: (amount: number) => void;
  setBookingId: (id: string | null) => void;
  setPnr: (pnr: string | null) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Search parameters
  const [fromCity, setFromCity] = useState<{ id: string; name: string } | null>(null);
  const [toCity, setToCity] = useState<{ id: string; name: string } | null>(null);
  const [journeyDate, setJourneyDate] = useState<Date | null>(null);
  
  // Selected bus details
  const [selectedBus, setSelectedBus] = useState<any | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [boardingPoint, setBoardingPoint] = useState<BoardingPoint | null>(null);
  const [droppingPoint, setDroppingPoint] = useState<DroppingPoint | null>(null);
  
  // Passenger details
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [contactMobile, setContactMobile] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  
  // Payment details
  const [baseTotal, setBaseTotal] = useState<number>(0);
  const [gstAmount, setGstAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [totalFare, setTotalFare] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  
  // Booking details
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [pnr, setPnr] = useState<string | null>(null);
  
  // Actions
  const addSeat = (seat: Seat) => {
    setSelectedSeats(prev => [...prev, seat]);
  };
  
  const removeSeat = (seatId: string) => {
    setSelectedSeats(prev => prev.filter(seat => seat.id !== seatId));
  };
  
  const updatePassenger = (index: number, data: Partial<Passenger>) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...data };
      return updated;
    });
  };
  
  const resetBooking = () => {
    setSelectedBus(null);
    setSelectedSeats([]);
    setBoardingPoint(null);
    setDroppingPoint(null);
    setPassengers([]);
    setContactMobile("");
    setContactEmail("");
    setBaseTotal(0);
    setGstAmount(0);
    setDiscountAmount(0);
    setTotalFare(0);
    setCouponCode("");
    setCouponDiscount(0);
    setBookingId(null);
    setPnr(null);
  };
  
  const value: BookingContextType = {
    fromCity,
    toCity,
    journeyDate,
    selectedBus,
    selectedSeats,
    boardingPoint,
    droppingPoint,
    passengers,
    contactMobile,
    contactEmail,
    baseTotal,
    gstAmount,
    discountAmount,
    totalFare,
    couponCode,
    couponDiscount,
    bookingId,
    pnr,
    setFromCity,
    setToCity,
    setJourneyDate,
    setSelectedBus,
    setSelectedSeats,
    addSeat,
    removeSeat,
    setBoardingPoint,
    setDroppingPoint,
    setPassengers,
    updatePassenger,
    setContactMobile,
    setContactEmail,
    setBaseTotal,
    setGstAmount,
    setDiscountAmount,
    setTotalFare,
    setCouponCode,
    setCouponDiscount,
    setBookingId,
    setPnr,
    resetBooking
  };
  
  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
