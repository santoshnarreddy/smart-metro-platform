import { TransportCard } from "./TransportCard";

interface Auto {
  standName: string;
  distance: string;
  capacity: string;
}

interface AutoListProps {
  autos: Auto[];
}

export function AutoList({ autos }: AutoListProps) {
  if (autos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No auto stands available at this station
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        🛺 Auto-Rickshaw Stands ({autos.length})
      </h3>
      {autos.map((auto, index) => (
        <TransportCard
          key={index}
          title={auto.standName}
          subtitle={auto.capacity}
          distance={auto.distance}
          icon="🛺"
          onNavigate={() => window.open(`https://www.google.com/maps/search/auto+stand`, '_blank')}
        />
      ))}
    </div>
  );
}
