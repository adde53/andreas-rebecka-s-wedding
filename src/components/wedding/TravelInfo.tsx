import { motion } from "framer-motion";
import { Train, MapPin, Clock, ArrowRight } from "lucide-react";

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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-4">
            Hitta hit
          </h2>
          <div className="w-24 h-px bg-primary/40 mx-auto mb-6" />
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            Så tar du dig till Lidingö kyrka från Stockholms city med kollektivtrafik
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Journey steps */}
          <div className="space-y-4">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body font-medium">
                  {item.step}
                </div>
                <div className="flex-1 bg-card p-4 rounded-lg shadow-soft">
                  <p className="font-body font-medium text-foreground mb-1">
                    {item.instruction}
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
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
            className="mt-8 p-6 bg-accent rounded-lg text-center"
          >
            <div className="flex items-center justify-center gap-2 text-accent-foreground">
              <Clock className="w-5 h-5" />
              <span className="font-body font-medium">
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
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground font-body">
              💡 Tips: Använd appen SL (Storstockholms Lokaltrafik) för att planera din resa och köpa biljett.
            </p>
          </motion.div>

          {/* Map links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 grid md:grid-cols-2 gap-4"
          >
            <a
              href="https://maps.google.com/?q=Lidingö+kyrka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 bg-card rounded-lg shadow-soft hover:shadow-card transition-shadow text-foreground font-body"
            >
              <MapPin className="w-5 h-5 text-primary" />
              <span>Lidingö kyrka på Google Maps</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </a>
            <a
              href="https://maps.google.com/?q=Långängens+Gård+Lidingö"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 bg-card rounded-lg shadow-soft hover:shadow-card transition-shadow text-foreground font-body"
            >
              <MapPin className="w-5 h-5 text-primary" />
              <span>Långängens Gård på Google Maps</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TravelInfo;