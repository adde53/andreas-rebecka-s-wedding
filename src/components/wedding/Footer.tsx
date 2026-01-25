import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="py-10 sm:py-16 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative dots */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-primary-foreground/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        <motion.div 
          className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <span className="font-serif text-2xl sm:text-3xl">A</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </motion.div>
          <span className="font-serif text-2xl sm:text-3xl">R</span>
        </motion.div>
        <p className="font-serif text-base sm:text-lg opacity-90 mb-1 sm:mb-2">
          Olsson Krantz
        </p>
        <p className="font-body text-xs sm:text-sm opacity-80">
          30 maj 2026 • Lidingö
        </p>
        <p className="font-body text-xs mt-4 sm:mt-6 opacity-60">
          Vi ses där! 💐
        </p>
      </div>
    </footer>
  );
};

export default Footer;