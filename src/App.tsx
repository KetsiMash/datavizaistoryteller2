import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import { VoiceProvider } from "@/context/VoiceContext";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import UploadPage from "./pages/UploadPage";
import AnalysisPage from "./pages/AnalysisPage";
import DashboardPage from "./pages/DashboardPage";
import InsightsPage from "./pages/InsightsPage";
import StorytellingPage from "./pages/StorytellingPage";
import VoiceDemoPage from "./pages/VoiceDemoPage";
import VoiceManagementPage from "./pages/VoiceManagementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <VoiceProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/storytelling" element={<StorytellingPage />} />
                <Route path="/voice-demo" element={<VoiceDemoPage />} />
                <Route path="/voice-management" element={<VoiceManagementPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
            <VoiceAssistant />
          </BrowserRouter>
        </VoiceProvider>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
