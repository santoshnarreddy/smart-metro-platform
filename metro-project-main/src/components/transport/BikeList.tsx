import { TransportCard } from "./TransportCard";
import { Bike } from "lucide-react";

interface BikeRental {
  provider: string;
  distance: string;
  available: string;
}

interface BikeListProps {
  bikes: BikeRental[];
}

export function BikeList({ bikes }: BikeListProps) {
  if (bikes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No bike rental services available at this station
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Bike className="h-5 w-5 text-primary" />
        E-Bike & Bicycle Rentals ({bikes.length})
      </h3>
      {bikes.map((bike, index) => (
        <TransportCard
          key={index}
          title={bike.provider}
          subtitle={bike.available}
          distance={bike.distance}
          icon={<Bike className="h-6 w-6 text-primary" />}
          onNavigate={() => window.open(`https://www.google.com/maps/search/${bike.provider}`, '_blank')}
        />
      ))}
    </div>
  );
}
