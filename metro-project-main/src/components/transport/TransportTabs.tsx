import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, Train, Car, Bike } from "lucide-react";
import { BusList } from "./BusList";
import { TrainList } from "./TrainList";
import { AutoList } from "./AutoList";
import { CabList } from "./CabList";
import { BikeList } from "./BikeList";

interface TransportTabsProps {
  stationData: any;
}

export function TransportTabs({ stationData }: TransportTabsProps) {
  const { buses = [], trains = [], autos = [], cabPickups = [], bikeRentals = [] } = stationData.lastMileOptions;

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-6 bg-muted">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="bus" className="flex items-center gap-1">
          <Bus className="h-4 w-4" />
          Bus
        </TabsTrigger>
        <TabsTrigger value="train" className="flex items-center gap-1">
          <Train className="h-4 w-4" />
          Train
        </TabsTrigger>
        <TabsTrigger value="auto">Auto</TabsTrigger>
        <TabsTrigger value="cab" className="flex items-center gap-1">
          <Car className="h-4 w-4" />
          Cab
        </TabsTrigger>
        <TabsTrigger value="bike" className="flex items-center gap-1">
          <Bike className="h-4 w-4" />
          Bike
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4 mt-4">
        {buses.length > 0 && <BusList buses={buses} />}
        {trains.length > 0 && <TrainList trains={trains} />}
        {autos.length > 0 && <AutoList autos={autos} />}
        {cabPickups.length > 0 && <CabList cabs={cabPickups} />}
        {bikeRentals.length > 0 && <BikeList bikes={bikeRentals} />}
      </TabsContent>

      <TabsContent value="bus" className="mt-4">
        <BusList buses={buses} />
      </TabsContent>

      <TabsContent value="train" className="mt-4">
        <TrainList trains={trains} />
      </TabsContent>

      <TabsContent value="auto" className="mt-4">
        <AutoList autos={autos} />
      </TabsContent>

      <TabsContent value="cab" className="mt-4">
        <CabList cabs={cabPickups} />
      </TabsContent>

      <TabsContent value="bike" className="mt-4">
        <BikeList bikes={bikeRentals} />
      </TabsContent>
    </Tabs>
  );
}
