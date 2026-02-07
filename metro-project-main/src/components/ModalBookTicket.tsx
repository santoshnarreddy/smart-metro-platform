import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Train, 
  MapPin, 
  Clock, 
  CreditCard, 
  Users, 
  ArrowRight,
  Calendar 
} from "lucide-react";

interface ModalBookTicketProps {
  children: React.ReactNode;
  user?: any;
}

const ModalBookTicket = ({ children, user }: ModalBookTicketProps) => {
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [journeyDate, setJourneyDate] = useState("");
  const [journeyTime, setJourneyTime] = useState("");
  const navigate = useNavigate();

  const stations = [
    "Miyapur", "JNTU College", "KPHB Colony", "Kukatpally", "Dr. B.R. Ambedkar Balanagar",
    "Moosapet", "Bharatnagar", "Erragadda", "ESI Hospital", "S.R. Nagar", "Ameerpet",
    "Punjagutta", "Irrum Manzil", "Khairatabad", "Lakdi-Ka-Pul", "Assembly", "Nampally",
    "Gandhi Bhavan", "Osmania Medical College", "MG Bus Station", "Malakpet", "New Market",
    "Musarambagh", "Dilsukhnagar", "Chaitanyapuri", "Victoria Memorial", "L.B. Nagar",
    "Nagole", "Uppal", "Stadium", "NGRI", "Habsiguda", "Tarnaka", "Mettuguda",
    "Secunderabad East", "Parade Ground", "Paradise", "Rasoolpura", "Prakash Nagar",
    "Begumpet", "Madhura Nagar", "Yusufguda", "Jubilee Hills Checkpost", "Jubilee Hills",
    "Peddamma Gudi", "Madhapur", "Durgam Cheruvu", "Hi-Tech City", "Raidurg"
  ];

  const handleBooking = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!fromStation || !toStation || !journeyDate) {
      return;
    }

    // Navigate to booking page with pre-filled data
    navigate("/booking", { 
      state: { 
        fromStation, 
        toStation, 
        passengers, 
        journeyDate, 
        journeyTime 
      } 
    });
  };

  const calculateFare = () => {
    if (!fromStation || !toStation) return 0;
    // Simple fare calculation (in real app, this would be more complex)
    const basefare = 10;
    const distance = Math.abs(stations.indexOf(fromStation) - stations.indexOf(toStation));
    return basefare + (distance * 2);
  };

  const fare = calculateFare();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Train className="h-6 w-6 text-metro-blue" />
            Quick Ticket Booking
          </DialogTitle>
          <DialogDescription>
            Book your metro ticket quickly with just a few details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Station Selection */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-metro-green" />
                From Station
              </Label>
              <Select value={fromStation} onValueChange={setFromStation}>
                <SelectTrigger className="focus-ring">
                  <SelectValue placeholder="Select departure station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station} value={station}>
                      {station}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-metro-red" />
                To Station
              </Label>
              <Select value={toStation} onValueChange={setToStation}>
                <SelectTrigger className="focus-ring">
                  <SelectValue placeholder="Select destination station" />
                </SelectTrigger>
                <SelectContent>
                  {stations
                    .filter(station => station !== fromStation)
                    .map((station) => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Journey Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="passengers" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-metro-blue" />
                Passengers
              </Label>
              <Select value={passengers} onValueChange={setPassengers}>
                <SelectTrigger className="focus-ring">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-metro-green" />
                Journey Date
              </Label>
              <Input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="focus-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-metro-red" />
                Preferred Time
              </Label>
              <Input
                type="time"
                value={journeyTime}
                onChange={(e) => setJourneyTime(e.target.value)}
                className="focus-ring"
              />
            </div>
          </div>

          {/* Journey Summary */}
          {fromStation && toStation && (
            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
              <h4 className="mb-3 font-semibold">Journey Summary</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Route</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {fromStation}
                    </Badge>
                    <ArrowRight className="h-3 w-3" />
                    <Badge variant="outline" className="text-xs">
                      {toStation}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Passengers</span>
                  <span className="font-medium">{passengers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Fare</span>
                  <span className="text-lg font-bold text-metro-blue">
                    ₹{fare * parseInt(passengers)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleBooking}
              disabled={!fromStation || !toStation || !journeyDate}
              className="flex-1 bg-gradient-metro-blue hover:shadow-glow-blue focus-ring shimmer"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {user ? "Proceed to Payment" : "Sign In & Book"}
            </Button>
          </div>

          {!user && (
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Sign in to save your preferences and get personalized recommendations
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalBookTicket;