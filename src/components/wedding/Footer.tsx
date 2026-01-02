import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="font-serif text-2xl">A</span>
          <Heart className="w-4 h-4 fill-current" />
          <span className="font-serif text-2xl">R</span>
        </div>
        <p className="font-body text-sm opacity-80">
          30 maj 2026 • Lidingö
        </p>
        <p className="font-body text-xs mt-4 opacity-60">
          Vi ses där! 💐
        </p>
      </div>
    </footer>
  );
};

export default Footer;