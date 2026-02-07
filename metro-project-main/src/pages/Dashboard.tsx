import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Train, 
  User, 
  CreditCard, 
  Clock, 
  MapPin, 
  Car,
  Calendar,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  Ticket,
  DollarSign,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QRCode from 'qrcode';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

interface OfflineTicket {
  id: string;
  ticket_id: string;
  source_station: string;
  destination_station: string;
  travel_date: string;
  travel_time: string;
  passenger_count: number;
  fare_amount: number;
  qr_data: string;
  is_validated: boolean;
  expires_at: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<OfflineTicket[]>([]);
  const [ticketQRCodes, setTicketQRCodes] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Fetch user profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(profileData);
      }

      // Fetch user's tickets
      const { data: ticketData, error: ticketError } = await supabase
        .from('offline_tickets')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (ticketError) {
        console.error('Error fetching tickets:', ticketError);
      } else if (ticketData) {
        setTickets(ticketData);
        // Generate QR codes for each ticket
        generateQRCodes(ticketData);
      }

      setLoading(false);
    };

    getUser();
  }, [navigate]);

  const generateQRCodes = async (ticketList: OfflineTicket[]) => {
    const qrCodes: Record<string, string> = {};
    for (const ticket of ticketList) {
      try {
        const qrDataUrl = await QRCode.toDataURL(ticket.qr_data, {
          width: 150,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        qrCodes[ticket.id] = qrDataUrl;
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    }
    setTicketQRCodes(qrCodes);
  };

  const isTicketExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getTicketStatus = (ticket: OfflineTicket) => {
    if (ticket.is_validated) return { label: 'Used', variant: 'secondary' as const };
    if (isTicketExpired(ticket.expires_at)) return { label: 'Expired', variant: 'destructive' as const };
    return { label: 'Active', variant: 'default' as const };
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const mockData = {
    recentTrips: [
      { id: 1, from: 'Central Station', to: 'Tech Park', date: '2024-01-15', amount: 45 },
      { id: 2, from: 'Mall Junction', to: 'University', date: '2024-01-14', amount: 30 },
      { id: 3, from: 'Airport', to: 'City Center', date: '2024-01-13', amount: 60 }
    ],
    monthlyStats: {
      trips: 23,
      spent: 1150,
      saved: 340,
      carbonSaved: 45
    },
    upcomingBookings: [
      { id: 1, type: 'Ticket', destination: 'Business District', time: '09:30 AM', date: 'Today' },
      { id: 2, type: 'Parking', location: 'Central Station', time: '02:00 PM', date: 'Tomorrow' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Train className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-lg">Smart Metro</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 shadow-elegant bg-gradient-primary text-primary-foreground">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarFallback className="bg-white/20 text-white text-xl">
                  {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {profile?.full_name || user?.email}!
                </h1>
                <p className="text-primary-foreground/80 mb-4">
                  Ready for your next metro journey? Here's your dashboard overview.
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Member since {new Date(profile?.created_at || user?.created_at).getFullYear()}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    Regular Traveler
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trips">Recent Trips</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="feature-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Ticket className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockData.monthlyStats.trips}</p>
                      <p className="text-sm text-muted-foreground">Trips This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹{mockData.monthlyStats.spent}</p>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹{mockData.monthlyStats.saved}</p>
                      <p className="text-sm text-muted-foreground">Money Saved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">🌱</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockData.monthlyStats.carbonSaved}kg</p>
                      <p className="text-sm text-muted-foreground">Carbon Saved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to get you started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    className="h-20 flex-col gap-2 bg-gradient-primary" 
                    onClick={() => navigate('/booking')}
                  >
                    <Train className="h-6 w-6" />
                    Book Ticket
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2" 
                    onClick={() => navigate('/smart-parking')}
                  >
                    <Car className="h-6 w-6" />
                    Book Parking
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2" 
                    onClick={() => navigate('/smart-card')}
                  >
                    <CreditCard className="h-6 w-6" />
                    Manage Card
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2" 
                    onClick={() => navigate('/route-optimizer')}
                  >
                    <MapPin className="h-6 w-6" />
                    Find Route
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Bookings */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Your scheduled trips and reservations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {booking.type === 'Ticket' ? (
                            <Train className="h-5 w-5 text-primary" />
                          ) : (
                            <Car className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{booking.type} - {booking.destination || booking.location}</p>
                          <p className="text-sm text-muted-foreground">{booking.date} at {booking.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{booking.date}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trips" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recent Trips</CardTitle>
                <CardDescription>Your metro journey history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.recentTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Train className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{trip.from} → {trip.to}</p>
                          <p className="text-sm text-muted-foreground">{trip.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{trip.amount}</p>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  My Tickets
                </CardTitle>
                <CardDescription>Your booked metro tickets with QR codes</CardDescription>
              </CardHeader>
              <CardContent>
                {tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tickets booked yet</p>
                    <Button className="mt-4 bg-gradient-primary" onClick={() => navigate('/booking')}>
                      Book a Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tickets.map((ticket) => {
                      const status = getTicketStatus(ticket);
                      return (
                        <Card key={ticket.id} className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                          <div className="bg-gradient-primary p-3 text-primary-foreground">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm">{ticket.ticket_id}</span>
                              <Badge variant={status.variant} className="text-xs">
                                {status.label}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            {/* Route Info */}
                            <div className="flex items-center gap-2 mb-4">
                              <div className="flex-1 text-center">
                                <p className="text-xs text-muted-foreground">From</p>
                                <p className="font-semibold text-sm truncate">{ticket.source_station}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 text-center">
                                <p className="text-xs text-muted-foreground">To</p>
                                <p className="font-semibold text-sm truncate">{ticket.destination_station}</p>
                              </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center mb-4">
                              {ticketQRCodes[ticket.id] ? (
                                <img 
                                  src={ticketQRCodes[ticket.id]} 
                                  alt="Ticket QR Code" 
                                  className="rounded-lg border p-1"
                                />
                              ) : (
                                <div className="w-[150px] h-[150px] bg-muted rounded-lg flex items-center justify-center">
                                  <QrCode className="h-8 w-8 text-muted-foreground animate-pulse" />
                                </div>
                              )}
                            </div>

                            {/* Ticket Details */}
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium">{new Date(ticket.travel_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Time</span>
                                <span className="font-medium">{ticket.travel_time}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Passengers</span>
                                <span className="font-medium">{ticket.passenger_count}</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-muted-foreground">Fare</span>
                                <span className="font-bold text-primary">₹{ticket.fare_amount}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Monthly Progress</CardTitle>
                  <CardDescription>Your metro usage this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Trips Goal</span>
                      <span>{mockData.monthlyStats.trips}/30</span>
                    </div>
                    <Progress value={(mockData.monthlyStats.trips / 30) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Budget Used</span>
                      <span>₹{mockData.monthlyStats.spent}/₹2000</span>
                    </div>
                    <Progress value={(mockData.monthlyStats.spent / 2000) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Environmental Impact</CardTitle>
                  <CardDescription>Your contribution to a greener city</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🌍</div>
                    <p className="text-2xl font-bold text-green-600">{mockData.monthlyStats.carbonSaved}kg CO₂</p>
                    <p className="text-sm text-muted-foreground">Carbon emissions saved this month</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Equivalent to planting {Math.floor(mockData.monthlyStats.carbonSaved / 10)} trees
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;