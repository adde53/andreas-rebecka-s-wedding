import Navigation from "@/components/wedding/Navigation";
import HeroSection from "@/components/wedding/HeroSection";
import Countdown from "@/components/wedding/Countdown";
import WeddingDetails from "@/components/wedding/WeddingDetails";
import TravelInfo from "@/components/wedding/TravelInfo";
import GoodToKnow from "@/components/wedding/GoodToKnow";
import PhotoGallery from "@/components/wedding/PhotoGallery";
import Footer from "@/components/wedding/Footer";
import PostWeddingPage from "@/components/wedding/PostWeddingPage";

// Wedding date: May 30, 2026
const WEDDING_DATE = new Date("2026-05-30T23:59:59");

const isAfterWedding = () => {
  return new Date() > WEDDING_DATE;
};

const Index = () => {
  // Show post-wedding page after the wedding day
  if (isAfterWedding()) {
    return <PostWeddingPage />;
  }

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