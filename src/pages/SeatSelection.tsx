import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SeatSelection from '../components/SeatSelection';
import PassengerForm from '../components/PassengerForm';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Seat, Bus } from '../types';
import { ArrowLeft, ArrowRight, Info, TicketCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { format, addHours, addDays, parseISO } from 'date-fns';
import { 
  BusService, 
  BoardingPointService, 
  DroppingPointService,
  SeatService,
  CancellationPolicyService,
  TravelPolicyService 
} from '../services/api';

const SeatSelectionPage = () => {
  const { busId } = useParams<{ busId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const journeyDate = queryParams.get('date') || '';
  
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [currentBus, setCurrentBus] = useState<Bus | null>(null);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [boardingPoints, setBoardingPoints] = useState<any[]>([]);
  const [droppingPoints, setDroppingPoints] = useState<any[]>([]);
  const [cancellationPolicy, setCancellationPolicy] = useState<any>(null);
  const [travelPolicies, setTravelPolicies] = useState<any[]>([]);
  const [maxLowerRow, setMaxLowerRow] = useState(0);
  const [maxLowerColumn, setMaxLowerColumn] = useState(0);
  const [maxUpperRow, setMaxUpperRow] = useState(0);
  const [maxUpperColumn, setMaxUpperColumn] = useState(0);
  
  useEffect(() => {
    if (busId && journeyDate) {
      fetchBusDetails();
    }
  }, [busId, journeyDate]);

  const fetchBusDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch bus details
      const busDetails = await BusService.getBusDetails(busId!, journeyDate);
      console.log('Bus details:', busDetails);
      
      if (!busDetails) {
        toast({
          title: "Error",
          description: "Bus not found",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Prepare the bus object with proper layout type conversion
      const bus: Bus = {
        id: busDetails.bus_id,
        name: busDetails.operator_name,
        type: busDetails.bus_type,
        category: busDetails.bus_category || '',
        departureTime: busDetails.departure_time ? busDetails.departure_time.substring(0, 5) : '00:00',
        arrivalTime: busDetails.arrival_time ? busDetails.arrival_time.substring(0, 5) : '00:00',
        duration: busDetails.duration || '',
        availableSeats: busDetails.available_seats || 0,
        singleSeats: busDetails.singleseats_available || 0,
        fare: busDetails.starting_fare,
        amenities: busDetails.amenities ? (typeof busDetails.amenities === 'string' ? JSON.parse(busDetails.amenities) : busDetails.amenities) : [],
        // Convert the layout string to one of the valid types
        
      };
      
      setCurrentBus(bus);
      
      // Set max rows and columns
      setMaxLowerRow(busDetails.max_lower_row || 5);
      setMaxLowerColumn(busDetails.max_lower_column || 12);
      setMaxUpperRow(busDetails.max_upper_row || 5);
      setMaxUpperColumn(busDetails.max_upper_column || 12);

      // Fetch seats layout
      const seatsData = await SeatService.getBusLayout(busId!, journeyDate);
      console.log('Seats data:', seatsData);
      
      if (seatsData && seatsData.length > 0) {
        const formattedSeats: Seat[] = seatsData.map((seat: any) => ({
          id: seat.seat_id,
          number: seat.seat_name,
          type: seat.seat_type,
          available: seat.available,
          is_ladies_seat: seat.is_ladies_seat || false,
          is_double_berth: seat.is_double_berth || false, 
          
          deck: seat.deck || "lower",
          x: seat.x,
          y: seat.y,
          z: seat.z,
          width: seat.width,
          height: seat.height,
          original_price: seat.original_price,
          discounted_price: seat.discounted_price,
          seat_res_type: seat.seat_res_type
        }));
        
        setAvailableSeats(formattedSeats);
      }



      // Fetch boarding points
      const bpData = await BoardingPointService.getBoardingPoints(busId!);
      console.log('Boarding points:', bpData);
      setBoardingPoints(bpData || []);
      
      // Fetch dropping points
      const dpData = await DroppingPointService.getDroppingPoints(busId!);
      console.log('Dropping points:', dpData);
      setDroppingPoints(dpData || []);
      
      // Fetch cancellation policy
      if (busDetails.operator_id) {
        const policyData = await CancellationPolicyService.getCancellationPolicy(busDetails.operator_id);
        console.log('Cancellation policy:', policyData);
        setCancellationPolicy(policyData || null);
      }
      
      // Fetch travel policies
      const travelPolicyData = await TravelPolicyService.getTravelPolicies();
      console.log('Travel policies:', travelPolicyData);
      setTravelPolicies(travelPolicyData || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bus details:', error);
      toast({
        title: "Error",
        description: "Failed to load bus details. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  
  const isAdjacentToFemaleBookedSeat = (seat: Seat): boolean => {
   if (seat.available && seat.seat_res_type === 'Reserved_for_female') {
    return true;
   }
   return seat.available && seat.is_ladies_seat;
  };


  
  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length < 6) {
      if (seat.available && seat.seat_res_type === 'Reserved_for_female') {
        const femaleRequiredSeat = { ...seat, requiresFemale: true };
        setSelectedSeats(prev => [...prev, femaleRequiredSeat]);
      } else if (seat.available && seat.seat_res_type === 'Reserved_for_male') {
        const maleRequiredSeat = { ...seat, requiresMale: true };
        setSelectedSeats(prev => [...prev, seat]);
      } else {
        setSelectedSeats(prev => [...prev, seat]);
      }
    } else {
      toast({
        title: "Selection Limit Reached",
        description: "You can select a maximum of 6 seats per booking",
        variant: "default",
      });
    }
  };
  
  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No Seats Selected",
        description: "Please select at least one seat to continue",
        variant: "default",
      });
      return;
    }
    setShowPassengerForm(true);
  };

  // Format cancellation policy times based on journey date and departure time
  const formatCancellationPolicyTime = (columnName: string) => {
    if (!currentBus || !journeyDate) return '';
    
    const departureDateTime = `${journeyDate}T${currentBus.departureTime}:00`;
    let date;
    
    try {
      date = parseISO(departureDateTime);
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Invalid date';
    }
    
    if (columnName === 'before_two_weeks') {
      return `Before ${format(addDays(date, -14), 'MMM d, h:mm a')}`;
    } else if (columnName === 'before_week') {
      return `Between ${format(addDays(date, -14), 'MMM d, h:mm a')} and ${format(addDays(date, -7), 'MMM d, h:mm a')}`;
    } else if (columnName === 'before_48hrs') {
      return `Between ${format(addDays(date, -7), 'MMM d, h:mm a')} and ${format(addHours(date, -48), 'MMM d, h:mm a')}`;
    } else if (columnName === 'before_24hrs') {
      return `Between ${format(addHours(date, -48), 'MMM d, h:mm a')} and ${format(addHours(date, -24), 'MMM d, h:mm a')}`;
    } else if (columnName === 'before_12hrs') {
      return `Between ${format(addHours(date, -24), 'MMM d, h:mm a')} and ${format(addHours(date, -12), 'MMM d, h:mm a')}`;
    } else if (columnName === 'before_6hrs') {
      return `Between ${format(addHours(date, -12), 'MMM d, h:mm a')} and ${format(addHours(date, -6), 'MMM d, h:mm a')}`;
    } else if (columnName === 'lessthan_6hrs') {
      return `Less than ${format(addHours(date, -6), 'MMM d, h:mm a')}`;
    }
    
    return columnName;
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <p>Loading bus details...</p>
        </div>
      </Layout>
    );
  }

  if (!currentBus) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <p>Bus not found. Please try again.</p>
          <button 
            onClick={() => navigate(-1)}
            className="btn-outline mt-4"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-far-black mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bus List
        </button>
        
        <div className="card mb-8">
          <h1 className="text-2xl font-serif mb-4">{currentBus?.name}</h1>
          <div className="flex flex-wrap gap-3">
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">{currentBus?.type}</div>
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">
              {currentBus?.category === "Seater" && ["2+1-sleeper-seater", "seater-sleeper"].includes(currentBus?.layout || "") 
                ? "Seater + Sleeper" 
                : currentBus?.category}
            </div>
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">
              {currentBus?.departureTime} - {currentBus?.arrivalTime}
            </div>
            <div className="px-2 py-1 bg-far-cream text-far-black/70 text-sm rounded">{currentBus?.duration}</div>
          </div>
        </div>
        
        {!showPassengerForm ? (
          <div>
            <SeatSelection
              seats={availableSeats}
              selectedSeats={selectedSeats}
              onSelectSeat={handleSeatSelect}
              busType={currentBus?.category || ''}
              busLayout={currentBus?.layout || '2+1'}
              maxLowerRow={maxLowerRow}
              maxLowerColumn={maxLowerColumn}
              maxUpperRow={maxUpperRow}
              maxUpperColumn={maxUpperColumn}
            />
            
            {/* Amenities Section */}
            {currentBus && currentBus.amenities && currentBus.amenities.length > 0 && (
              <div className="card mt-6 p-4">
                <h3 className="font-medium mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {currentBus.amenities.map((amenity, index) => (
                    <div key={index} className="px-2 py-1 bg-far-cream text-far-black/70 text-xs rounded">
                      {String(amenity)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Boarding and Dropping Points */}
            <div className="mt-6 space-y-4">
              <Accordion type="single" collapsible className="bg-white border rounded-md">
                <AccordionItem value="boarding-points">
                  <AccordionTrigger className="px-4 py-3 hover:bg-far-cream/20">
                    <span className="text-sm font-medium">View Boarding Points</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {boardingPoints.length > 0 ? (
                        boardingPoints.map((bp, index) => (
                          <div key={index} className="border-b pb-2 last:border-0">
                            <div className="font-medium">{bp.b_point_name}</div>
                            {bp.b_address && <div className="text-sm text-gray-600">{bp.b_address}</div>}
                            {bp.b_landmark && <div className="text-sm text-gray-600">Landmark: {bp.b_landmark}</div>}
                            <div className="text-sm font-medium mt-1">
                              Boarding Time: {bp.b_time ? bp.b_time.substring(0, 5) : 'N/A'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm">No boarding points information available</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Accordion type="single" collapsible className="bg-white border rounded-md">
                <AccordionItem value="dropping-points">
                  <AccordionTrigger className="px-4 py-3 hover:bg-far-cream/20">
                    <span className="text-sm font-medium">View Dropping Points</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {droppingPoints.length > 0 ? (
                        droppingPoints.map((dp, index) => (
                          <div key={index} className="border-b pb-2 last:border-0">
                            <div className="font-medium">{dp.d_point_name}</div>
                            {dp.d_address && <div className="text-sm text-gray-600">{dp.d_address}</div>}
                            {dp.d_landmark && <div className="text-sm text-gray-600">Landmark: {dp.d_landmark}</div>}
                            <div className="text-sm font-medium mt-1">
                              Dropping Time: {dp.d_time ? dp.d_time.substring(0, 5) : 'N/A'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm">No dropping points information available</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Cancellation Policy */}
              <Accordion type="single" collapsible className="bg-white border rounded-md">
                <AccordionItem value="cancellation-policy">
                  <AccordionTrigger className="px-4 py-3 hover:bg-far-cream/20">
                    <span className="text-sm font-medium">Cancellation Policy</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {cancellationPolicy ? (
                      <div className="space-y-2">
                        {Object.entries(cancellationPolicy)
                          .filter(([key]) => !['id', 'created_at', 'updated_at', 'operator_id', 'operator_name'].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm py-1 border-b last:border-0">
                              <span>{formatCancellationPolicyTime(key)}</span>
                              <span className="font-medium">{String(value)}% refund</span>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <Info size={16} className="mr-2" />
                        <p>Cancellation policy not available for this operator.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Travel Policy */}
              <Accordion type="single" collapsible className="bg-white border rounded-md">
                <AccordionItem value="travel-policy">
                  <AccordionTrigger className="px-4 py-3 hover:bg-far-cream/20">
                    <span className="text-sm font-medium">Travel Policy</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {travelPolicies.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {travelPolicies.map((policy, index) => (
                          <li key={index} className="text-sm">{policy.policy_text}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm">No travel policies available</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            {selectedSeats.length > 0 && (
              <div className="bg-white border border-far-lightgray mt-6 p-4 rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="mb-4 md:mb-0">
                    <p className="font-medium">Selected Seats: {selectedSeats.map(s => s.number).join(', ')}</p>
                    <p className="text-sm text-far-black/70">Total Fare: ₹{selectedSeats.reduce((total, seat) => 
                      total + (seat.discounted_price || seat.original_price || currentBus.fare), 0)}</p>
                  </div>
                  <button 
                    className="btn-primary flex items-center justify-center w-full md:w-auto"
                    onClick={handleContinue}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <PassengerForm
              selectedSeats={selectedSeats}
              boardingPoints={boardingPoints || []}
              droppingPoints={droppingPoints || []}
              busId={busId!}
              journeyDate={journeyDate}
              fare={currentBus ? currentBus.fare : 0}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SeatSelectionPage;
