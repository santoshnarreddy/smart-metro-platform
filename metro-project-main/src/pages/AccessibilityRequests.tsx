import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Phone, Clock, MapPin, User, CheckCircle, Star, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AssistanceRequest {
  id: string;
  requester_id: string;
  volunteer_id: string | null;
  station_name: string;
  assistance_type: string;
  description: string;
  contact_number: string;
  emergency_contact: string | null;
  scheduled_time: string | null;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  priority_level: number;
  special_instructions: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  rating: number | null;
  feedback: string | null;
  created_at: string;
  requester_profile?: {
    full_name: string;
    phone_number: string | null;
  } | null;
  volunteer_profile?: {
    full_name: string;
    phone_number: string | null;
  } | null;
}

interface Profile {
  user_id: string;
  full_name: string;
  phone_number: string | null;
  role: 'passenger' | 'volunteer' | 'admin';
}

const AccessibilityRequests = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myRequests, setMyRequests] = useState<AssistanceRequest[]>([]);
  const [availableRequests, setAvailableRequests] = useState<AssistanceRequest[]>([]);
  const [myVolunteerRequests, setMyVolunteerRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-requests");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchRequests();
    }
  }, [profile]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (profileData) {
        setProfile(profileData);
      } else {
        navigate('/accessibility-assistance');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!profile) return;

    try {
      // Fetch user's own requests
      const { data: userRequests, error: userError } = await supabase
        .from('assistance_requests')
        .select(`
          *,
          volunteer_profile:profiles!assistance_requests_volunteer_id_fkey(full_name, phone_number)
        `)
        .eq('requester_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      setMyRequests((userRequests as any) || []);

      // If user is a volunteer, fetch available requests and their accepted requests
      if (profile.role === 'volunteer' || profile.role === 'admin') {
        // Available requests (pending, not assigned to anyone)
        const { data: available, error: availableError } = await supabase
          .from('assistance_requests')
          .select(`
            *,
            requester_profile:profiles!assistance_requests_requester_id_fkey(full_name, phone_number)
          `)
          .eq('status', 'pending')
          .is('volunteer_id', null)
          .order('priority_level', { ascending: false })
          .order('created_at', { ascending: true });

        if (availableError) throw availableError;
        setAvailableRequests((available as any) || []);

        // Requests accepted by this volunteer
        const { data: volunteerRequests, error: volunteerError } = await supabase
          .from('assistance_requests')
          .select(`
            *,
            requester_profile:profiles!assistance_requests_requester_id_fkey(full_name, phone_number)
          `)
          .eq('volunteer_id', profile.user_id)
          .order('created_at', { ascending: false });

        if (volunteerError) throw volunteerError;
        setMyVolunteerRequests((volunteerRequests as any) || []);
      }

    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load assistance requests",
        variant: "destructive",
      });
    }
  };

  const acceptRequest = async (requestId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('assistance_requests')
        .update({
          volunteer_id: profile.user_id,
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Accepted",
        description: "You have successfully accepted this assistance request",
      });

      fetchRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'in_progress') {
        updateData.status = 'in_progress';
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('assistance_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Request marked as ${newStatus.replace('_', ' ')}`,
      });

      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAssistanceType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderRequestCard = (request: AssistanceRequest, isVolunteerView = false) => (
    <Card key={request.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{formatAssistanceType(request.assistance_type)}</CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {request.station_name}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDateTime(request.created_at)}
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(request.status)}>
              {request.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline">
              Priority {request.priority_level}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">{request.description}</p>
          
          {request.special_instructions && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Special Instructions:</p>
              <p className="text-sm">{request.special_instructions}</p>
            </div>
          )}

          {request.scheduled_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Scheduled: {formatDateTime(request.scheduled_time)}</span>
            </div>
          )}

          {/* Contact Information */}
          {isVolunteerView && request.requester_profile && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Requester Contact:</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{request.requester_profile.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{request.contact_number}</span>
                </div>
                {request.emergency_contact && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>Emergency: {request.emergency_contact}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Volunteer Information */}
          {!isVolunteerView && request.volunteer_profile && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Volunteer:</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{request.volunteer_profile.full_name}</span>
                </div>
                {request.volunteer_profile.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{request.volunteer_profile.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {/* For available requests (volunteer view) */}
            {isVolunteerView && request.status === 'pending' && !request.volunteer_id && (
              <Button onClick={() => acceptRequest(request.id)}>
                Accept Request
              </Button>
            )}

            {/* For accepted requests (volunteer view) */}
            {isVolunteerView && request.volunteer_id === profile?.user_id && request.status === 'accepted' && (
              <Button onClick={() => updateRequestStatus(request.id, 'in_progress')}>
                Start Assistance
              </Button>
            )}

            {isVolunteerView && request.volunteer_id === profile?.user_id && request.status === 'in_progress' && (
              <Button onClick={() => updateRequestStatus(request.id, 'completed')}>
                Mark Complete
              </Button>
            )}

            {/* For user's own requests */}
            {!isVolunteerView && request.status === 'pending' && (
              <Button 
                variant="outline" 
                onClick={() => updateRequestStatus(request.id, 'cancelled')}
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Accessibility Requests</h1>
            <p className="text-muted-foreground">Manage assistance requests and help others</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <Button onClick={() => navigate('/accessibility-assistance')}>
            <Heart className="h-4 w-4 mr-2" />
            Request Assistance
          </Button>
          {profile?.role === 'passenger' && (
            <Button variant="outline" onClick={() => navigate('/volunteer-signup')}>
              Become a Volunteer
            </Button>
          )}
          {(profile?.role === 'volunteer' || profile?.role === 'admin') && (
            <Button variant="outline" onClick={() => navigate('/volunteer-signup')}>
              Edit Volunteer Profile
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            {(profile?.role === 'volunteer' || profile?.role === 'admin') && (
              <>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="my-volunteer">My Volunteer Work</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="my-requests" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Assistance Requests</h2>
              {myRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No assistance requests yet</p>
                    <Button className="mt-4" onClick={() => navigate('/accessibility-assistance')}>
                      Create Your First Request
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myRequests.map(request => renderRequestCard(request, false))
              )}
            </div>
          </TabsContent>

          {(profile?.role === 'volunteer' || profile?.role === 'admin') && (
            <>
              <TabsContent value="available" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Available Requests</h2>
                  {availableRequests.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No pending requests at the moment</p>
                      </CardContent>
                    </Card>
                  ) : (
                    availableRequests.map(request => renderRequestCard(request, true))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="my-volunteer" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">My Volunteer Work</h2>
                  {myVolunteerRequests.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">You haven't accepted any requests yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    myVolunteerRequests.map(request => renderRequestCard(request, true))
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AccessibilityRequests;