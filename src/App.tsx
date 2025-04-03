
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BusListing from "./pages/BusListing";
import SeatSelection from "./pages/SeatSelection";
import PrintTicket from "./pages/PrintTicket";
import CancelTicket from "./pages/CancelTicket";
import TrackBus from "./pages/TrackBus";
import DownloadTicket from "./pages/DownloadTicket";
import SendTicket from "./pages/SendTicket";
import RescheduleTicket from "./pages/RescheduleTicket";
import CheckRefund from "./pages/CheckRefund";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bus-listing" element={<BusListing />} />
          <Route path="/seat-selection/:busId" element={<SeatSelection />} />
          <Route path="/print-ticket" element={<PrintTicket />} />
          <Route path="/cancel-ticket" element={<CancelTicket />} />
          <Route path="/track" element={<TrackBus />} />
          <Route path="/download-ticket" element={<DownloadTicket />} />
          <Route path="/send-ticket" element={<SendTicket />} />
          <Route path="/reschedule-ticket" element={<RescheduleTicket />} />
          <Route path="/check-refund" element={<CheckRefund />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
