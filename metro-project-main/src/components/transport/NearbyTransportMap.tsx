import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface NearbyTransportMapProps {
  stationName: string;
}

export function NearbyTransportMap({ stationName }: NearbyTransportMapProps) {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(stationName + ' Metro Station, Hyderabad')}&zoom=16`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Station Location & Nearby Transport
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Click on map to explore nearby transport options and walking routes
        </p>
      </CardContent>
    </Card>
  );
}
