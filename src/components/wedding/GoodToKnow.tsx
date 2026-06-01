import { motion } from "framer-motion";
import { Gift, Shirt, Camera, Car, Heart, Utensils, Bus } from "lucide-react";
import swishQr from "@/assets/swish-qr.png";

const GoodToKnow = () => {
  const items: Array<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string | React.ReactNode;
  }> = [
    {
      icon: Shirt,
      title: "Klädkod",
      description: "Mörk kostym. Mörk kostym är vår riktlinje för klädseln. För herrar går det utmärkt med både ljus och mörk kostym. För damer innebär klädkoden en högtidlig och stilren klänning eller motsvarande.",
    },
    {
      icon: Gift,
      title: "Gåvor",
      description: "Det finaste är att få dela dagen med er. Vill ni ändå ge en gåva hade vi blivit lika glada för ett bidrag till vår bröllopsresa som för något vackert och minnesvärt.",
    },
    {
      icon: Camera,
      title: "Fotografering",
      description: "Under vigseln ber vi er att avstå från att ta egna foton. Vår fotograf Ida kommer fånga detta ögonblick för att ni ska kunna vara med oss i nuet under denna stund. På festen är det fritt fram att knäppa och ladda upp bilder i vårt galleri.",
    },
    {
      icon: Car,
      title: "Parkering",
      description: "Det finns parkeringsplatser vid både kyrkan och Långängens Gård. Tänk på att det är begränsat antal platser.",
    },
    {
      icon: Bus,
      title: "Gemensam buss",
      description: "Efter vigseln åker alla gäster gemensam buss från Lidingö kyrka till Långängens Gård. Bussen kör två vändor.",
    },
    {
      icon: Utensils,
      title: "Mat & Allergier",
      description: (
        <>
          Meddela eventuella allergier eller specialkost i samband med <span className="font-semibold">OSA 31 mars</span>.
        </>
      ),
    },
    {
      icon: Heart,
      title: "Tal & Underhållning",
      description: (
        <>
          Vill du hålla tal eller bidra med underhållning? Kontakta våra toastmasters{"\n"}
          Vendela (070-053 90 29) eller{"\n"}
          Lucas (076-818 15 63) senast <span className="font-semibold">30 april</span>.
        </>
      ),
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-secondary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 sm:top-20 right-4 sm:right-20 w-32 sm:w-48 h-32 sm:h-48 rounded-full bg-blush/25 blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-20 w-40 sm:w-56 h-40 sm:h-56 rounded-full bg-sage-light/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-soft-pink/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-foreground mb-3 sm:mb-4">
            Bra att veta
          </h2>
          <div className="w-20 sm:w-24 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-card p-4 sm:p-6 rounded-xl shadow-soft border border-blush/20 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <motion.div 
                className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-accent to-blush/40 flex items-center justify-center"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </motion.div>
              
              <h3 className="text-lg sm:text-xl font-serif mb-2 text-foreground">
                {item.title}
              </h3>
              
              <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Swish Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-12 max-w-lg mx-auto"
        >
          <div className="bg-gradient-card p-6 sm:p-8 rounded-xl shadow-card border border-blush/20 text-center">
            <motion.div 
              className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-blush/40 flex items-center justify-center"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </motion.div>
            
            <h3 className="text-xl sm:text-2xl font-serif mb-2 text-foreground">
              Bidra till bröllopsresan
            </h3>
            
            <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed mb-5">
              Vill ni ge ett bidrag till vår bröllopsresa? Swisha till <span className="font-medium text-foreground">Lucas Olsson</span> via QR-koden nedan. 
              Skriv gärna ert namn i meddelandet så att vi kan tacka er personligen!
            </p>
            <p className="text-xs text-muted-foreground/80 font-body mb-5">
              Efter bröllopet kommer Lucas att sammanställa alla bidrag med belopp, avsändare och meddelanden.
            </p>

            <div className="inline-block rounded-xl overflow-hidden shadow-soft">
              <img 
                src={swishQr} 
                alt="Swish QR-kod till Lucas Olsson för bröllopsresa" 
                className="w-48 sm:w-56 h-auto"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GoodToKnow;
