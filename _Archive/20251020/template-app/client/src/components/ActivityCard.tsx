import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityCardProps {
  title: string;
  description: string;
  image: string;
}

export default function ActivityCard({ title, description, image }: ActivityCardProps) {
  const handleCardClick = () => {
    console.log(`${title} activity clicked`);
  };

  return (
    <Card 
      className="group overflow-hidden hover-elevate cursor-pointer"
      onClick={handleCardClick}
      data-testid={`card-activity-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg" data-testid={`text-activity-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm" data-testid={`text-activity-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}