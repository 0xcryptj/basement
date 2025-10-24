import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalStats } from "@/components/GlobalStats";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <GlobalStats />
      <Hero />
      <Footer />
    </div>
  );
};

export default Index;
