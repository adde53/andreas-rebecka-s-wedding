import { motion } from "framer-motion";
import { Church, PartyPopper, Clock, MapPin } from "lucide-react";

const WeddingDetails = () => {
  const details = [
    {
      icon: Church,
      title: "Vigsel",
      time: "14:30",
      location: "Lidingö kyrka",
      address: "Kyrkallén 4, Lidingö",
    },
    {
      icon: PartyPopper,
      title: "Fest & Middag",
      time: "ca 16:00",
      location: "Långängens Gård",
      address: "Långängens Gård, Lidingö",
    },
  ];

  return (
    <section className="py-24 bg-secondary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-blush/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-sage-light/40 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-4">
            Dagen
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {details.map((detail, index) => (
            <motion.div
              key={detail.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gradient-card p-8 rounded-xl shadow-card text-center border border-blush/20 hover:shadow-lg transition-shadow duration-300"
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent to-blush/30 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <detail.icon className="w-8 h-8 text-primary" />
              </motion.div>
              
              <h3 className="text-2xl font-serif mb-4 text-foreground">
                {detail.title}
              </h3>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <Clock className="w-4 h-4 text-primary/70" />
                <span className="font-body font-medium">{detail.time}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4 text-primary/70" />
                <span className="font-body font-medium">{detail.location}</span>
              </div>
              
              <p className="text-sm text-muted-foreground font-body">
                {detail.address}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeddingDetails;
