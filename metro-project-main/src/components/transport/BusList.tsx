import { TransportCard } from "./TransportCard";
import { Bus } from "lucide-react";

interface Bus {
  routeNo: string;
  destination: string;
  stopDistance: string;
  frequency: string;
}

interface BusListProps {
  buses: Bus[];
}

export function BusList({ buses }: BusListProps) {
  if (buses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No bus services available at this station
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Bus className="h-5 w-5 text-primary" />
        Local Buses ({buses.length})
      </h3>
      {buses.map((bus, index) => (
        <TransportCard
          key={index}
          title={`Route ${bus.routeNo}`}
          subtitle={`To ${bus.destination}`}
          distance={bus.stopDistance}
          icon={<Bus className="h-6 w-6 text-primary" />}
          badges={[`Every ${bus.frequency}`]}
          onNavigate={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${bus.destination}`, '_blank')}
        />
      ))}
    </div>
  );
}
