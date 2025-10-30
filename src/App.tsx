import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import { MatrixRain } from "@/components/MatrixRain";
import { WaitingPlayers } from "@/components/WaitingPlayers";
import { LeftChatSidebar } from "@/components/LeftChatSidebar";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Forum from "./pages/Forum";
import Arcade from "./pages/Arcade";
import Games from "./pages/Games";
import Account from "./pages/Account";
import Statistics from "./pages/Statistics";
import Transactions from "./pages/Transactions";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import War from "./pages/games/WarLobby";
import Chess from "./pages/games/Chess";
import ChessLobby from "./pages/games/ChessLobby";
import ChessMultiplayer from "./pages/games/ChessMultiplayer";
import WarMultiplayer from "./pages/games/WarMultiplayer";
import Connect4 from "./pages/games/Connect4Lobby";
import CoinToss from "./pages/games/CoinTossLobby";
import LuckyBlock from "./pages/games/LuckyBlockEnhanced";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <MatrixRain />
        <LeftChatSidebar />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/arcade" element={<ProtectedRoute><Arcade /></ProtectedRoute>} />
            <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/games/war" element={<ProtectedRoute><War /></ProtectedRoute>} />
            <Route path="/games/war/:matchId" element={<ProtectedRoute><WarMultiplayer /></ProtectedRoute>} />
            <Route path="/games/chess" element={<ProtectedRoute><ChessLobby /></ProtectedRoute>} />
            <Route path="/games/chess/:matchId" element={<ProtectedRoute><ChessMultiplayer /></ProtectedRoute>} />
            <Route path="/games/connect4" element={<ProtectedRoute><Connect4 /></ProtectedRoute>} />
            <Route path="/games/cointoss" element={<ProtectedRoute><CoinToss /></ProtectedRoute>} />
            <Route path="/games/luckyblock" element={<ProtectedRoute><LuckyBlock /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
