import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JackpotGame } from "@/components/games/JackpotGame";

const LuckyBlockEnhanced = () => {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        <JackpotGame />
      </div>
      <Footer />
    </>
  );
};

export default LuckyBlockEnhanced;

