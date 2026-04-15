import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { LoyaltySavings } from "./pages/LoyaltySavings";
import { LoyaltyTerms } from "./pages/LoyaltyTerms";
import NotFound from "./pages/NotFound";
import { AddressSuccess } from "./pages/AddressSuccess";
import { Plans } from "./pages/Plans";
import { RouterSetup } from "./pages/RouterSetup";
import Checkout from "./pages/Checkout";
import { SpryFiService } from "./pages/SpryFiService";
import { ServicePlans } from "./pages/ServicePlans";
import { NotServiceable } from "./pages/NotServiceable";
import { TechnicalDetails } from "./pages/TechnicalDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/address-success" element={<AddressSuccess />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/router-setup" element={<RouterSetup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/spryfi-service" element={<SpryFiService />} />
          <Route path="/service-plans" element={<ServicePlans />} />
          <Route path="/not-serviceable" element={<NotServiceable />} />
          <Route path="/loyalty-savings" element={<LoyaltySavings />} />
          <Route path="/loyalty-terms" element={<LoyaltyTerms />} />
          <Route path="/technical-details" element={<TechnicalDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
