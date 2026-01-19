import { useState, useEffect } from "react";
import Navigation from "@/components/wedding/Navigation";
import HeroSection from "@/components/wedding/HeroSection";
import Countdown from "@/components/wedding/Countdown";
import WeddingDetails from "@/components/wedding/WeddingDetails";
import TravelInfo from "@/components/wedding/TravelInfo";
import GoodToKnow from "@/components/wedding/GoodToKnow";
import PhotoGallery from "@/components/wedding/PhotoGallery";
import Footer from "@/components/wedding/Footer";
import PostWeddingPage from "@/components/wedding/PostWeddingPage";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showPostWedding, setShowPostWedding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWeddingStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("wedding_settings")
          .select("wedding_end_time")
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching wedding settings:", error);
          setShowPostWedding(false);
          return;
        }

        if (data?.wedding_end_time) {
          const endDate = new Date(data.wedding_end_time);
          setShowPostWedding(new Date() >= endDate);
        } else {
          setShowPostWedding(false);
        }
      } catch (err) {
        console.error("Error checking wedding status:", err);
        setShowPostWedding(false);
      }
    };

    checkWeddingStatus();
  }, []);

  // Show loading state while checking
  if (showPostWedding === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show post-wedding page if enabled
  if (showPostWedding) {
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