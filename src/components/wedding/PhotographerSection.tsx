import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, ArrowRight, Sparkles } from "lucide-react";

const PhotographerSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-blush/10 via-background to-sage/10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-blush/15 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-sage/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-card/90 via-soft-pink/20 to-sage/15 rounded-[2rem] border border-blush/30 shadow-card backdrop-blur-sm p-8 sm:p-14 text-center overflow-hidden">
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-gradient-to-br from-blush/40 to-transparent blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-tr from-sage/30 to-transparent blur-2xl" />

            <motion.div
              initial={{ scale: 0, rotate: 10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring", delay: 0.2 }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blush/50 via-dusty-rose/40 to-sage/40 flex items-center justify-center shadow-lg"
            >
              <Camera className="w-9 h-9 sm:w-11 sm:h-11 text-foreground/80" />
            </motion.div>

            <p className="relative text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3 font-body">
              Proffsbilder
            </p>

            <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-serif font-light text-foreground mb-4 tracking-wide">
              Fotografens bilder
            </h2>

            <div className="relative flex items-center justify-center gap-3 mb-6">
              <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent to-blush/60" />
              <Sparkles className="w-4 h-4 text-blush" />
              <div className="w-12 sm:w-16 h-px bg-gradient-to-l from-transparent to-blush/60" />
            </div>

            <p className="relative text-base sm:text-lg text-muted-foreground font-body max-w-xl mx-auto mb-8 leading-relaxed">
              Alla bilder från vår fotograf samlade på ett ställe. Bläddra i lugn och ro
              och ladda ner dina favoriter.
            </p>

            <Link to="/photographer" className="relative inline-block">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-7 sm:px-9 py-3 sm:py-4 rounded-full bg-gradient-to-r from-sage/80 via-blush to-dusty-rose/90 text-white font-body text-base sm:text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Se fotografens bilder
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PhotographerSection;
