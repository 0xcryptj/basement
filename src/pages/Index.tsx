import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChainIndicator } from "@/components/ChainIndicator";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <ChainIndicator />
      <ChatSidebar />
      <div className="flex-1">
        <Hero />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
