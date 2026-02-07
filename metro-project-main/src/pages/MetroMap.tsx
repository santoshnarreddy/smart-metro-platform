import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import metroMapImage from "@/assets/metro-map.jpg";

const MetroMap = () => {
  return (
    <PageLayout title="Hyderabad Metro Map" subtitle="Navigate the metro network with our interactive route map">
      <div className="max-w-6xl mx-auto">
        <Card className="glass-effect border-white/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-metro-blue/10 via-metro-green/10 to-metro-red/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-6 w-6 text-metro-blue" />
              Hyderabad Metro Rail Route Map
            </CardTitle>
            <CardDescription className="text-base">
              Complete network map showing all metro lines and stations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="relative w-full overflow-hidden rounded-lg border border-white/20">
              <img 
                src={metroMapImage} 
                alt="Hyderabad Metro Rail Route Map" 
                className="w-full h-auto"
              />
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-metro-blue/10 border border-metro-blue/20">
                <div className="h-4 w-4 rounded-full bg-metro-blue"></div>
                <div>
                  <p className="font-semibold text-metro-blue">Blue Line</p>
                  <p className="text-sm text-muted-foreground">Nagole - Raidurg</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-metro-red/10 border border-metro-red/20">
                <div className="h-4 w-4 rounded-full bg-metro-red"></div>
                <div>
                  <p className="font-semibold text-metro-red">Red Line</p>
                  <p className="text-sm text-muted-foreground">Miyapur - LB Nagar</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-metro-green/10 border border-metro-green/20">
                <div className="h-4 w-4 rounded-full bg-metro-green"></div>
                <div>
                  <p className="font-semibold text-metro-green">Green Line</p>
                  <p className="text-sm text-muted-foreground">JBS Parade Ground - MG Bus Stand</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default MetroMap;
