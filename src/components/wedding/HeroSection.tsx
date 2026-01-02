import { motion } from "framer-motion";

const HeroSection = () => {
  const weddingDate = new Date("2026-05-30T15:00:00");
  
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Floating baby's breath decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Decorative lines */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-body">
            Vi gifter oss
          </p>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-foreground mb-4">
            Andreas
          </h1>
          
          <div className="flex items-center justify-center gap-4 my-6">
            <div className="w-16 h-px bg-primary/40" />
            <span className="text-2xl text-primary">&</span>
            <div className="w-16 h-px bg-primary/40" />
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-foreground mb-12">
            Rebecka
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="space-y-2"
          >
            <p className="text-xl md:text-2xl font-serif text-muted-foreground">
              30 maj 2026
            </p>
            <p className="text-base text-muted-foreground font-body">
              Lidingö, Stockholm
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-primary/50 rounded-full" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;