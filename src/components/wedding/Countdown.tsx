import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const WEDDING_DATE = new Date("2026-05-30T14:30:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = WEDDING_DATE.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { value: timeLeft.days, label: "dagar" },
    { value: timeLeft.hours, label: "timmar" },
    { value: timeLeft.minutes, label: "minuter" },
    { value: timeLeft.seconds, label: "sekunder" },
  ];

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-b from-background via-soft-pink/20 to-blush/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-dusty-rose/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-blush/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-20 sm:w-24 h-20 sm:h-24 bg-soft-pink/30 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-foreground mb-1 sm:mb-2">
            Nedräkning till bröllopet
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-body mb-6 sm:mb-8">
            30 maj 2026 kl 14:30
          </p>

          <div className="flex justify-center gap-2 sm:gap-3 md:gap-6">
            {timeBlocks.map((block, index) => (
              <motion.div
                key={block.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-card to-blush/40 rounded-xl shadow-card border border-dusty-rose/20 flex items-center justify-center mb-1 sm:mb-2">
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif text-foreground">
                    {block.value.toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-body">
                  {block.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Countdown;
