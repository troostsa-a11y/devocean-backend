import AccommodationCard from '../AccommodationCard'
import { Fan, Users, Bath, Wifi } from "lucide-react";
import safariTentImage from '@assets/stock_images/luxury_safari_tent_a_9b989e91.jpg';

export default function AccommodationCardExample() {
  return (
    <div className="p-8 max-w-md">
      <AccommodationCard
        title="Safari Tent"
        description="Canvas tent on a wooden platform with private terrace facing the tropical garden."
        image={safariTentImage}
        size="12 m²"
        features={[
          "Twin/King bed with pedestals and shaded lamps",
          "Mosquito mesh on doors and windows",
          "Private terrace with palm-leaf chairs"
        ]}
        amenities={[
          { icon: <Users className="w-4 h-4" />, label: "2 guests" },
          { icon: <Fan className="w-4 h-4" />, label: "Fan" },
          { icon: <Wifi className="w-4 h-4" />, label: "Power points" },
          { icon: <Bath className="w-4 h-4" />, label: "Shared bath" }
        ]}
        details={[
          "Two single beds (or King) with pedestals and shaded lamps",
          "Strong fan and power points for devices",
          "Small shelving unit for clothing and essentials",
          "Shared bathrooms with hot/cold showers",
          "Village can be lively during holidays; free earplugs at reception"
        ]}
      />
    </div>
  )
}