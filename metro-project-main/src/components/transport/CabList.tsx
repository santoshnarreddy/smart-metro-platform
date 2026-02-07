import { TransportCard } from "./TransportCard";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Cab {
  point: string;
  distance: string;
  providers: string[];
}

interface CabListProps {
  cabs: Cab[];
}

export function CabList({ cabs }: CabListProps) {
  if (cabs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No cab pickup points available at this station
      </div>
    );
  }

  const handleBookCab = (provider: string) => {
    const urls: Record<string, string> = {
      'Uber': 'https://m.uber.com/',
      'Ola': 'https://www.olacabs.com/',
      'Rapido': 'https://www.rapido.bike/',
      'Namma Yatri': 'https://nammayatri.in/'
    };
    
    window.open(urls[provider] || urls['Uber'], '_blank');
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Car className="h-5 w-5 text-primary" />
        Cab Pickup Points ({cabs.length})
      </h3>
      {cabs.map((cab, index) => (
        <div key={index} className="space-y-2">
          <TransportCard
            title={cab.point}
            subtitle="Available cab services"
            distance={cab.distance}
            icon={<Car className="h-6 w-6 text-primary" />}
            badges={cab.providers}
          />
          <div className="flex flex-wrap gap-2 pl-14">
            {cab.providers.map((provider) => (
              <Button
                key={provider}
                size="sm"
                variant="outline"
                onClick={() => handleBookCab(provider)}
              >
                Book {provider}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
