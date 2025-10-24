import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalStats } from "@/components/GlobalStats";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChainIndicator } from "@/components/ChainIndicator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ChainIndicator />
      <ChatSidebar />
      <GlobalStats />
      <Hero />
      <Footer />
    </div>
  );
};

export default Index;
