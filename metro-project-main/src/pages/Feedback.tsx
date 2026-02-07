import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Upload, Camera, ArrowLeft } from "lucide-react";

interface FeedbackForm {
  feedback_type: "complaint" | "suggestion" | "compliment";
  category: string;
  subject: string;
  description: string;
  station_name?: string;
  contact_email?: string;
  contact_phone?: string;
  screenshot?: File | null;
}

const FEEDBACK_CATEGORIES = [
  { value: "metro_service", label: "Metro Service" },
  { value: "station_facilities", label: "Station Facilities" },
  { value: "ticketing", label: "Ticketing" },
  { value: "cleanliness", label: "Cleanliness" },
  { value: "accessibility", label: "Accessibility" },
  { value: "safety_security", label: "Safety & Security" },
  { value: "parking", label: "Parking" },
  { value: "food_services", label: "Food Services" },
  { value: "technical_issues", label: "Technical Issues" },
  { value: "staff_behavior", label: "Staff Behavior" },
  { value: "other", label: "Other" },
];

const METRO_STATIONS = [
  "Nagole", "Uppal", "Survey Settlement", "NGRI", "Habsiguda", "Tarnaka", "Mettuguda",
  "Secunderabad East", "Parade Ground", "Secunderabad West", "Gandhi Hospital", "Musheerabad",
  "RTC X Roads", "Chikkadpally", "Narayanguda", "Sultan Bazar", "MG Bus Station", "Malakpet",
  "New Market", "Musarambagh", "Dilsukhnagar", "Chaitanyapuri", "Victoria Memorial", "LB Nagar",
  "Miyapur", "JNTU College", "KPHB Colony", "Kukatpally", "Balanagar", "Moosapet",
  "Bharat Nagar", "Erragadda", "ESI Hospital", "SR Nagar", "Ameerpet", "Punjagutta", "Irrum Manzil",
  "Khairatabad", "Lakdikapool", "Assembly", "Nampally", "Gandhi Bhavan", "Osmania Medical College",
  "Hi-Tech City", "Madhapur", "Durgam Cheruvu", "Jubilee Hills Checkpost", "Jubilee Hills",
  "Yusufguda", "Madhura Nagar", "Peddamma Gudi", "Raidurg", "Begumpet", "Prakash Nagar", "Rasoolpura"
];

const Feedback = () => {
  const [form, setForm] = useState<FeedbackForm>({
    feedback_type: "complaint",
    category: "",
    subject: "",
    description: "",
    station_name: "",
    contact_email: "",
    contact_phone: "",
    screenshot: null,
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [trackingId, setTrackingId] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    // Pre-fill email if available
    if (session?.user?.email) {
      setForm(prev => ({ ...prev, contact_email: session.user.email }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setForm(prev => ({ ...prev, screenshot: file }));
    }
  };

  const uploadScreenshot = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('feedback-screenshots')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('feedback-screenshots')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.category || !form.subject || !form.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let screenshotUrl = null;
      
      // Upload screenshot if provided
      if (form.screenshot) {
        screenshotUrl = await uploadScreenshot(form.screenshot, user.id);
        if (!screenshotUrl) {
          toast({
            title: "Upload Failed",
            description: "Failed to upload screenshot. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Submit feedback - tracking_id will be auto-generated by trigger
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          tracking_id: '',
          user_id: user.id,
          feedback_type: form.feedback_type as any,
          category: form.category as any,
          subject: form.subject,
          description: form.description,
          station_name: form.station_name || null,
          contact_email: form.contact_email || null,
          contact_phone: form.contact_phone || null,
          screenshot_url: screenshotUrl,
        }])
        .select('tracking_id')
        .single();

      if (error) {
        throw error;
      }

      setTrackingId(data.tracking_id);
      
      toast({
        title: "Feedback Submitted!",
        description: `Your feedback has been submitted with tracking ID: ${data.tracking_id}`,
      });

      // Reset form
      setForm({
        feedback_type: "complaint",
        category: "",
        subject: "",
        description: "",
        station_name: "",
        contact_email: user.email || "",
        contact_phone: "",
        screenshot: null,
      });

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (trackingId) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary">Feedback Submitted Successfully!</CardTitle>
              <CardDescription>
                Thank you for your feedback. We will review it and get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Label className="text-sm font-medium">Your Tracking ID</Label>
                <div className="text-2xl font-bold text-primary mt-1">{trackingId}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Save this tracking ID to check the status of your feedback
                </p>
              </div>
              
              <div className="space-y-2">
                <Button onClick={() => navigate("/feedback-status")} className="w-full">
                  Track Your Feedback
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTrackingId("");
                    setForm({
                      feedback_type: "complaint",
                      category: "",
                      subject: "",
                      description: "",
                      station_name: "",
                      contact_email: user?.email || "",
                      contact_phone: "",
                      screenshot: null,
                    });
                  }} 
                  className="w-full"
                >
                  Submit Another Feedback
                </Button>
                <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")} 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Submit Feedback
            </CardTitle>
            <CardDescription>
              Help us improve your metro experience by sharing your feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div className="space-y-2">
                <Label>Feedback Type *</Label>
                <Select 
                  value={form.feedback_type} 
                  onValueChange={(value: "complaint" | "suggestion" | "compliment") => 
                    setForm(prev => ({ ...prev, feedback_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="compliment">Compliment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={form.category} 
                  onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Station Name */}
              <div className="space-y-2">
                <Label>Station (if applicable)</Label>
                <Select 
                  value={form.station_name || ""} 
                  onValueChange={(value) => setForm(prev => ({ ...prev, station_name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRO_STATIONS.map((station) => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your feedback"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide detailed information about your feedback"
                  className="min-h-[120px]"
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) => setForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-2">
                <Label htmlFor="screenshot">Screenshot (optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
                {form.screenshot && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {form.screenshot.name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Max file size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;