import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Train, Clock, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TrainArrival {
  id: string;
  trainNumber: string;
  destination: string;
  platform: number;
  scheduledTime: string;
  estimatedTime: string;
  delayMinutes: number;
  status: 'on-time' | 'delayed' | 'approaching' | 'cancelled';
  lineColor: string;
}

const metroStations = [
  "Miyapur", "JNTU College", "KPHB Colony", "Kukatpally", "Balanagar", "Moosapet",
  "Bharat Nagar", "Erragadda", "ESI Hospital", "SR Nagar", "Ameerpet", "Panjagutta",
  "Irrum Manzil", "Khairatabad", "Lakdi-ka-pul", "Assembly", "Nampally", "Gandhi Bhavan",
  "Osmania Medical College", "MG Bus Station", "Malakpet", "New Market", "Moosarambagh",
  "Dilsukhnagar", "Chaitanyapuri", "Victoria Memorial", "LB Nagar", "Nagole", "Uppal",
  "Stadium", "NGRI", "Habsiguda", "Tarnaka", "Mettuguda", "Secunderabad East",
  "Parade Ground", "Paradise", "Rasoolpura", "Prakash Nagar", "Begumpet", "Madhura Nagar",
  "Yousufguda", "Jubilee Hills Road No. 5", "Jubilee Hills Checkpost", "Peddamma Gudi",
  "Madhapur", "Durgam Cheruvu", "Hitech City", "Raidurg"
];

const MetroArrivals = () => {
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [arrivals, setArrivals] = useState<TrainArrival[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const navigate = useNavigate();

  // Fetch metro arrivals from our dummy API
  const fetchArrivals = async (station: string) => {
    if (!station) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('metro-arrivals', {
        body: { station }
      });

      if (error) throw error;
      
      setArrivals(data.arrivals || []);
    } catch (error) {
      console.error('Error fetching arrivals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch metro arrivals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Start real-time updates
  const startRealTimeUpdates = () => {
    if (!selectedStation) {
      toast({
        title: "Select Station",
        description: "Please select a station first",
        variant: "destructive",
      });
      return;
    }

    setIsRealTimeActive(true);
    toast({
      title: "Real-time Updates Active",
      description: "You'll receive live metro arrival updates",
    });

    // Update every 30 seconds
    const interval = setInterval(() => {
      fetchArrivals(selectedStation);
    }, 30000);

    // Cleanup interval when component unmounts or real-time is stopped
    return () => clearInterval(interval);
  };

  const stopRealTimeUpdates = () => {
    setIsRealTimeActive(false);
    toast({
      title: "Real-time Updates Stopped",
      description: "Metro arrival updates have been paused",
    });
  };

  useEffect(() => {
    if (selectedStation && isRealTimeActive) {
      const cleanup = startRealTimeUpdates();
      return cleanup;
    }
  }, [selectedStation, isRealTimeActive]);

  // Initial fetch when station is selected
  useEffect(() => {
    if (selectedStation) {
      fetchArrivals(selectedStation);
    }
  }, [selectedStation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'approaching':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-time':
        return <CheckCircle className="h-4 w-4" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'approaching':
        return <Train className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Metro Arrivals</h1>
            <p className="text-muted-foreground">Real-time train arrival information</p>
          </div>
        </div>

        {/* Station Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="h-5 w-5" />
              Select Station
            </CardTitle>
            <CardDescription>
              Choose your metro station to see live arrival times
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger>
                <SelectValue placeholder="Select a metro station" />
              </SelectTrigger>
              <SelectContent>
                {metroStations.map(station => (
                  <SelectItem key={station} value={station}>
                    {station}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedStation && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => fetchArrivals(selectedStation)} 
                  disabled={loading}
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                {isRealTimeActive ? (
                  <Button onClick={stopRealTimeUpdates} variant="destructive">
                    Stop Real-time
                  </Button>
                ) : (
                  <Button onClick={startRealTimeUpdates}>
                    Start Real-time Updates
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Arrivals Display */}
        {selectedStation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Next 3 Arrivals - {selectedStation}</span>
                {isRealTimeActive && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Live Updates Active
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && arrivals.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading arrival times...</p>
                </div>
              ) : arrivals.length === 0 ? (
                <div className="text-center py-8">
                  <Train className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming arrivals found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {arrivals.map((arrival, index) => (
                    <div 
                      key={arrival.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: arrival.lineColor }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{arrival.trainNumber}</span>
                            <span className="text-muted-foreground">→</span>
                            <span>{arrival.destination}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Platform {arrival.platform}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(arrival.status)}>
                            {getStatusIcon(arrival.status)}
                            <span className="ml-1 capitalize">{arrival.status}</span>
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatTime(arrival.estimatedTime)}
                          </div>
                          {arrival.delayMinutes > 0 && (
                            <div className="text-red-600">
                              +{arrival.delayMinutes} min delay
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MetroArrivals;