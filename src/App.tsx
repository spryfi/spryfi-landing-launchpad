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
          <Route path="/loyalty-savings" element={<LoyaltySavings />} />
          <Route path="/loyalty-terms" element={<LoyaltyTerms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
