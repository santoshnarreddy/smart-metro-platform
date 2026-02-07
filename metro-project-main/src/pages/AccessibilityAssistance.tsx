import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Phone, Calendar, Clock, User, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  user_id: string;
  full_name: string;
  phone_number: string | null;
  role: 'passenger' | 'volunteer' | 'admin';
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

const assistanceTypes = [
  { value: 'wheelchair', label: 'Wheelchair Assistance' },
  { value: 'visual_impairment', label: 'Visual Impairment Support' },
  { value: 'hearing_impairment', label: 'Hearing Impairment Support' },
  { value: 'mobility_aid', label: 'Mobility Aid Support' },
  { value: 'elderly_support', label: 'Elderly Support' },
  { value: 'other', label: 'Other' }
];

const AccessibilityAssistance = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    station_name: '',
    assistance_type: '',
    description: '',
    contact_number: '',
    emergency_contact: '',
    scheduled_time: '',
    priority_level: 1,
    special_instructions: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
        // Pre-fill contact number if available
        if (profileData.phone_number) {
          setFormData(prev => ({ ...prev, contact_number: profileData.phone_number }));
        }
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.email || 'User',
            role: 'passenger'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          // Continue with a basic profile instead of failing
          setProfile({
            user_id: user.id,
            full_name: user.email || 'User',
            phone_number: null,
            role: 'passenger'
          } as Profile);
        } else {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't show error, just use basic profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          user_id: user.id,
          full_name: user.email || 'User',
          phone_number: null,
          role: 'passenger'
        } as Profile);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!formData.station_name || !formData.assistance_type || !formData.description || !formData.contact_number) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('assistance_requests')
        .insert({
          requester_id: profile.user_id,
          station_name: formData.station_name,
          assistance_type: formData.assistance_type as 'wheelchair' | 'visual_impairment' | 'hearing_impairment' | 'mobility_aid' | 'elderly_support' | 'other',
          description: formData.description,
          contact_number: formData.contact_number,
          emergency_contact: formData.emergency_contact || null,
          scheduled_time: formData.scheduled_time ? new Date(formData.scheduled_time).toISOString() : null,
          priority_level: formData.priority_level,
          special_instructions: formData.special_instructions || null
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your accessibility assistance request has been submitted successfully. A volunteer will contact you soon.",
      });

      // Reset form
      setFormData({
        station_name: '',
        assistance_type: '',
        description: '',
        contact_number: profile.phone_number || '',
        emergency_contact: '',
        scheduled_time: '',
        priority_level: 1,
        special_instructions: ''
      });

      // Navigate to view requests
      navigate('/accessibility-requests');

    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit assistance request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="container mx-auto p-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Accessibility Assistance</h1>
            <p className="text-muted-foreground">Request help for specially-abled passengers</p>
          </div>
        </div>

        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Request Assistance
            </CardTitle>
            <CardDescription>
              Fill out this form to request accessibility assistance at metro stations. Our verified volunteers will help you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Station Selection */}
              <div className="space-y-2">
                <Label htmlFor="station">Metro Station *</Label>
                <Select value={formData.station_name} onValueChange={(value) => handleInputChange('station_name', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metro station" />
                  </SelectTrigger>
                  <SelectContent>
                    {metroStations.map(station => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assistance Type */}
              <div className="space-y-2">
                <Label htmlFor="assistance-type">Type of Assistance *</Label>
                <Select value={formData.assistance_type} onValueChange={(value) => handleInputChange('assistance_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assistance type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assistanceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe the assistance you need..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="+91 9999999999"
                    value={formData.contact_number}
                    onChange={(e) => handleInputChange('contact_number', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Input
                    id="emergency"
                    type="tel"
                    placeholder="+91 8888888888"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                  />
                </div>
              </div>

              {/* Scheduled Time */}
              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Preferred Time (Optional)</Label>
                <Input
                  id="scheduled-time"
                  type="datetime-local"
                  value={formData.scheduled_time}
                  onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Priority Level */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={formData.priority_level.toString()} onValueChange={(value) => handleInputChange('priority_level', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Low Priority</SelectItem>
                    <SelectItem value="2">2 - Normal</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any additional information for the volunteer..."
                  value={formData.special_instructions}
                  onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Submit your assistance request with details</li>
                      <li>Our verified volunteers will see your request</li>
                      <li>A volunteer will contact you to confirm assistance</li>
                      <li>Meet the volunteer at the specified station</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/accessibility-requests')}
                  className="flex-1"
                >
                  View My Requests
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessibilityAssistance;