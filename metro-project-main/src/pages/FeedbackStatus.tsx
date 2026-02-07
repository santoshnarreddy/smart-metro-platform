import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface FeedbackDetails {
  id: string;
  tracking_id: string;
  feedback_type: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  station_name?: string;
  admin_response?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

const FeedbackStatus = () => {
  const [trackingId, setTrackingId] = useState("");
  const [feedback, setFeedback] = useState<FeedbackDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const searchFeedback = async () => {
    if (!trackingId.trim()) {
      toast({
        title: "Missing Tracking ID",
        description: "Please enter a tracking ID to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('tracking_id', trackingId.trim())
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Feedback Not Found",
            description: "No feedback found with this tracking ID or you don't have permission to view it",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        setFeedback(null);
        return;
      }

      setFeedback(data);
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'under_investigation':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'under_investigation':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

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
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Your Feedback
            </CardTitle>
            <CardDescription>
              Enter your tracking ID to check the status of your feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="tracking-id" className="sr-only">
                  Tracking ID
                </Label>
                <Input
                  id="tracking-id"
                  placeholder="Enter tracking ID (e.g., FB2024123456)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchFeedback()}
                />
              </div>
              <Button onClick={searchFeedback} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {feedback && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Feedback Details</CardTitle>
                <Badge className={getStatusColor(feedback.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(feedback.status)}
                    {formatStatus(feedback.status)}
                  </div>
                </Badge>
              </div>
              <CardDescription>
                Tracking ID: {feedback.tracking_id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Feedback Type
                  </Label>
                  <p className="mt-1 capitalize">{feedback.feedback_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Category
                  </Label>
                  <p className="mt-1">{formatCategory(feedback.category)}</p>
                </div>
              </div>

              {feedback.station_name && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Station
                  </Label>
                  <p className="mt-1">{feedback.station_name}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Subject
                </Label>
                <p className="mt-1">{feedback.subject}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <p className="mt-1 whitespace-pre-wrap">{feedback.description}</p>
              </div>

              {feedback.admin_response && (
                <div className="bg-muted p-4 rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Admin Response
                  </Label>
                  <p className="mt-1 whitespace-pre-wrap">{feedback.admin_response}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Submitted On
                  </Label>
                  <p className="mt-1 text-sm">{formatDate(feedback.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </Label>
                  <p className="mt-1 text-sm">{formatDate(feedback.updated_at)}</p>
                </div>
              </div>

              {feedback.resolved_at && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Resolved On
                  </Label>
                  <p className="mt-1 text-sm">{formatDate(feedback.resolved_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate("/feedback")}>
            Submit New Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackStatus;