import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Upload, Plus, Eye, Phone, Mail, MapPin, Clock, Calendar, Image } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface LostFoundReport {
  id: string;
  user_id: string;
  report_type: 'lost' | 'found';
  item_type: 'electronics' | 'clothing' | 'documents' | 'jewelry' | 'bags' | 'books' | 'keys' | 'mobile_phone' | 'wallet' | 'other';
  title: string;
  description: string;
  station_name: string;
  contact_phone?: string;
  contact_email?: string;
  date_incident: string;
  time_incident?: string;
  image_url?: string;
  status: string;
  admin_verified: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
}

interface MatchingReport {
  id: string;
  title: string;
  description: string;
  report_type: 'lost' | 'found';
  station_name: string;
  created_at: string;
  match_score: number;
}

const LostAndFound: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('view');
  const [reports, setReports] = useState<LostFoundReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<LostFoundReport[]>([]);
  const [matchingReports, setMatchingReports] = useState<MatchingReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    report_type: 'lost' as 'lost' | 'found',
    item_type: 'electronics' as 'electronics' | 'clothing' | 'documents' | 'jewelry' | 'bags' | 'books' | 'keys' | 'mobile_phone' | 'wallet' | 'other',
    title: '',
    description: '',
    station_name: '',
    contact_phone: '',
    contact_email: '',
    date_incident: '',
    time_incident: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const metroStations = [
    'Miyapur', 'JNTU College', 'KPHB Colony', 'Kukatpally', 'Balanagar', 'Moosapet',
    'Dr. B.R. Ambedkar Balayan', 'Madhura Nagar', 'Yusufguda', 'Jubilee Hills',
    'JBS Parade Ground', 'Ameerpet', 'S.R. Nagar', 'ESI Hospital', 'Erragadda',
    'Bharat Nagar', 'Moosarambagh', 'New Market', 'Malakpet', 'Dilsukhnagar',
    'Chaitanyapuri', 'Victoria Memorial', 'L.B. Nagar'
  ];

  const itemTypes = [
    'electronics', 'clothing', 'documents', 'jewelry', 'bags', 
    'books', 'keys', 'mobile_phone', 'wallet', 'other'
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filterType, filterStatus]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lost_and_found')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        // Show sample data instead of error
        setReports([]);
      } else {
        setReports((data || []) as any);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Show empty list instead of error
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.station_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.item_type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    setFilteredReports(filtered);
  };

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('lost-found-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('lost-found-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit a report",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, user.id);
      }

      const { data, error } = await supabase
        .from('lost_and_found')
        .insert({
          ...formData,
          user_id: user.id,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Your report has been submitted successfully",
      });

      // Reset form
      setFormData({
        report_type: 'lost',
        item_type: 'electronics',
        title: '',
        description: '',
        station_name: '',
        contact_phone: '',
        contact_email: '',
        date_incident: '',
        time_incident: '',
      });
      setImageFile(null);

      // Find matching reports
      if (data) {
        await findMatches(data.id);
      }

      // Refresh reports
      fetchReports();
      setActiveTab('view');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const findMatches = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('find_matching_reports', { report_id: reportId });

      if (error) throw error;
      setMatchingReports(data || []);
      if (data && data.length > 0) {
        setSelectedReport(reportId);
      }
    } catch (error) {
      console.error('Error finding matches:', error);
    }
  };

  const markAsResolved = async (reportId: string, matchedWith?: string) => {
    try {
      const { error } = await supabase
        .from('lost_and_found')
        .update({ 
          status: 'resolved',
          resolved_with: matchedWith || null
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report Updated",
        description: "Report marked as resolved",
      });

      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('lost_found.title')}</h1>
        <p className="text-muted-foreground">
          Report lost items or help others find their belongings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">{t('lost_found.view_reports')}</TabsTrigger>
          <TabsTrigger value="lost">{t('lost_found.report_lost')}</TabsTrigger>
          <TabsTrigger value="found">{t('lost_found.report_found')}</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by title, description, or station..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Item Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {itemTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`lost_found.item_types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredReports.length === 0 ? (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <MapPin className="h-16 w-16 text-muted-foreground/40" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to report a lost or found item
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setActiveTab('lost')}>
                          Report Lost Item
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab('found')}>
                          Report Found Item
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={report.report_type === 'lost' ? 'destructive' : 'secondary'}>
                          {report.report_type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {t(`lost_found.item_types.${report.item_type}`)}
                        </Badge>
                        <Badge variant={report.status === 'active' ? 'default' : 'outline'}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => findMatches(report.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Find Matches
                        </Button>
                        {report.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => markAsResolved(report.id)}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                    <p className="text-muted-foreground mb-4">{report.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {report.station_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(report.date_incident), 'MMM dd, yyyy')}
                      </div>
                      {report.time_incident && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {report.time_incident}
                        </div>
                      )}
                      {report.contact_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {report.contact_phone}
                        </div>
                      )}
                    </div>

                    {report.image_url && (
                      <div className="mt-4">
                        <img
                          src={report.image_url}
                          alt="Item"
                          className="max-w-xs h-32 object-cover rounded-md"
                        />
                      </div>
                    )}

                    <div className="mt-4 text-sm text-muted-foreground">
                      Reported by {report.profiles?.full_name || 'Anonymous'} on{' '}
                      {format(new Date(report.created_at), 'MMM dd, yyyy')}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Matching Reports Modal/Section */}
          {selectedReport && matchingReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('lost_found.possible_matches')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchingReports.map((match) => (
                    <div key={match.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{match.title}</h4>
                        <Badge variant="outline">Score: {match.match_score}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{match.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{match.station_name}</span>
                        <Button
                          size="sm"
                          onClick={() => markAsResolved(selectedReport, match.id)}
                        >
                          Match Found
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lost">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {t('lost_found.report_lost')}
              </CardTitle>
              <CardDescription>
                Lost something at a metro station? Report it here and we'll help you find it. 
                Our AI-powered matching system will automatically search for matching found items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" value="lost" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item_type">{t('lost_found.item_type')}</Label>
                     <Select
                       value={formData.item_type}
                       onValueChange={(value) => setFormData({ ...formData, item_type: value as any })}
                       required
                     >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`lost_found.item_types.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="station_name">{t('lost_found.station')}</Label>
                    <Select
                      value={formData.station_name}
                      onValueChange={(value) => setFormData({ ...formData, station_name: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select station" />
                      </SelectTrigger>
                      <SelectContent>
                        {metroStations.map((station) => (
                          <SelectItem key={station} value={station}>
                            {station}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('lost_found.title_placeholder')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">{t('lost_found.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed description of the item..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_incident">{t('lost_found.date_incident')}</Label>
                    <Input
                      id="date_incident"
                      type="date"
                      value={formData.date_incident}
                      onChange={(e) => setFormData({ ...formData, date_incident: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time_incident">{t('lost_found.time_incident')}</Label>
                    <Input
                      id="time_incident"
                      type="time"
                      value={formData.time_incident}
                      onChange={(e) => setFormData({ ...formData, time_incident: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_phone">{t('lost_found.contact_phone')}</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">{t('lost_found.contact_email')}</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">{t('lost_found.upload_image')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    <Upload className="h-4 w-4" />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Submitting...' : t('lost_found.submit_report')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="found">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {t('lost_found.report_found')}
              </CardTitle>
              <CardDescription>
                Found an item at a metro station? Report it here to help reunite it with its owner. 
                We'll match your report with people who have reported similar lost items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                setFormData({ ...formData, report_type: 'found' });
                handleSubmit(e);
              }} className="space-y-4">
                {/* Same form as lost, but with report_type set to 'found' */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item_type">{t('lost_found.item_type')}</Label>
                     <Select
                       value={formData.item_type}
                       onValueChange={(value) => setFormData({ ...formData, item_type: value as any })}
                       required
                     >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`lost_found.item_types.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="station_name">{t('lost_found.station')}</Label>
                    <Select
                      value={formData.station_name}
                      onValueChange={(value) => setFormData({ ...formData, station_name: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select station" />
                      </SelectTrigger>
                      <SelectContent>
                        {metroStations.map((station) => (
                          <SelectItem key={station} value={station}>
                            {station}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('lost_found.title_placeholder')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">{t('lost_found.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed description of the item..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_incident">{t('lost_found.date_incident')}</Label>
                    <Input
                      id="date_incident"
                      type="date"
                      value={formData.date_incident}
                      onChange={(e) => setFormData({ ...formData, date_incident: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time_incident">{t('lost_found.time_incident')}</Label>
                    <Input
                      id="time_incident"
                      type="time"
                      value={formData.time_incident}
                      onChange={(e) => setFormData({ ...formData, time_incident: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_phone">{t('lost_found.contact_phone')}</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">{t('lost_found.contact_email')}</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">{t('lost_found.upload_image')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    <Upload className="h-4 w-4" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full"
                  onClick={() => setFormData({ ...formData, report_type: 'found' })}
                >
                  {loading ? 'Submitting...' : t('lost_found.submit_report')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LostAndFound;