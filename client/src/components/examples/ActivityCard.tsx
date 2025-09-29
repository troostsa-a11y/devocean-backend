import ActivityCard from '../ActivityCard'
import divingImage from '@assets/stock_images/scuba_diving_tropica_09bdac44.jpg';

export default function ActivityCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <ActivityCard
        title="Scuba Diving"
        description="Offshore reefs with rich marine life."
        image={divingImage}
      />
    </div>
  )
}