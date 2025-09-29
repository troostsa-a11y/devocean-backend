import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    console.log('Mobile menu toggled');
    setIsMenuOpen(!isMenuOpen);
  };

  const handleBookNow = () => {
    console.log('Book now clicked');
    window.open('https://book.devoceanlodge.com/bv3/search?locale=en-US&currency=USD', '_blank');
  };

  const handleCall = () => {
    console.log('Call clicked');
    window.open('tel:+258844182252', '_self');
  };

  const handleEmail = () => {
    console.log('Email clicked');
    window.open('mailto:info@devoceanlodge.com', '_self');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-4">
        {/* Top contact bar - hidden on mobile */}
        <div className="hidden md:flex justify-between items-center text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleCall}
              className="flex items-center gap-2 hover:text-primary transition-colors"
              data-testid="link-phone"
            >
              <Phone className="w-4 h-4" />
              +258 84 418 2252
            </button>
            <button 
              onClick={handleEmail}
              className="flex items-center gap-2 hover:text-primary transition-colors"
              data-testid="link-email"
            >
              <Mail className="w-4 h-4" />
              info@devoceanlodge.com
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span>EN</span>
            <span>USD</span>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary" data-testid="text-logo">
              DEVOCEAN Lodge
            </h1>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#accommodations" className="text-foreground hover:text-primary transition-colors" data-testid="link-accommodations">
              Stay
            </a>
            <a href="#experiences" className="text-foreground hover:text-primary transition-colors" data-testid="link-experiences">
              Experiences
            </a>
            <a href="#gallery" className="text-foreground hover:text-primary transition-colors" data-testid="link-gallery">
              Gallery
            </a>
            <a href="#location" className="text-foreground hover:text-primary transition-colors" data-testid="link-location">
              Location
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors" data-testid="link-contact">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button onClick={handleBookNow} className="hidden md:inline-flex" data-testid="button-book-now">
              Book Your Stay
            </Button>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="md:hidden"
              data-testid="button-menu-toggle"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4" data-testid="nav-mobile">
            <div className="flex flex-col gap-4">
              <a href="#accommodations" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-accommodations">
                Stay
              </a>
              <a href="#experiences" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-experiences">
                Experiences
              </a>
              <a href="#gallery" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-gallery">
                Gallery
              </a>
              <a href="#location" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-location">
                Location
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors" data-testid="link-mobile-contact">
                Contact
              </a>
              <Button onClick={handleBookNow} className="w-full mt-2" data-testid="button-mobile-book">
                Book Your Stay
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}