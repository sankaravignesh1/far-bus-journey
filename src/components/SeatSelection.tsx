
import React, { useState, useEffect } from 'react';
import { Seat } from '../types';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SeatSelectionProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSelectSeat: (seat: Seat) => void;
  busType: string;
  busLayout: string;
  maxLowerRow: number;
  maxLowerColumn: number;
  maxUpperRow: number;
  maxUpperColumn: number;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ 
  seats, 
  selectedSeats, 
  onSelectSeat, 
  busType, 
  busLayout,
  maxLowerRow,
  maxLowerColumn,
  maxUpperRow,
  maxUpperColumn
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const seatSize = 40;
  const seatGap = 4;

  useEffect(() => {
    if (seats.length > 0) setIsLoading(false);
  }, [seats]);

  const getSeatStatus = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) return 'selected';
    return seat.status;
  };

  const getSeatStyle = (seat: Seat) => {
    const status = getSeatStatus(seat);
    let base = 'absolute flex items-center justify-center text-xs font-medium rounded-md cursor-pointer';
    let style = `${base}`;

    if (status === 'available') style += ' bg-white border border-gray-300 hover:border-far-green';
    else if (status === 'booked') style += ' bg-far-gray text-white cursor-not-allowed';
    else if (status === 'female_booked') style += ' bg-pink-200 border-pink-300 text-pink-800 cursor-not-allowed';
    else if (status === 'selected') style += ' bg-far-green text-white border-far-green';

    return style;
  };

  const renderGrid = (deck: 'lower' | 'upper', rows: number, cols: number) => {
    const filteredSeats = seats.filter(s => s.deck === deck);

    return (
      <div className="relative border rounded-md p-4 mb-8">
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            <ArrowRight size={16} className="mr-1" /> Front
          </div>
          <div className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">Back</div>
        </div>
        <ScrollArea className="w-full overflow-auto">
          <div style={{ 
            position: 'relative', 
            width: cols * (seatSize + seatGap), 
            height: rows * (seatSize + seatGap) 
          }}>
            {filteredSeats.map(seat => (
              <div
                key={seat.id}
                className={getSeatStyle(seat)}
                onClick={() => {
                  if (seat.status === 'available') onSelectSeat(seat);
                }}
                style={{
                  top: seat.x * (seatSize + seatGap),
                  left: seat.y * (seatSize + seatGap),
                  height: seat.height * seatSize + (seat.height - 1) * seatGap,
                  width: seat.width * seatSize + (seat.width - 1) * seatGap,
                }}
              >
                {seat.number}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  if (isLoading) return <div className="text-center py-10">Loading seats...</div>;

  return (
    <div className="space-y-4">
      {renderGrid('lower', maxLowerRow, maxLowerColumn)}
      {renderGrid('upper', maxUpperRow, maxUpperColumn)}
    </div>
  );
};

export default SeatSelection;
