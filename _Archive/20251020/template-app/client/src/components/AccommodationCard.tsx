import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Wifi, Fan, Users, Bath } from "lucide-react";

interface AccommodationCardProps {
  title: string;
  description: string;
  image: string;
  size: string;
  features: string[];
  amenities: {
    icon: React.ReactNode;
    label: string;
  }[];
  details: string[];
}

export default function AccommodationCard({
  title,
  description,
  image,
  size,
  features,
  amenities,
  details
}: AccommodationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    console.log(`Toggle details for ${title}`);
    setShowDetails(!showDetails);
  };

  const handleBookNow = () => {
    console.log(`Book now clicked for ${title}`);
    window.open('https://book.devoceanlodge.com/bv3/search?locale=en-US&currency=USD', '_blank');
  };

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-accommodation-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl mb-2" data-testid={`text-accommodation-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {title}
            </CardTitle>
            <Badge variant="secondary" className="mb-3" data-testid={`badge-size-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {size}
            </Badge>
          </div>
        </div>
        
        <p className="text-muted-foreground" data-testid={`text-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {description}
        </p>
        
        {/* Amenities */}
        <div className="flex flex-wrap gap-3 mt-4">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-1 text-sm text-muted-foreground">
              {amenity.icon}
              <span>{amenity.label}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Features */}
        <div className="mb-4">
          <ul className="space-y-1">
            {features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Expandable details */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={toggleDetails}
            className="w-full justify-between p-0 h-auto text-primary hover:text-primary"
            data-testid={`button-details-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            More details
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          {showDetails && (
            <div className="space-y-2 animate-accordion-down" data-testid={`section-details-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              <ul className="space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 mr-2 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button 
            onClick={handleBookNow}
            className="w-full"
            data-testid={`button-book-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}