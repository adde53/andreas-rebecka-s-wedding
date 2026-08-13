import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Plane, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoGallery from "./PhotoGallery";
import HoneymoonSection from "./HoneymoonSection";
import PhotographerSection from "./PhotographerSection";

const PostWeddingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-sage/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cream/30 rounded-full blur-3xl" />
        
        {/* Baby's breath decorative dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <Heart className="w-12 h-12 mx-auto text-primary/60 mb-4" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-foreground mb-6"
          >
            Tack för att ni gjorde
            <br />
            <span className="text-primary">vår dag oförglömlig</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Vi är så tacksamma för varje skratt, kram och dans vi delade tillsammans. 
            Era minnen är ovärderliga för oss – dela gärna era bilder nedan!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="min-h-14 w-full max-w-sm sm:w-auto px-8 font-body text-base shadow-soft">
              <Link to="/photographer">
                <Camera className="w-5 h-5" />
                Fotografens bilder
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-14 w-full max-w-sm sm:w-auto px-8 font-body text-base shadow-soft">
              <Link to="/honeymoon">
                <Plane className="w-5 h-5" />
                Se bröllopsresan
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-4 text-muted-foreground"
          >
            <div className="h-px w-12 bg-primary/30" />
            <span className="font-serif text-xl font-semibold">30 maj 2026</span>
            <div className="h-px w-12 bg-primary/30" />
          </motion.div>
        </div>
      </section>

      {/* Photo Gallery */}
      <PhotoGallery />

      {/* Fotografens bilder */}
      <PhotographerSection />

      {/* Honeymoon */}
      <HoneymoonSection />

      {/* Simple Footer */}
      <footer className="py-12 bg-sage/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4"
          >
            <Heart className="w-6 h-6 text-primary/60" />
            <p className="font-serif text-lg text-muted-foreground">
              Med kärlek, Brudparet
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default PostWeddingPage;
