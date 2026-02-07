import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { StationTransportSelector } from "@/components/transport/StationTransportSelector";
import { TransportTabs } from "@/components/transport/TransportTabs";
import { NearbyTransportMap } from "@/components/transport/NearbyTransportMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Navigation, TrendingUp } from "lucide-react";
import { loadStationData, getAllTransportOptions, getFastestOption } from "@/utils/transportCalculator";

export default function PostStationTransport() {
  const [selectedStation, setSelectedStation] = useState("");
  const [stationData, setStationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStationData = async () => {
      if (!selectedStation) {
        setStationData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await loadStationData(selectedStation);
        if (data) {
          setStationData(data);
        } else {
          setError("Transport data not available for this station");
        }
      } catch (err) {
        setError("Failed to load station transport data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStationData();
  }, [selectedStation]);

  const totalOptions = stationData 
    ? getAllTransportOptions(stationData).length 
    : 0;

  const fastestOption = stationData 
    ? getFastestOption(getAllTransportOptions(stationData))
    : null;

  return (
    <PageLayout title="Post-Station Transport Finder">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Navigation className="h-6 w-6 text-primary" />
              Find Your Onward Transport
            </CardTitle>
            <CardDescription>
              Discover all available transportation options from your destination metro station
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StationTransportSelector 
              value={selectedStation} 
              onValueChange={setSelectedStation} 
            />
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Station Data Display */}
        {stationData && !loading && (
          <>
            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Station</p>
                      <p className="font-semibold text-lg">{stationData.stationName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Options</p>
                      <p className="font-semibold text-lg">{totalOptions} transport modes</p>
                    </div>
                  </div>

                  {fastestOption && (
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        ⚡
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fastest Option</p>
                        <p className="font-semibold text-sm">{fastestOption.name}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {fastestOption.distance} away
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transport Options Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Available Transport Options</CardTitle>
                <CardDescription>
                  Browse all onward transport modes from {stationData.stationName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransportTabs stationData={stationData} />
              </CardContent>
            </Card>

            {/* Map View */}
            <NearbyTransportMap stationName={stationData.stationName} />
          </>
        )}

        {/* Empty State */}
        {!selectedStation && !loading && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Navigation className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select Your Destination Station</h3>
              <p className="text-muted-foreground max-w-md">
                Choose your metro destination to discover all available onward transport options including buses, trains, autos, cabs, and bike rentals.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
