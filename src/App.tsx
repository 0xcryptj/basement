import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Forum from "./pages/Forum";
import Arcade from "./pages/Arcade";
import War from "./pages/games/War";
import Chess from "./pages/games/Chess";
import Connect4 from "./pages/games/Connect4";
import CoinToss from "./pages/games/CoinToss";
import LuckyBlock from "./pages/games/LuckyBlock";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/arcade" element={<Arcade />} />
            <Route path="/games/war" element={<War />} />
            <Route path="/games/chess" element={<Chess />} />
            <Route path="/games/connect4" element={<Connect4 />} />
            <Route path="/games/cointoss" element={<CoinToss />} />
            <Route path="/games/luckyblock" element={<LuckyBlock />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
