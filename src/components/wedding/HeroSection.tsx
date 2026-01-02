import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Enhanced floating baby's breath decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              background: i % 3 === 0 
                ? 'radial-gradient(circle, hsl(var(--primary) / 0.4), transparent)' 
                : i % 3 === 1 
                ? 'radial-gradient(circle, hsl(var(--accent) / 0.6), transparent)'
                : 'radial-gradient(circle, hsl(var(--sage) / 0.5), transparent)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 10 - 5, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Decorative floral corner elements */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full text-primary">
          <path
            d="M0,100 Q50,50 100,0 Q50,50 0,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.5" />
          <circle cx="50" cy="20" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="20" cy="50" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="60" cy="40" r="4" fill="currentColor" opacity="0.3" />
          <circle cx="40" cy="60" r="3" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 opacity-20 rotate-90">
        <svg viewBox="0 0 200 200" className="w-full h-full text-sage">
          <path
            d="M0,100 Q50,50 100,0 Q50,50 0,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.5" />
          <circle cx="50" cy="20" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="20" cy="50" r="2" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20 -rotate-90">
        <svg viewBox="0 0 200 200" className="w-full h-full text-sage">
          <path
            d="M0,100 Q50,50 100,0 Q50,50 0,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.5" />
          <circle cx="50" cy="20" r="2" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20 rotate-180">
        <svg viewBox="0 0 200 200" className="w-full h-full text-primary">
          <path
            d="M0,100 Q50,50 100,0 Q50,50 0,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.5" />
          <circle cx="50" cy="20" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="20" cy="50" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="60" cy="40" r="4" fill="currentColor" opacity="0.3" />
        </svg>
      </div>

      {/* Decorative lines with gradients */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.p 
            className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-body"
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1.5, delay: 0.2 }}
          >
            Vi gifter oss
          </motion.p>
          
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-foreground mb-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Andreas
          </motion.h1>
          
          <motion.div 
            className="flex items-center justify-center gap-4 my-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-primary/60 to-primary/60" />
            <motion.span 
              className="text-3xl text-primary font-serif"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              &
            </motion.span>
            <div className="w-16 md:w-24 h-px bg-gradient-to-l from-transparent via-primary/60 to-primary/60" />
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-foreground mb-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Rebecka
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl font-serif text-primary/80 tracking-wide mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            Olsson Krantz
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-sage/40" />
              <p className="text-xl md:text-2xl font-serif text-muted-foreground">
                30 maj 2026
              </p>
              <div className="w-8 h-px bg-sage/40" />
            </div>
            <p className="text-base text-muted-foreground font-body">
              Lidingö, Stockholm
            </p>
          </motion.div>
        </motion.div>

        {/* Enhanced scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex justify-center pt-2 backdrop-blur-sm">
            <motion.div 
              className="w-1.5 h-2.5 bg-primary/60 rounded-full"
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;