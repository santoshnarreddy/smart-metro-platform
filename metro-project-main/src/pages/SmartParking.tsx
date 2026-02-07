import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Calendar, MapPin, Car, Bike, Clock, CheckCircle, AlertCircle, ParkingCircle, CreditCard, AlertTriangle, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import StationSelector, { METRO_STATIONS } from "@/components/StationSelector";
import { useJourneyState } from "@/hooks/useJourneyState";

interface ParkingAvailability {
  id: string;
  station_id: string;
  station_name: string;
  vehicle_type: string;
  total_slots: number;
  occupied_slots: number;
  date: string;
}

interface ParkingBooking {
  id: string;
  station_id: string;
  station_name: string;
  vehicle_type: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  slot_number: number;
  amount: number;
  status: string;
}

interface NearbyStation {
  station_name: string;
  station_id: string;
  distance: number;
  twoWheelerAvailable: number;
  fourWheelerAvailable: number;
}

// Simulated distances between stations (in km)
const STATION_DISTANCES: Record<string, Record<string, number>> = {
  "Chaitanyapuri": {
    "Dilsukhnagar": 1.2,
    "Victoria Memorial": 1.8,
    "LB Nagar": 3.5,
    "Nagole": 4.2,
  },
  "Dilsukhnagar": {
    "Chaitanyapuri": 1.2,
    "Victoria Memorial": 0.8,
    "LB Nagar": 2.3,
    "Nagole": 3.0,
  },
  "Victoria Memorial": {
    "Chaitanyapuri": 1.8,
    "Dilsukhnagar": 0.8,
    "LB Nagar": 1.5,
    "Nagole": 2.2,
  },
};

// Mock metro arrival data by station
const METRO_ARRIVALS: Record<string, { trainId: string; destination: string; arrivalTime: string; line: string }[]> = {
  "Dilsukhnagar": [
    { trainId: "R-101", destination: "LB Nagar", arrivalTime: "2 min", line: "Red" },
    { trainId: "R-102", destination: "Miyapur", arrivalTime: "5 min", line: "Red" },
    { trainId: "R-103", destination: "LB Nagar", arrivalTime: "8 min", line: "Red" },
  ],
  "Victoria Memorial": [
    { trainId: "R-104", destination: "Miyapur", arrivalTime: "3 min", line: "Red" },
    { trainId: "R-105", destination: "LB Nagar", arrivalTime: "6 min", line: "Red" },
  ],
  "LB Nagar": [
    { trainId: "R-106", destination: "Miyapur", arrivalTime: "4 min", line: "Red" },
    { trainId: "R-107", destination: "Miyapur", arrivalTime: "9 min", line: "Red" },
  ],
  "Nagole": [
    { trainId: "B-201", destination: "Raidurg", arrivalTime: "2 min", line: "Blue" },
    { trainId: "B-202", destination: "Raidurg", arrivalTime: "7 min", line: "Blue" },
  ],
  "Chaitanyapuri": [
    { trainId: "R-108", destination: "LB Nagar", arrivalTime: "3 min", line: "Red" },
    { trainId: "R-109", destination: "Miyapur", arrivalTime: "6 min", line: "Red" },
  ],
};

const SmartParking = () => {
  const navigate = useNavigate();
  const { setParkingStation } = useJourneyState();
  const [parkingData, setParkingData] = useState<ParkingAvailability[]>([]);
  const [userBookings, setUserBookings] = useState<ParkingBooking[]>([]);
  const [expandedArrivals, setExpandedArrivals] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState("");
  const [vehicleType, setVehicleType] = useState<'two_wheeler' | 'four_wheeler'>('two_wheeler');
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchParkingData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchParkingData = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_availability')
        .select('*')
        .order('station_name');

      if (error) throw error;
      setParkingData(data || []);
    } catch (error) {
      console.error('Error fetching parking data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch parking availability",
        variant: "destructive",
      });
    }
  };

  const fetchUserBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_bookings')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserBookings(data || []);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    }
  };

  // Check if a station is fully occupied for both vehicle types
  const isStationFullyOccupied = (stationId: string): boolean => {
    const twoWheeler = parkingData.find(p => p.station_id === stationId && p.vehicle_type === 'two_wheeler');
    const fourWheeler = parkingData.find(p => p.station_id === stationId && p.vehicle_type === 'four_wheeler');
    
    const twoWheelerFull = twoWheeler ? twoWheeler.occupied_slots >= twoWheeler.total_slots : true;
    const fourWheelerFull = fourWheeler ? fourWheeler.occupied_slots >= fourWheeler.total_slots : true;
    
    return twoWheelerFull && fourWheelerFull;
  };

  // Check if a station is full for a specific vehicle type
  const isStationFullForVehicleType = (stationId: string, vType: string): boolean => {
    const data = parkingData.find(p => p.station_id === stationId && p.vehicle_type === vType);
    return data ? data.occupied_slots >= data.total_slots : true;
  };

  // Get selected station info
  const selectedStationInfo = useMemo(() => {
    if (!selectedStation) return null;
    const station = parkingData.find(p => p.station_id === selectedStation);
    return station;
  }, [selectedStation, parkingData]);

  // Check if selected station is full
  const isSelectedStationFull = useMemo(() => {
    if (!selectedStation) return false;
    return isStationFullForVehicleType(selectedStation, vehicleType);
  }, [selectedStation, vehicleType, parkingData]);

  // Get nearby stations with available slots
  const nearbyStationsWithSlots = useMemo((): NearbyStation[] => {
    if (!selectedStationInfo || !isSelectedStationFull) return [];
    
    const stationName = selectedStationInfo.station_name;
    const distances = STATION_DISTANCES[stationName] || {};
    
    const nearbyStations: NearbyStation[] = [];
    
    for (const [nearbyName, distance] of Object.entries(distances)) {
      const twoWheeler = parkingData.find(p => p.station_name === nearbyName && p.vehicle_type === 'two_wheeler');
      const fourWheeler = parkingData.find(p => p.station_name === nearbyName && p.vehicle_type === 'four_wheeler');
      
      const twoWheelerAvailable = twoWheeler ? twoWheeler.total_slots - twoWheeler.occupied_slots : 0;
      const fourWheelerAvailable = fourWheeler ? fourWheeler.total_slots - fourWheeler.occupied_slots : 0;
      
      // Only include stations with available slots for the selected vehicle type
      const hasAvailableSlots = vehicleType === 'two_wheeler' ? twoWheelerAvailable > 0 : fourWheelerAvailable > 0;
      
      if (hasAvailableSlots) {
        nearbyStations.push({
          station_name: nearbyName,
          station_id: twoWheeler?.station_id || fourWheeler?.station_id || '',
          distance,
          twoWheelerAvailable,
          fourWheelerAvailable,
        });
      }
    }
    
    return nearbyStations.sort((a, b) => a.distance - b.distance);
  }, [selectedStationInfo, isSelectedStationFull, parkingData, vehicleType]);

  const calculateAmount = () => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    let end = new Date(`2000-01-01T${endTime}`);
    
    // If end time is before start time, it means parking extends to next day
    if (end.getTime() <= start.getTime()) {
      end = new Date(`2000-01-02T${endTime}`); // Add a day
    }
    
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    // Ensure minimum 1 hour and always positive
    const validHours = Math.max(1, hours);
    
    return vehicleType === 'two_wheeler' ? validHours * 10 : validHours * 20;
  };

  const handleBooking = async () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a parking slot.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!selectedStation || !bookingDate || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Note: If end time is before start time, it indicates overnight parking
    // The calculateAmount function handles this case correctly

    setIsLoading(true);

    try {
      const selectedStationData = parkingData.find(
        p => p.station_id === selectedStation && p.vehicle_type === vehicleType
      );

      if (!selectedStationData) {
        throw new Error('Station not found');
      }

      if (selectedStationData.occupied_slots >= selectedStationData.total_slots) {
        toast({
          title: "Error",
          description: "No parking slots available at this station",
          variant: "destructive",
        });
        return;
      }

      const amount = calculateAmount();
      const slotNumber = selectedStationData.occupied_slots + 1;

      const { error } = await supabase
        .from('parking_bookings')
        .insert({
          user_id: user.id,
          station_id: selectedStation,
          station_name: selectedStationData.station_name,
          vehicle_type: vehicleType,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          slot_number: slotNumber,
          amount: amount,
        });

      if (error) throw error;

      // Update availability
      await supabase
        .from('parking_availability')
        .update({
          occupied_slots: selectedStationData.occupied_slots + 1
        })
        .eq('id', selectedStationData.id);

      toast({
        title: "Success",
        description: `Parking slot ${slotNumber} booked successfully!`,
      });

      // Save the parking station to journey state for ticket booking
      const bookedStationName = selectedStationData.station_name;
      const stationForBooking = METRO_STATIONS.find(s => s.name === bookedStationName);
      if (stationForBooking) {
        setParkingStation(stationForBooking.id);
      }

      // Reset form
      setSelectedStation("");
      setBookingDate("");
      setStartTime("");
      setEndTime("");
      
      // Refresh data
      fetchParkingData();
      fetchUserBookings();
    } catch (error) {
      console.error('Error booking parking:', error);
      toast({
        title: "Error",
        description: "Failed to book parking slot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectNearbyStation = (stationId: string) => {
    setSelectedStation(stationId);
  };

  const getAvailabilityStatus = (occupied: number, total: number) => {
    const percentage = (occupied / total) * 100;
    if (percentage >= 100) return { status: 'full', color: 'destructive' as const };
    if (percentage >= 90) return { status: 'limited', color: 'secondary' as const };
    if (percentage >= 70) return { status: 'limited', color: 'secondary' as const };
    return { status: 'available', color: 'default' as const };
  };

  const stationsWithParking = parkingData.reduce((acc, curr) => {
    if (!acc.find(station => station.station_id === curr.station_id)) {
      acc.push(curr);
    }
    return acc;
  }, [] as ParkingAvailability[]);

  return (
    <PageLayout title="Smart Parking" subtitle="Reserve parking slots at metro stations with real-time availability">
      <div className="space-y-8">

        {/* Parking Availability Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stationsWithParking.map((station) => {
            const twoWheeler = parkingData.find(p => p.station_id === station.station_id && p.vehicle_type === 'two_wheeler');
            const fourWheeler = parkingData.find(p => p.station_id === station.station_id && p.vehicle_type === 'four_wheeler');
            const isFull = isStationFullyOccupied(station.station_id);
            
            const twoWheelerAvailable = twoWheeler ? twoWheeler.total_slots - twoWheeler.occupied_slots : 0;
            const fourWheelerAvailable = fourWheeler ? fourWheeler.total_slots - fourWheeler.occupied_slots : 0;
            const totalAvailable = twoWheelerAvailable + fourWheelerAvailable;
            
            return (
              <Card 
                key={station.station_id} 
                className={`overflow-hidden glass-effect border-white/20 hover:shadow-lg transition-all duration-300 ${isFull ? 'border-destructive/50' : ''}`}
              >
                <CardHeader className={`pb-3 ${isFull ? 'bg-gradient-to-r from-destructive/20 to-destructive/10' : 'bg-gradient-to-r from-metro-blue/10 to-metro-green/10'}`}>
                  <div className="flex items-center gap-2">
                    <ParkingCircle className={`h-5 w-5 ${isFull ? 'text-destructive' : 'text-metro-blue'}`} />
                    <CardTitle className="text-lg">{station.station_name}</CardTitle>
                  </div>
                  {/* Station Status Badge */}
                  <div className="mt-2">
                    {isFull ? (
                      <Badge variant="destructive" className="text-sm px-3 py-1 font-bold">
                        FULL
                      </Badge>
                    ) : (
                      <Badge className="bg-metro-green text-white text-sm px-3 py-1 font-semibold">
                        {totalAvailable} Slots Available
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {twoWheeler && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bike className="h-4 w-4" />
                        <span className="text-sm">Two Wheeler</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {twoWheelerAvailable > 0 ? (
                          <span className="text-sm font-medium text-metro-green">{twoWheelerAvailable} available</span>
                        ) : (
                          <span className="text-sm font-medium text-destructive">Full</span>
                        )}
                      </div>
                    </div>
                  )}
                  {fourWheeler && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span className="text-sm">Four Wheeler</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {fourWheelerAvailable > 0 ? (
                          <span className="text-sm font-medium text-metro-green">{fourWheelerAvailable} available</span>
                        ) : (
                          <span className="text-sm font-medium text-destructive">Full</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Booking Form */}
        <Card className="glass-effect border-white/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-metro-green/10 to-metro-blue/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-6 w-6 text-metro-green" />
              Book Parking Slot
            </CardTitle>
            <CardDescription className="text-base">
              Reserve your parking spot in advance with smart pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="station">Station</Label>
                <Select value={selectedStation} onValueChange={setSelectedStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stationsWithParking.map((station) => (
                      <SelectItem key={station.station_id} value={station.station_id}>
                        {station.station_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle-type">Vehicle Type</Label>
                <Select value={vehicleType} onValueChange={(value: 'two_wheeler' | 'four_wheeler') => setVehicleType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="two_wheeler">Two Wheeler</SelectItem>
                    <SelectItem value="four_wheeler">Four Wheeler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Amount
                </Label>
                <Card className="bg-gradient-to-r from-metro-green/10 to-metro-blue/10 border-metro-green/20 p-4">
                  <div className="text-3xl font-bold text-metro-green">
                    ₹{calculateAmount()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {vehicleType === 'two_wheeler' ? '₹10/hour' : '₹20/hour'}
                  </p>
                </Card>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Red Warning Box - Station Full Alert */}
            {isSelectedStationFull && selectedStationInfo && (
              <div 
                className="animate-fade-in rounded-lg p-4 w-full"
                style={{
                  background: '#ffdddd',
                  borderLeft: '6px solid #ff4d4d',
                  color: '#b30000',
                }}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">
                      ⚠️ Parking slots at {selectedStationInfo.station_name} are fully occupied.
                    </p>
                    <p className="text-sm mt-1">
                      {vehicleType === 'two_wheeler' ? 'Two-wheeler' : 'Four-wheeler'} parking is currently unavailable at this station.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Green Suggestion Box - Nearby Stations */}
            {isSelectedStationFull && nearbyStationsWithSlots.length > 0 && (
              <div 
                className="animate-fade-in rounded-lg p-4 w-full mt-4"
                style={{
                  background: '#d4edda',
                  borderLeft: '6px solid #28a745',
                  color: '#155724',
                }}
              >
                <div className="flex items-start gap-3">
                  <Navigation className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-3">
                      ✅ Slots are available at the next nearest stations.
                    </p>
                    
                    <div className="space-y-3">
                      {nearbyStationsWithSlots.map((station, index) => (
                        <div 
                          key={station.station_id} 
                          className="bg-white/50 rounded-lg p-3 border border-green-200"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <p className="font-semibold text-base flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {station.station_name}
                                {index === 0 && (
                                  <Badge className="bg-green-600 text-white text-xs">Nearest</Badge>
                                )}
                              </p>
                              <p className="text-sm mt-1">
                                📍 Distance: <strong>{station.distance} km</strong> from {selectedStationInfo?.station_name}
                              </p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              {/* Red link for next arrival metros */}
                              <button
                                onClick={() => setExpandedArrivals(expandedArrivals === station.station_name ? null : station.station_name)}
                                className="text-metro-red hover:underline text-sm font-medium cursor-pointer"
                              >
                                {expandedArrivals === station.station_name ? 'hide arrivals' : 'show next arrival metros from this station'}
                              </button>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Bike className="h-4 w-4" />
                                  {station.twoWheelerAvailable} slots
                                </span>
                                <span className="flex items-center gap-1">
                                  <Car className="h-4 w-4" />
                                  {station.fourWheelerAvailable} slots
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Metro Arrivals Display */}
                          {expandedArrivals === station.station_name && METRO_ARRIVALS[station.station_name] && (
                            <div className="mt-3 p-3 bg-white/80 rounded-lg border border-metro-red/20">
                              <p className="text-sm font-semibold text-metro-red mb-2 flex items-center gap-1">
                                🚇 Next Metro Arrivals at {station.station_name}
                              </p>
                              <div className="space-y-2">
                                {METRO_ARRIVALS[station.station_name].map((arrival, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                    <span className="font-medium">{arrival.trainId} → {arrival.destination}</span>
                                    <span className="text-metro-red font-bold">{arrival.arrivalTime}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="text-sm">
                              💡 {vehicleType === 'two_wheeler' 
                                ? `${station.twoWheelerAvailable} two-wheeler slots available` 
                                : `${station.fourWheelerAvailable} four-wheeler slots available`
                              }. Consider booking here!
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 bg-white hover:bg-green-50 border-green-400 text-green-700"
                              onClick={() => handleSelectNearbyStation(station.station_id)}
                            >
                              Book at {station.station_name}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleBooking} 
              disabled={isLoading || isSelectedStationFull} 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-metro-green to-metro-blue hover:from-metro-green/90 hover:to-metro-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Booking...
                </div>
              ) : isSelectedStationFull ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Station Full - Select Another
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ParkingCircle className="h-5 w-5" />
                  Book Parking Slot - ₹{calculateAmount()}
                </div>
              )}
            </Button>

            {/* Book Ticket Link */}
            {selectedStation && !isSelectedStationFull && (
              <div className="text-center mt-3">
                <button
                  onClick={() => {
                    // Get the station name for the selected station
                    const stationData = parkingData.find(p => p.station_id === selectedStation);
                    if (stationData) {
                      // Save to journey state (for persistence)
                      setParkingStation(stationData.station_name);
                      // Navigate with state (like Route Optimizer does) for immediate reflection
                      navigate('/booking', { 
                        state: { 
                          source: stationData.station_name 
                        } 
                      });
                    } else {
                      navigate('/booking');
                    }
                  }}
                  className="text-metro-green hover:text-metro-green/80 hover:underline text-sm font-medium cursor-pointer transition-colors"
                >
                  → Also book ticket for this ride
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Bookings */}
        {userBookings.length > 0 && (
          <Card className="glass-effect border-white/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-metro-blue/10 to-metro-green/10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="h-6 w-6 text-metro-blue" />
                My Parking Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{booking.station_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.vehicle_type === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler'} • Slot #{booking.slot_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.booking_date} • {booking.start_time} - {booking.end_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{booking.amount}</p>
                      <Badge variant="secondary">{booking.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default SmartParking;
