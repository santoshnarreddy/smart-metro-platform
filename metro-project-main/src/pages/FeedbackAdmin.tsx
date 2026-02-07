import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, MessageSquare, Filter, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface FeedbackItem {
  id: string;
  tracking_id: string;
  feedback_type: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  station_name?: string;
  contact_email?: string;
  contact_phone?: string;
  admin_response?: string;
  priority_level: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

const FeedbackAdmin = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchFeedbacks();
    }
  }, [userProfile]);

  useEffect(() => {
    filterFeedbacks();
  }, [feedbacks, statusFilter, categoryFilter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setUserProfile(profile);
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeedbacks(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to fetch feedback",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFeedbacks = () => {
    let filtered = feedbacks;

    if (statusFilter !== "all") {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(f => f.category === categoryFilter);
    }

    setFilteredFeedbacks(filtered);
  };

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string, response?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        admin_user_id: user.id,
      };

      if (response) {
        updateData.admin_response = response;
      }

      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('feedback')
        .update(updateData)
        .eq('id', feedbackId);

      if (error) throw error;

      toast({
        title: "Feedback Updated",
        description: "Feedback status has been updated successfully",
      });

      fetchFeedbacks();
      setSelectedFeedback(null);
      setAdminResponse("");
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
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
      month: 'short',
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

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5:
        return 'bg-red-100 text-red-800';
      case 4:
        return 'bg-orange-100 text-orange-800';
      case 3:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-blue-100 text-blue-800';
      case 1:
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
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
              Feedback Management
            </CardTitle>
            <CardDescription>
              Manage and respond to user feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="space-y-2">
                <Label>Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="under_investigation">Under Investigation</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category Filter</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="metro_service">Metro Service</SelectItem>
                    <SelectItem value="station_facilities">Station Facilities</SelectItem>
                    <SelectItem value="ticketing">Ticketing</SelectItem>
                    <SelectItem value="cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="accessibility">Accessibility</SelectItem>
                    <SelectItem value="safety_security">Safety & Security</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                    <SelectItem value="food_services">Food Services</SelectItem>
                    <SelectItem value="technical_issues">Technical Issues</SelectItem>
                    <SelectItem value="staff_behavior">Staff Behavior</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Feedback Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredFeedbacks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">No feedback found</TableCell>
                    </TableRow>
                  ) : (
                    filteredFeedbacks.map((feedback) => (
                      <TableRow key={feedback.id}>
                        <TableCell className="font-mono text-sm">{feedback.tracking_id}</TableCell>
                        <TableCell className="capitalize">{feedback.feedback_type}</TableCell>
                        <TableCell>{formatCategory(feedback.category)}</TableCell>
                        <TableCell className="max-w-48 truncate">{feedback.subject}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(feedback.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(feedback.status)}
                              {formatStatus(feedback.status)}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(feedback.priority_level)}>
                            P{feedback.priority_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(feedback.created_at)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedFeedback(feedback);
                                  setAdminResponse(feedback.admin_response || "");
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Feedback Details - {feedback.tracking_id}</DialogTitle>
                              </DialogHeader>
                              {selectedFeedback && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                                      <p className="capitalize">{selectedFeedback.feedback_type}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                                      <p>{formatCategory(selectedFeedback.category)}</p>
                                    </div>
                                  </div>

                                  {selectedFeedback.station_name && (
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Station</Label>
                                      <p>{selectedFeedback.station_name}</p>
                                    </div>
                                  )}

                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                                    <p>{selectedFeedback.subject}</p>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                    <p className="whitespace-pre-wrap">{selectedFeedback.description}</p>
                                  </div>

                                  {selectedFeedback.contact_email && (
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Contact Email</Label>
                                      <p>{selectedFeedback.contact_email}</p>
                                    </div>
                                  )}

                                  {selectedFeedback.contact_phone && (
                                    <div>
                                      <Label className="text-sm font-medium text-muted-foreground">Contact Phone</Label>
                                      <p>{selectedFeedback.contact_phone}</p>
                                    </div>
                                  )}

                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
                                    <Badge className={getStatusColor(selectedFeedback.status)}>
                                      {formatStatus(selectedFeedback.status)}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Update Status</Label>
                                    <Select 
                                      onValueChange={(value) => updateFeedbackStatus(selectedFeedback.id, value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_review">In Review</SelectItem>
                                        <SelectItem value="under_investigation">Under Investigation</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Admin Response</Label>
                                    <Textarea
                                      value={adminResponse}
                                      onChange={(e) => setAdminResponse(e.target.value)}
                                      placeholder="Enter your response to the user..."
                                      className="min-h-[100px]"
                                    />
                                    <Button 
                                      onClick={() => updateFeedbackStatus(selectedFeedback.id, selectedFeedback.status, adminResponse)}
                                      disabled={!adminResponse.trim()}
                                    >
                                      Save Response
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackAdmin;