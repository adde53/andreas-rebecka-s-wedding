import Navigation from "@/components/wedding/Navigation";
import HeroSection from "@/components/wedding/HeroSection";
import Countdown from "@/components/wedding/Countdown";
import WeddingDetails from "@/components/wedding/WeddingDetails";
import TravelInfo from "@/components/wedding/TravelInfo";
import GoodToKnow from "@/components/wedding/GoodToKnow";
import PhotoGallery from "@/components/wedding/PhotoGallery";
import Footer from "@/components/wedding/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <Countdown />
      <div id="details">
        <WeddingDetails />
      </div>
      <div id="travel">
        <TravelInfo />
      </div>
      <div id="info">
        <GoodToKnow />
      </div>
      <PhotoGallery />
      <Footer />
    </div>
  );
};

export default Index;