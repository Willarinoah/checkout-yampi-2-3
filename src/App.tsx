import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { initializeGTM } from "./lib/analytics";
import Index from "./pages/Index";
import CreateMemorial from "./pages/CreateMemorial";
import PreviewMemorial from "./pages/PreviewMemorial";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Inicializa o GTM
if (typeof window !== 'undefined') {
  initializeGTM();
}

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster position="top-center" />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreateMemorial />} />
              <Route path="/memorial/:slug" element={<PreviewMemorial />} />
              <Route path="/preview/:slug" element={<PreviewMemorial />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;