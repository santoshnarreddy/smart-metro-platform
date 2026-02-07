import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import StationMap from "@/components/IndoorNavigation/StationMap";
import FacilitySearch from "@/components/IndoorNavigation/FacilitySearch";
import StepInstructions from "@/components/IndoorNavigation/StepInstructions";
import { findShortestPath, Node, Edge } from "@/utils/pathfinding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Navigation2, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StationData {
  stationName: string;
  stationId: string;
  floors: string[];
  nodes: Node[];
  edges: Edge[];
}

const AVAILABLE_STATIONS = [
  { id: "ameerpet", name: "Ameerpet" },
  { id: "raidurg", name: "Raidurg" },
  { id: "miyapur", name: "Miyapur" },
  { id: "mg-bus-station", name: "MG Bus Station" }
];

export default function IndoorNavigation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStation, setSelectedStation] = useState(searchParams.get("station") || "ameerpet");
  const [stationData, setStationData] = useState<StationData | null>(null);
  const [sourceNode, setSourceNode] = useState<string>("");
  const [destinationNode, setDestinationNode] = useState<string>("");
  const [pathResult, setPathResult] = useState<any>(null);
  const [highlightedNode, setHighlightedNode] = useState<string>("");

  useEffect(() => {
    loadStationData(selectedStation);
  }, [selectedStation]);

  const loadStationData = async (stationId: string) => {
    try {
      let module;
      switch(stationId) {
        case 'ameerpet':
          module = await import('../data/stations/ameerpet.json');
          break;
        case 'raidurg':
          module = await import('../data/stations/raidurg.json');
          break;
        case 'miyapur':
          module = await import('../data/stations/miyapur.json');
          break;
        case 'mg-bus-station':
          module = await import('../data/stations/mg-bus-station.json');
          break;
        default:
          throw new Error('Station not found');
      }
      setStationData(module.default);
      setSourceNode("");
      setDestinationNode("");
      setPathResult(null);
      setHighlightedNode("");
    } catch (error) {
      toast({
        title: "Error Loading Station",
        description: "Could not load station data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStationChange = (stationId: string) => {
    setSelectedStation(stationId);
    setSearchParams({ station: stationId });
  };

  const handleNodeSelect = (nodeId: string) => {
    if (!sourceNode) {
      setSourceNode(nodeId);
      setHighlightedNode(nodeId);
      toast({
        title: "Starting Point Set",
        description: "Now select your destination",
      });
    } else if (!destinationNode) {
      setDestinationNode(nodeId);
      calculatePath(sourceNode, nodeId);
    } else {
      // Reset and start new navigation
      setSourceNode(nodeId);
      setDestinationNode("");
      setPathResult(null);
      setHighlightedNode(nodeId);
    }
  };

  const calculatePath = (start: string, end: string) => {
    if (!stationData) return;

    const result = findShortestPath(stationData.nodes, stationData.edges, start, end);
    
    if (result) {
      setPathResult(result);
      setHighlightedNode("");
      toast({
        title: "Route Found!",
        description: `${result.totalDistance}m in ${Math.ceil(result.estimatedTime / 60)} minutes`,
      });
    }
    // Silently handle no route case - no error toast
  };

  const handleClearNavigation = () => {
    setSourceNode("");
    setDestinationNode("");
    setPathResult(null);
    setHighlightedNode("");
  };

  if (!stationData) {
    return (
      <PageLayout title="Indoor Navigation" subtitle="Loading station data...">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-metro-blue"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Metro Station Indoor Navigation" 
      subtitle="Navigate inside metro stations with interactive maps and step-by-step directions"
    >
      <div className="space-y-6">
        {/* Station Selector */}
        <Card className="glass-effect border-white/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-metro-blue/10 via-metro-green/10 to-metro-red/10">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-metro-blue" />
              Select Station
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Select value={selectedStation} onValueChange={handleStationChange}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Choose a metro station" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_STATIONS.map(station => (
                  <SelectItem key={station.id} value={station.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-metro-blue" />
                      {station.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                <Navigation2 className="h-4 w-4 text-metro-blue" />
                How to Navigate:
              </h4>
              <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                <li>Click on a facility to set your starting point</li>
                <li>Click another facility to set your destination</li>
                <li>Follow the highlighted path and step-by-step instructions</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Main Navigation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Facility Search */}
          <div className="lg:col-span-1">
            <FacilitySearch
              nodes={stationData.nodes}
              onSelectNode={handleNodeSelect}
              selectedNodeId={highlightedNode || sourceNode || destinationNode}
            />
          </div>

          {/* Center Panel - Station Map */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-effect border-white/20 shadow-lg overflow-hidden">
              <div className="h-[500px]">
                <StationMap
                  nodes={stationData.nodes}
                  edges={stationData.edges}
                  selectedPath={pathResult?.path || []}
                  onNodeClick={handleNodeSelect}
                  highlightedNode={highlightedNode}
                />
              </div>
            </Card>

            {/* Step Instructions */}
            <StepInstructions
              instructions={pathResult?.instructions || []}
              totalDistance={pathResult?.totalDistance || 0}
              estimatedTime={pathResult?.estimatedTime || 0}
              onClear={handleClearNavigation}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
