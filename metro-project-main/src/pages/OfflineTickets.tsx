import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Download, QrCode, Wifi, WifiOff, CheckCircle, AlertCircle, Scan, Ticket, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import StationSelector from "@/components/StationSelector";
import PageLayout from "@/components/PageLayout";

interface Station {
  id: string;
  name: string;
}

interface OfflineTicket {
  id: string;
  ticket_id: string;
  source_station: string;
  destination_station: string;
  passenger_count: number;
  travel_date: string;
  travel_time: string;
  fare_amount: number;
  qr_data: string;
  is_validated: boolean;
  created_at: string;
  expires_at: string;
}

// Complete Hyderabad Metro stations data - All Lines
const OFFLINE_METRO_STATIONS: Station[] = [
  // Blue Line (Nagole to Raidurg)
  { id: "1", name: "Nagole" },
  { id: "2", name: "Uppal" },
  { id: "3", name: "Survey Settlement" },
  { id: "4", name: "NGRI" },
  { id: "5", name: "Habsiguda" },
  { id: "6", name: "Tarnaka" },
  { id: "7", name: "Mettuguda" },
  { id: "8", name: "Secunderabad East" },
  { id: "9", name: "Parade Ground" },
  { id: "10", name: "Secunderabad West" },
  { id: "11", name: "Gandhi Hospital" },
  { id: "12", name: "Musheerabad" },
  { id: "13", name: "RTC X Roads" },
  { id: "14", name: "Chikkadpally" },
  { id: "15", name: "Narayanguda" },
  { id: "16", name: "Sultan Bazar" },
  { id: "17", name: "MG Bus Station" },
  { id: "18", name: "Malakpet" },
  { id: "19", name: "New Market" },
  { id: "20", name: "Musarambagh" },
  { id: "21", name: "Dilsukhnagar" },
  { id: "22", name: "Chaitanyapuri" },
  { id: "23", name: "Victoria Memorial" },
  { id: "24", name: "LB Nagar" },
  
  // Red Line (Miyapur to LB Nagar)
  { id: "25", name: "Miyapur" },
  { id: "26", name: "JNTU College" },
  { id: "27", name: "KPHB Colony" },
  { id: "28", name: "Kukatpally" },
  { id: "29", name: "Balanagar" },
  { id: "30", name: "Moosapet" },
  { id: "31", name: "Bharat Nagar" },
  { id: "32", name: "Erragadda" },
  { id: "33", name: "ESI Hospital" },
  { id: "34", name: "SR Nagar" },
  { id: "35", name: "Ameerpet" },
  { id: "36", name: "Punjagutta" },
  { id: "37", name: "Irrum Manzil" },
  { id: "38", name: "Khairatabad" },
  { id: "39", name: "Lakdikapool" },
  { id: "40", name: "Assembly" },
  { id: "41", name: "Nampally" },
  { id: "42", name: "Gandhi Bhavan" },
  { id: "43", name: "Osmania Medical College" },
  { id: "44", name: "MG Bus Station" },
  
  // Green Line (Nagole to Shilparamam/Hi-Tech City)
  { id: "45", name: "JBS Parade Ground" },
  { id: "46", name: "Secunderabad" },
  { id: "47", name: "Gandhi Hospital" },
  { id: "48", name: "Musheerabad" },
  { id: "49", name: "RTC X Roads" },
  { id: "50", name: "Chikkadpally" },
  { id: "51", name: "Narayanguda" },
  { id: "52", name: "Sultan Bazar" },
  { id: "53", name: "MG Bus Station" },
  { id: "54", name: "Osmania Medical College" },
  { id: "55", name: "Gandhi Bhavan" },
  { id: "56", name: "Nampally" },
  { id: "57", name: "Assembly" },
  { id: "58", name: "Lakdikapool" },
  { id: "59", name: "Khairatabad" },
  { id: "60", name: "Irrum Manzil" },
  { id: "61", name: "Punjagutta" },
  { id: "62", name: "Ameerpet" },
  { id: "63", name: "Begumpet" },
  { id: "64", name: "Prakash Nagar" },
  { id: "65", name: "Rasoolpura" },
  { id: "66", name: "JBS Parade Ground" },
  
  // Additional Important Stations
  { id: "67", name: "Raidurg" },
  { id: "68", name: "Hi-Tech City" },
  { id: "69", name: "Madhapur" },
  { id: "70", name: "Durgam Cheruvu" },
  { id: "71", name: "Jubilee Hills Checkpost" },
  { id: "72", name: "Jubilee Hills" },
  { id: "73", name: "Yusufguda" },
  { id: "74", name: "Madhura Nagar" },
  { id: "75", name: "Peddamma Gudi" },
];

const OfflineTickets = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sourceStation, setSourceStation] = useState("");
  const [destinationStation, setDestinationStation] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [generatedTicket, setGeneratedTicket] = useState<any>(null);
  const [savedTickets, setSavedTickets] = useState<OfflineTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scanResult, setScanResult] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    checkAuth();
    loadSavedTickets();
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadSavedTickets = () => {
    const saved = localStorage.getItem('offline-tickets');
    if (saved) {
      setSavedTickets(JSON.parse(saved));
    }
  };

  const calculateFare = () => {
    if (!sourceStation || !destinationStation) return 0;
    
    // Find source and destination stations
    const source = OFFLINE_METRO_STATIONS.find(s => s.id === sourceStation);
    const dest = OFFLINE_METRO_STATIONS.find(s => s.id === destinationStation);
    
    if (!source || !dest) return 0;
    
    // Extract station numbers from IDs for distance calculation
    const sourceNum = parseInt(source.id);
    const destNum = parseInt(dest.id);
    
    // Calculate distance based on station ID differences
    const distance = Math.abs(sourceNum - destNum);
    
    // Hyderabad Metro fare structure based on distance:
    // 1-3 stations: ₹10, 4-6 stations: ₹20, 7-12 stations: ₹30
    // 13-18 stations: ₹40, 19-25 stations: ₹50, 26+ stations: ₹60
    let baseFare = 10;
    if (distance <= 3) baseFare = 10;
    else if (distance <= 6) baseFare = 20;
    else if (distance <= 12) baseFare = 30;
    else if (distance <= 18) baseFare = 40;
    else if (distance <= 25) baseFare = 50;
    else baseFare = 60;
    
    return baseFare * passengerCount;
  };

  const generateTicketId = () => {
    return 'OFL' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const generateOfflineTicket = async () => {
    if (!sourceStation || !destinationStation || !travelDate || !travelTime) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (sourceStation === destinationStation) {
      toast({
        title: "Error",
        description: "Source and destination stations must be different",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const ticketId = generateTicketId();
      const fareAmount = calculateFare();
      const sourceStationName = OFFLINE_METRO_STATIONS.find(s => s.id === sourceStation)?.name || "";
      const destinationStationName = OFFLINE_METRO_STATIONS.find(s => s.id === destinationStation)?.name || "";
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Ticket expires in 24 hours
      
      const ticketData = {
        id: crypto.randomUUID(),
        ticket_id: ticketId,
        source_station: sourceStationName,
        destination_station: destinationStationName,
        passenger_count: passengerCount,
        travel_date: travelDate,
        travel_time: travelTime,
        fare_amount: fareAmount,
        is_validated: false,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        qr_data: JSON.stringify({
          ticketId,
          source: sourceStationName,
          destination: destinationStationName,
          passengers: passengerCount,
          date: travelDate,
          time: travelTime,
          fare: fareAmount,
          expires: expiresAt.toISOString()
        })
      };

      // Generate QR code
      const qrUrl = await QRCode.toDataURL(ticketData.qr_data, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrUrl);
      setGeneratedTicket(ticketData);
      
      // Save to localStorage for offline access
      const currentTickets = JSON.parse(localStorage.getItem('offline-tickets') || '[]');
      currentTickets.unshift(ticketData);
      localStorage.setItem('offline-tickets', JSON.stringify(currentTickets));
      setSavedTickets(currentTickets);

      toast({
        title: "Success",
        description: `Offline ticket ${ticketId} generated successfully!`,
      });

      // Reset form
      setSourceStation("");
      setDestinationStation("");
      setPassengerCount(1);
      setTravelDate("");
      setTravelTime("");
    } catch (error) {
      console.error('Error generating offline ticket:', error);
      toast({
        title: "Error",
        description: "Failed to generate offline ticket",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateTicket = async () => {
    if (!scanResult.trim()) {
      toast({
        title: "Error",
        description: "Please enter QR code data to validate",
        variant: "destructive",
      });
      return;
    }

    if (!isOnline) {
      toast({
        title: "Error",
        description: "Internet connection required for ticket validation",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Parse QR data
      const qrData = JSON.parse(scanResult);
      
      // Check if ticket exists in database
      const { data: existingTicket, error: fetchError } = await supabase
        .from('offline_tickets')
        .select('*')
        .eq('ticket_id', qrData.ticketId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Check expiry
      const now = new Date();
      const expiryDate = new Date(qrData.expires);
      
      if (now > expiryDate) {
        setValidationResult({
          isValid: false,
          message: "Ticket has expired",
          ticket: qrData
        });
        return;
      }

      if (existingTicket && existingTicket.is_validated) {
        setValidationResult({
          isValid: false,
          message: "Ticket has already been used",
          ticket: qrData
        });
        return;
      }

      // If ticket doesn't exist in database, create it
      if (!existingTicket) {
        const { error: insertError } = await supabase
          .from('offline_tickets')
          .insert({
            ticket_id: qrData.ticketId,
            user_id: user?.id,
            source_station: qrData.source,
            destination_station: qrData.destination,
            passenger_count: qrData.passengers,
            travel_date: qrData.date,
            travel_time: qrData.time,
            fare_amount: qrData.fare,
            qr_data: scanResult,
            expires_at: qrData.expires
          });

        if (insertError) throw insertError;
      }

      // Mark as validated
      const { error: updateError } = await supabase
        .from('offline_tickets')
        .update({ 
          is_validated: true,
          validated_at: new Date().toISOString()
        })
        .eq('ticket_id', qrData.ticketId);

      if (updateError) throw updateError;

      setValidationResult({
        isValid: true,
        message: "Ticket validated successfully",
        ticket: qrData
      });

      toast({
        title: "Success",
        description: "Ticket validated successfully!",
      });

    } catch (error) {
      console.error('Error validating ticket:', error);
      setValidationResult({
        isValid: false,
        message: "Invalid QR code or ticket format",
        ticket: null
      });
      toast({
        title: "Error",
        description: "Invalid QR code or ticket format",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTicket = (ticket: any) => {
    const ticketData = `
Metro Offline Ticket
Ticket ID: ${ticket.ticket_id}
From: ${ticket.source_station}
To: ${ticket.destination_station}
Passengers: ${ticket.passenger_count}
Date: ${ticket.travel_date}
Time: ${ticket.travel_time}
Fare: ₹${ticket.fare_amount}
Generated: ${new Date(ticket.created_at).toLocaleDateString()}
Expires: ${new Date(ticket.expires_at).toLocaleDateString()}
    `.trim();

    const blob = new Blob([ticketData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticket.ticket_id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout 
      title="Offline QR Tickets" 
      subtitle="Generate tickets offline and validate when connected"
      showBackButton={false}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Connection Status Banner */}
        <Card className={`glass-effect border-white/20 ${isOnline ? 'bg-metro-green/10' : 'bg-accent-yellow/10'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3">
              {isOnline ? (
                <>
                  <Wifi className="h-5 w-5 text-metro-green" />
                  <span className="font-medium text-metro-green">Connected - Full functionality available</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-accent-yellow" />
                  <span className="font-medium text-accent-yellow">Offline Mode - Generate tickets only</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generate Ticket Form */}
        <Card className="glass-effect border-white/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-metro-blue/10 to-metro-green/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Smartphone className="h-6 w-6 text-metro-blue" />
              Generate Offline Ticket
            </CardTitle>
            <CardDescription className="text-base">
              Create a QR ticket that works even without internet connection - perfect for underground travel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <StationSelector
                stations={OFFLINE_METRO_STATIONS}
                value={sourceStation}
                onValueChange={setSourceStation}
                label="From Station"
                placeholder="Search source station..."
              />
              
              <StationSelector
                stations={OFFLINE_METRO_STATIONS}
                value={destinationStation}
                onValueChange={setDestinationStation}
                label="To Station"
                placeholder="Search destination station..."
              />

              <div className="space-y-2">
                <Label htmlFor="passengers">Passengers</Label>
                <Select value={passengerCount.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} Passenger{count > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fare Amount</Label>
                <div className="text-2xl font-bold text-primary">
                  ₹{calculateFare()}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Travel Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Travel Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={generateOfflineTicket} 
              disabled={isLoading} 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-metro-blue to-metro-green hover:from-metro-blue/90 hover:to-metro-green/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Generate Offline Ticket - ₹{calculateFare()}
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Ticket Display */}
        {generatedTicket && qrCodeUrl && (
          <Card className="glass-effect border-white/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-metro-green/10 to-metro-blue/10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="h-6 w-6 text-metro-green" />
                Ticket Generated Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
              <div className="space-y-2">
                <p className="font-medium">Ticket ID: {generatedTicket.ticket_id}</p>
                <p>{generatedTicket.source_station} → {generatedTicket.destination_station}</p>
                <p>{generatedTicket.passenger_count} Passenger{generatedTicket.passenger_count > 1 ? 's' : ''} • ₹{generatedTicket.fare_amount}</p>
                <p className="text-sm text-muted-foreground">
                  {generatedTicket.travel_date} at {generatedTicket.travel_time}
                </p>
              </div>
              <Button onClick={() => downloadTicket(generatedTicket)} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Ticket
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ticket Validation */}
        <Card className="glass-effect border-white/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-metro-red/10 to-accent-yellow/10">
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-metro-red" />
              Validate Ticket
            </CardTitle>
            <CardDescription>
              {isOnline ? "Scan or paste QR code data to validate tickets" : "Internet connection required for validation"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-data">QR Code Data</Label>
              <Input
                id="qr-data"
                placeholder="Paste QR code data here..."
                value={scanResult}
                onChange={(e) => setScanResult(e.target.value)}
                disabled={!isOnline}
              />
            </div>
            <Button 
              onClick={validateTicket} 
              disabled={!isOnline || isLoading || !scanResult.trim()}
              className="w-full"
            >
              <Scan className="h-4 w-4 mr-2" />
              Validate Ticket
            </Button>

            {validationResult && (
              <Card className={`${validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                      {validationResult.message}
                    </span>
                  </div>
                  {validationResult.ticket && (
                    <div className="text-sm space-y-1">
                      <p>Ticket ID: {validationResult.ticket.ticketId}</p>
                      <p>{validationResult.ticket.source} → {validationResult.ticket.destination}</p>
                      <p>{validationResult.ticket.passengers} Passenger(s) • ₹{validationResult.ticket.fare}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Saved Tickets */}
        {savedTickets.length > 0 && (
          <Card className="glass-effect border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Your Offline Tickets ({savedTickets.length})
              </CardTitle>
              <CardDescription>
                Previously generated tickets stored locally on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedTickets.slice(0, 5).map((ticket) => (
                <Card key={ticket.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{ticket.ticket_id}</Badge>
                        {ticket.is_validated && <Badge variant="default">Validated</Badge>}
                      </div>
                      <p className="font-medium">{ticket.source_station} → {ticket.destination_station}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.passenger_count} Passenger(s) • ₹{ticket.fare_amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString()} • 
                        Expires: {new Date(ticket.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => downloadTicket(ticket)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default OfflineTickets;