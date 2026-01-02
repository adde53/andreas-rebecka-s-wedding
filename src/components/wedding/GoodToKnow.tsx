import { motion } from "framer-motion";
import { Gift, Shirt, Camera, Car, Heart, Utensils } from "lucide-react";

const GoodToKnow = () => {
  const items = [
    {
      icon: Shirt,
      title: "Klädkod",
      description: "Kostym. Både ljus och mörk kostym passar fint. Undvik vitt som är reserverat för bruden.",
    },
    {
      icon: Gift,
      title: "Gåvor",
      description: "Er närvaro är den finaste gåvan! Om ni önskar ge något uppskattar vi bidrag till vår bröllopsresa.",
    },
    {
      icon: Camera,
      title: "Fotografering",
      description: "Under vigseln ber vi er att avstå från egna foton. På festen är det fritt fram att knäppa och ladda upp bilder i vårt galleri!",
    },
    {
      icon: Car,
      title: "Parkering",
      description: "Det finns parkeringsplatser vid både kyrkan och Långängens Gård. Tänk på att det är begränsat antal platser.",
    },
    {
      icon: Utensils,
      title: "Mat & Allergier",
      description: "Meddela eventuella allergier eller specialkost senast 1 maj via OSA.",
    },
    {
      icon: Heart,
      title: "Tal & Underhållning",
      description: "Vill du hålla tal eller bidra med underhållning? Kontakta våra toastmasters Vendela & Lucas.",
    },
  ];

  return (
    <section className="py-24 bg-secondary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-blush/25 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-56 h-56 rounded-full bg-sage-light/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-soft-pink/20 blur-3xl" />
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
            Bra att veta
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-card p-6 rounded-xl shadow-soft border border-blush/20 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <motion.div 
                className="w-12 h-12 mb-4 rounded-full bg-gradient-to-br from-accent to-blush/40 flex items-center justify-center"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <item.icon className="w-6 h-6 text-primary" />
              </motion.div>
              
              <h3 className="text-xl font-serif mb-2 text-foreground">
                {item.title}
              </h3>
              
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoodToKnow;