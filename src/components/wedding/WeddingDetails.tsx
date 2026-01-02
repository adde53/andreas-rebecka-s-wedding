import { motion } from "framer-motion";
import { Church, PartyPopper, Clock, MapPin } from "lucide-react";

const WeddingDetails = () => {
  const details = [
    {
      icon: Church,
      title: "Vigsel",
      time: "15:00",
      location: "Lidingö kyrka",
      address: "Stockholmsvägen 16, Lidingö",
    },
    {
      icon: PartyPopper,
      title: "Fest & Middag",
      time: "17:00",
      location: "Långängens Gård",
      address: "Långängsvägen 116, Lidingö",
    },
  ];

  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
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
          <div className="w-24 h-px bg-primary/40 mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {details.map((detail, index) => (
            <motion.div
              key={detail.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-card p-8 rounded-lg shadow-card text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
                <detail.icon className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-2xl font-serif mb-4 text-foreground">
                {detail.title}
              </h3>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-body">{detail.time}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
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