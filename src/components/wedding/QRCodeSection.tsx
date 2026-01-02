import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const QRCodeSection = () => {
  const websiteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const { toast } = useToast();

  const handleDownloadQR = () => {
    const svg = document.getElementById('wedding-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 400, 400);
        
        const link = document.createElement('a');
        link.download = 'andreas-rebecka-brollop-qr.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Andreas & Rebeckas Bröllop',
          text: 'Du är inbjuden till vårt bröllop den 30 maj 2026!',
          url: websiteUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(websiteUrl);
      toast({
        title: "Länk kopierad!",
        description: "Webbplatslänken har kopierats till urklipp.",
      });
    }
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-4">
            Dela med dig
          </h2>
          <div className="w-24 h-px bg-primary/40 mx-auto mb-6" />
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            Scanna QR-koden för att komma till bröllopssidan, eller dela länken med vänner och familj.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-sm mx-auto"
        >
          <div className="bg-card p-8 rounded-lg shadow-card">
            <div className="bg-white p-4 rounded-lg mb-6">
              <QRCodeSVG
                id="wedding-qr-code"
                value={websiteUrl || "https://example.com"}
                size={250}
                level="H"
                includeMargin
                className="w-full h-auto"
                fgColor="#4a5d4a"
              />
            </div>
            
            <p className="text-center text-sm text-muted-foreground font-body mb-6">
              Andreas & Rebecka<br />
              30 maj 2026
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                className="flex-1 font-body"
              >
                <Download className="w-4 h-4 mr-2" />
                Ladda ner
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 font-body"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Dela
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QRCodeSection;