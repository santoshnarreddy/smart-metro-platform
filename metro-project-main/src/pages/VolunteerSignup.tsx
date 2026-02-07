import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, User, Phone, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  user_id: string;
  full_name: string;
  phone_number: string | null;
  role: 'passenger' | 'volunteer' | 'admin';
  is_verified_volunteer: boolean;
  specializations: string[] | null;
  availability_status: boolean;
}

const specializations = [
  { value: 'wheelchair', label: 'Wheelchair Assistance' },
  { value: 'visual_impairment', label: 'Visual Impairment Support' },
  { value: 'hearing_impairment', label: 'Hearing Impairment Support' },
  { value: 'mobility_aid', label: 'Mobility Aid Support' },
  { value: 'elderly_support', label: 'Elderly Support' },
  { value: 'other', label: 'Other' }
];

const VolunteerSignup = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    selectedSpecializations: [] as string[],
    availability_status: true
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
        
        // Pre-fill form if profile exists
        setFormData({
          full_name: profileData.full_name || '',
          phone_number: profileData.phone_number || '',
          selectedSpecializations: profileData.specializations || [],
          availability_status: profileData.availability_status
        });

        // If already a volunteer, just show the form with pre-filled data
        // User can still view and update their volunteer profile
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
            role: 'passenger',
            is_verified_volunteer: false,
            specializations: null,
            availability_status: true
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
          role: 'passenger',
          is_verified_volunteer: false,
          specializations: null,
          availability_status: true
        } as Profile);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSpecializations: prev.selectedSpecializations.includes(specialization)
        ? prev.selectedSpecializations.filter(s => s !== specialization)
        : [...prev.selectedSpecializations, specialization]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    // Validation
    if (!formData.full_name || !formData.phone_number || formData.selectedSpecializations.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select at least one specialization",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const isAlreadyVolunteer = profile.role === 'volunteer' || profile.role === 'admin';
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          role: isAlreadyVolunteer ? profile.role : 'volunteer',
          specializations: formData.selectedSpecializations,
          availability_status: formData.availability_status,
          is_verified_volunteer: isAlreadyVolunteer ? profile.is_verified_volunteer : false
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: isAlreadyVolunteer ? "Profile Updated" : "Application Submitted",
        description: isAlreadyVolunteer 
          ? "Your volunteer profile has been updated successfully."
          : "Your volunteer application has been submitted. You'll be notified once it's approved.",
      });

      navigate('/accessibility-requests');

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit volunteer application. Please try again.",
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Become a Volunteer</h1>
            <p className="text-muted-foreground">Help specially-abled passengers at metro stations</p>
          </div>
        </div>

        {/* Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Why Volunteer?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Make a Difference</p>
                  <p className="text-muted-foreground">Help create an inclusive metro system for everyone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Flexible Schedule</p>
                  <p className="text-muted-foreground">Choose when you're available to help</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Community Impact</p>
                  <p className="text-muted-foreground">Be part of a caring community that supports accessibility</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {profile?.role === 'volunteer' || profile?.role === 'admin' 
                ? "Update Volunteer Profile" 
                : "Volunteer Application"}
            </CardTitle>
            <CardDescription>
              {profile?.role === 'volunteer' || profile?.role === 'admin'
                ? "Update your volunteer information and preferences."
                : "Fill out this form to register as a volunteer. We'll review your application and get back to you."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name *</Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9999999999"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  />
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Areas of Assistance *</h3>
                <p className="text-sm text-muted-foreground">
                  Select the types of assistance you're comfortable providing:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specializations.map(spec => (
                    <div key={spec.value} className="flex items-start space-x-3">
                      <Checkbox
                        id={spec.value}
                        checked={formData.selectedSpecializations.includes(spec.value)}
                        onCheckedChange={() => handleSpecializationToggle(spec.value)}
                      />
                      <Label htmlFor={spec.value} className="text-sm leading-5">
                        {spec.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Availability</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availability"
                    checked={formData.availability_status}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, availability_status: !!checked }))
                    }
                  />
                  <Label htmlFor="availability">
                    I am currently available to volunteer
                  </Label>
                </div>
              </div>

              {/* Requirements Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Volunteer Requirements:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Must be 18 years or older</li>
                      <li>Willing to undergo a brief training session</li>
                      <li>Committed to helping with kindness and patience</li>
                      <li>Available to respond to requests in a timely manner</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting 
                  ? (profile?.role === 'volunteer' || profile?.role === 'admin' ? "Updating Profile..." : "Submitting Application...") 
                  : (profile?.role === 'volunteer' || profile?.role === 'admin' ? "Update Volunteer Profile" : "Submit Volunteer Application")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VolunteerSignup;