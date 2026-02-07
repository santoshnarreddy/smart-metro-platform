import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, MapPin, Calendar, Clock, Users, Car, Bike } from "lucide-react";
import QRCode from "qrcode";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState("");
  
  const { ticketBooking, parkingBooking, sourceStationName, destinationStationName, parkingStationName } = location.state || {};

  useEffect(() => {
    if (!ticketBooking) {
      navigate("/");
      return;
    }

    // Generate QR code for ticket
    const qrData = {
      ticketId: ticketBooking.id,
      userId: ticketBooking.user_id,
      source: sourceStationName,
      destination: destinationStationName,
      date: ticketBooking.travel_date,
      time: ticketBooking.travel_time,
      passengers: ticketBooking.passenger_count,
      amount: ticketBooking.total_amount
    };

    QRCode.toDataURL(JSON.stringify(qrData))
      .then(url => setQrCode(url))
      .catch(err => console.error('Error generating QR code:', err));
  }, [ticketBooking, navigate, sourceStationName, destinationStationName]);

  if (!ticketBooking) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Booking Confirmed!</CardTitle>
            <CardDescription className="text-green-600">
              Your metro ticket has been successfully booked
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ticket Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-mono text-sm">{ticketBooking.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {ticketBooking.booking_status}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{sourceStationName}</strong> → <strong>{destinationStationName}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(ticketBooking.travel_date)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatTime(ticketBooking.travel_time)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{ticketBooking.passenger_count} Passenger{ticketBooking.passenger_count > 1 ? 's' : ''}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold text-lg">₹{ticketBooking.total_amount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Parking Details */}
        {parkingBooking && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Parking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Parking ID</p>
                  <p className="font-mono text-sm">{parkingBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {parkingBooking.booking_status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>{parkingStationName}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {parkingBooking.vehicle_type === 'two_wheeler' ? (
                    <Bike className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Car className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm capitalize">{parkingBooking.vehicle_type.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(parkingBooking.booking_date)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code */}
        {qrCode && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">QR Code</CardTitle>
              <CardDescription className="text-center">
                Show this QR code at the station for entry
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                <img src={qrCode} alt="Booking QR Code" className="mx-auto" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Booking ID: {ticketBooking.id}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.print()} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Ticket
          </Button>
          <Button onClick={() => navigate("/")} className="flex-1">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;