import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalStats } from "@/components/GlobalStats";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChainIndicator } from "@/components/ChainIndicator";
import { LiveGames } from "@/components/LiveGames";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <ChainIndicator />
      <ChatSidebar />
      <GlobalStats />
      <div className="flex-1">
        <div className="container mx-auto px-4 pt-20 ml-0 md:ml-[60px] transition-all duration-300">
          <div className="max-w-md mx-auto mb-8">
            <LiveGames />
          </div>
        </div>
        <Hero />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
