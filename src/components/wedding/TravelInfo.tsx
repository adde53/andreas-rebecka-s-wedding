import { motion } from "framer-motion";
import { MapPin, Clock, ArrowRight } from "lucide-react";

const TravelInfo = () => {
  const steps = [
    {
      step: 1,
      instruction: "Ta tunnelbanan (röd linje) till Ropsten",
      detail: "Från T-Centralen tar det ca 12 minuter",
    },
    {
      step: 2,
      instruction: "Byt till Lidingöbanan vid Ropsten",
      detail: "Plattformen finns i direkt anslutning",
    },
    {
      step: 3,
      instruction: "Åk till Lidingö centrum",
      detail: "Resan tar ca 10 minuter",
    },
    {
      step: 4,
      instruction: "Promenad till Lidingö kyrka",
      detail: "Ca 5 minuters promenad från Lidingö centrum",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-foreground mb-3 sm:mb-4">
            Hitta hit
          </h2>
          <div className="w-20 sm:w-24 h-px bg-primary/40 mx-auto mb-4 sm:mb-6" />
          <p className="text-sm sm:text-base text-muted-foreground font-body max-w-2xl mx-auto px-2">
            Så tar du dig till Lidingö kyrka från Stockholms city med kollektivtrafik
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Journey steps */}
          <div className="space-y-3 sm:space-y-4">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-3 sm:gap-4 items-start"
              >
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body font-medium text-sm sm:text-base">
                  {item.step}
                </div>
                <div className="flex-1 bg-card p-3 sm:p-4 rounded-lg shadow-soft">
                  <p className="font-body font-medium text-foreground mb-1 text-sm sm:text-base">
                    {item.instruction}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-body">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 sm:mt-8 p-4 sm:p-6 bg-accent rounded-lg text-center"
          >
            <div className="flex items-center justify-center gap-2 text-accent-foreground">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-body font-medium text-sm sm:text-base">
                Total restid från T-Centralen: ca 30-35 minuter
              </span>
            </div>
          </motion.div>

          {/* SL tip */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-4 sm:mt-6 text-center"
          >
            <p className="text-xs sm:text-sm text-muted-foreground font-body px-2">
              💡 Tips: Använd appen SL (Storstockholms Lokaltrafik) för att planera din resa och köpa biljett.
            </p>
          </motion.div>


          {/* Map links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 sm:mt-12 grid gap-3 sm:gap-4"
          >
            <a
              href="https://maps.google.com/?q=Lidingö+kyrka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 sm:p-4 bg-card rounded-lg shadow-soft hover:shadow-card active:scale-[0.98] transition-all text-foreground font-body text-sm sm:text-base touch-manipulation"
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span>Lidingö kyrka på Google Maps</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            </a>
            <a
              href="https://maps.google.com/?q=Långängens+Gård+Lidingö"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 sm:p-4 bg-card rounded-lg shadow-soft hover:shadow-card active:scale-[0.98] transition-all text-foreground font-body text-sm sm:text-base touch-manipulation"
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span>Långängens Gård på Google Maps</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TravelInfo;