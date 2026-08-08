import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RepoDashboard from "./pages/RepoDashboard";
import AnalysisSearch from "./pages/AnalysisSearch";
import Placeholder from "./pages/Placeholder";
import Layout from "./components/layout/Layout";
import { ThemeProvider } from "./components/layout/ThemeProvider";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/r/:owner/:repo" element={<RepoDashboard />} />
            <Route path="/search" element={<AnalysisSearch />} />
            <Route path="/roadmap" element={<Placeholder title="RepoLens roadmap" description="AI Q&A, security scanning, duplicate code detection, and PR impact visualization are coming next." />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
