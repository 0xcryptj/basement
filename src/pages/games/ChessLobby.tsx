import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChainIndicator } from "@/components/ChainIndicator";
import { GameLobby } from "@/components/games/GameLobby";
import { WaitingPlayers } from "@/components/WaitingPlayers";
import { GameHistory } from "@/components/games/GameHistory";
import { useNavigate } from "react-router-dom";

const ChessLobby = () => {
  const navigate = useNavigate();

  const handleJoinGame = (matchId: string) => {
    navigate(`/games/chess/${matchId}`);
  };

  const handleSpectateGame = (matchId: string) => {
    navigate(`/games/chess/spectate/${matchId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <ChainIndicator />
      <ChatSidebar />
      <WaitingPlayers gameType="chess" />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:ml-[280px] transition-all duration-300">
        <div className="max-w-screen-xl mx-auto w-full space-y-8">
          <GameLobby
            gameType="chess"
            gameTitle="/CHESS/"
            gameDescription="Strategic board game • Winner takes 90%"
            onJoinGame={handleJoinGame}
            onSpectateGame={handleSpectateGame}
          />

          <GameHistory gameType="chess" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChessLobby;
