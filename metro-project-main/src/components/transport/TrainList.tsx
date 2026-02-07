import { TransportCard } from "./TransportCard";
import { Train } from "lucide-react";

interface TrainOption {
  name: string;
  distance: string;
  connectivity: string;
  frequency: string;
}

interface TrainListProps {
  trains: TrainOption[];
}

export function TrainList({ trains }: TrainListProps) {
  if (trains.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No train connections available at this station
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Train className="h-5 w-5 text-primary" />
        Trains / MMTS ({trains.length})
      </h3>
      {trains.map((train, index) => (
        <TransportCard
          key={index}
          title={train.name}
          subtitle={train.connectivity}
          distance={train.distance}
          icon={<Train className="h-6 w-6 text-primary" />}
          badges={[`Every ${train.frequency}`]}
          onNavigate={() => window.open(`https://www.google.com/maps/search/MMTS+station`, '_blank')}
        />
      ))}
    </div>
  );
}
