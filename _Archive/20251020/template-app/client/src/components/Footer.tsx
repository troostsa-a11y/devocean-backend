import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const handleCall = () => {
    console.log('Footer call clicked');
    window.open('tel:+258844182252', '_self');
  };

  const handleEmail = () => {
    console.log('Footer email clicked');
    window.open('mailto:info@devoceanlodge.com', '_self');
  };

  const handleDirections = () => {
    console.log('Directions clicked');
    window.open('https://www.google.com/maps/dir/?api=1&destination=-26.841994852732736,32.88504331196165', '_blank');
  };

  const handleSocialClick = (platform: string) => {
    console.log(`${platform} social link clicked`);
    const socialUrls = {
      facebook: 'https://www.facebook.com/devoceanmz/',
      instagram: 'https://www.instagram.com/devoceanmz/',
      twitter: 'https://x.com/DEVOCEANMZ'
    };
    window.open(socialUrls[platform as keyof typeof socialUrls], '_blank');
  };

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-footer-contact-title">Contact</h3>
            <div className="space-y-3">
              <button 
                onClick={handleCall}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-footer-phone"
              >
                <Phone className="w-4 h-4" />
                +258 84 418 2252
              </button>
              <button 
                onClick={handleEmail}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-footer-email"
              >
                <Mail className="w-4 h-4" />
                info@devoceanlodge.com
              </button>
              <button 
                onClick={handleDirections}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-footer-directions"
              >
                <MapPin className="w-4 h-4" />
                Ponta do Ouro, Mozambique
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-footer-links-title">Quick Links</h3>
            <div className="space-y-3">
              <a href="#accommodations" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-accommodations">
                Accommodations
              </a>
              <a href="#experiences" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-experiences">
                Experiences
              </a>
              <a href="#gallery" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-gallery">
                Gallery
              </a>
              <a href="#location" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-location">
                Location
              </a>
            </div>
          </div>

          {/* Social & Booking */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-footer-social-title">Follow Us</h3>
            <div className="flex gap-3 mb-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleSocialClick('facebook')}
                data-testid="button-social-facebook"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleSocialClick('instagram')}
                data-testid="button-social-instagram"
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleSocialClick('twitter')}
                data-testid="button-social-twitter"
              >
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              className="w-full"
              onClick={() => {
                console.log('Footer book now clicked');
                window.open('https://book.devoceanlodge.com/bv3/search?locale=en-US&currency=USD', '_blank');
              }}
              data-testid="button-footer-book"
            >
              Book Now
            </Button>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" data-testid="text-copyright">
              © 2024 DEVOCEAN Lodge. Eco-friendly stays in Ponta do Ouro, Mozambique.
            </p>
            <p className="text-sm">
              Guest-loved comfort & value
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}