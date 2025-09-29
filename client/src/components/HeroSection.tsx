import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroImage1 from "@assets/stock_images/ocean_view_beach_lod_a8b3377e.jpg";
import heroImage2 from "@assets/stock_images/ocean_view_beach_lod_22d6bd31.jpg";
import heroImage3 from "@assets/stock_images/ocean_view_beach_lod_6ab69f8d.jpg";

const heroImages = [heroImage1, heroImage2, heroImage3];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    console.log('Previous hero image');
    setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToNext = () => {
    console.log('Next hero image');
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  };

  const handleBookStay = () => {
    console.log('Book your stay clicked from hero');
    window.open('https://book.devoceanlodge.com/bv3/search?locale=en-US&currency=USD', '_blank');
  };

  const handleExploreLodge = () => {
    console.log('Explore lodge clicked');
    document.getElementById('accommodations')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Image carousel */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`DEVOCEAN Lodge view ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-2 transition-colors"
        data-testid="button-hero-prev"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-2 transition-colors"
        data-testid="button-hero-next"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Hero content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6" data-testid="text-hero-title">
            DEVOCEAN Lodge
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light" data-testid="text-hero-subtitle">
            Eco-friendly stays a few hundred meters from the beach in Ponta do Ouro, Southern Mozambique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleBookStay}
              size="lg" 
              className="bg-primary/90 backdrop-blur-sm hover:bg-primary text-white px-8 py-3"
              data-testid="button-hero-book"
            >
              Book Your Stay
            </Button>
            <Button 
              onClick={handleExploreLodge}
              variant="outline" 
              size="lg" 
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-3"
              data-testid="button-hero-explore"
            >
              Explore the Lodge
            </Button>
          </div>
        </div>
      </div>

      {/* Image indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentImage ? 'bg-white' : 'bg-white/50'
            }`}
            data-testid={`button-hero-indicator-${index}`}
          />
        ))}
      </div>
    </section>
  );
}