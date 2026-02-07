-- Create enum types for lost and found system
CREATE TYPE public.item_type AS ENUM (
  'electronics',
  'clothing',
  'documents',
  'jewelry',
  'bags',
  'books',
  'keys',
  'mobile_phone',
  'wallet',
  'other'
);

CREATE TYPE public.item_status AS ENUM (
  'active',
  'claimed',
  'resolved',
  'expired'
);

CREATE TYPE public.report_type AS ENUM (
  'lost',
  'found'
);

-- Create lost_and_found table
CREATE TABLE public.lost_and_found (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type report_type NOT NULL,
  item_type item_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  station_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  date_incident DATE NOT NULL,
  time_incident TIME,
  image_url TEXT,
  status item_status NOT NULL DEFAULT 'active',
  keywords TEXT[], -- For keyword matching
  admin_verified BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  resolved_with UUID, -- Reference to matching report
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lost_and_found ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all active lost and found reports"
ON public.lost_and_found
FOR SELECT
USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create their own reports"
ON public.lost_and_found
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
ON public.lost_and_found
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all reports"
ON public.lost_and_found
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create storage bucket for lost and found images
INSERT INTO storage.buckets (id, name, public) VALUES ('lost-found-images', 'lost-found-images', true);

-- Create storage policies
CREATE POLICY "Users can upload their own lost/found images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'lost-found-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view lost/found images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'lost-found-images');

CREATE POLICY "Users can update their own lost/found images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'lost-found-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to generate keywords from title and description
CREATE OR REPLACE FUNCTION public.generate_keywords(title TEXT, description TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  keywords TEXT[];
  word TEXT;
BEGIN
  -- Convert to lowercase and split into words
  keywords := string_to_array(lower(regexp_replace(title || ' ' || description, '[^a-zA-Z0-9\s]', ' ', 'g')), ' ');
  
  -- Filter out empty strings and short words
  keywords := array(
    SELECT DISTINCT unnest(keywords) 
    WHERE length(unnest(keywords)) > 2
  );
  
  RETURN keywords;
END;
$$;

-- Function to find matching reports
CREATE OR REPLACE FUNCTION public.find_matching_reports(report_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  report_type report_type,
  station_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  match_score INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  current_report RECORD;
  opposite_type report_type;
BEGIN
  -- Get current report details
  SELECT * INTO current_report FROM public.lost_and_found WHERE public.lost_and_found.id = report_id;
  
  -- Determine opposite report type
  IF current_report.report_type = 'lost' THEN
    opposite_type := 'found';
  ELSE
    opposite_type := 'lost';
  END IF;
  
  -- Find matching reports based on keywords, item type, and station
  RETURN QUERY
  SELECT 
    lf.id,
    lf.title,
    lf.description,
    lf.report_type,
    lf.station_name,
    lf.created_at,
    (
      CASE WHEN lf.item_type = current_report.item_type THEN 3 ELSE 0 END +
      CASE WHEN lf.station_name = current_report.station_name THEN 2 ELSE 0 END +
      (SELECT COUNT(*) FROM unnest(lf.keywords) k WHERE k = ANY(current_report.keywords))::INTEGER
    ) AS match_score
  FROM public.lost_and_found lf
  WHERE 
    lf.report_type = opposite_type
    AND lf.status = 'active'
    AND lf.id != report_id
    AND (
      lf.item_type = current_report.item_type OR
      lf.station_name = current_report.station_name OR
      lf.keywords && current_report.keywords
    )
  ORDER BY match_score DESC, lf.created_at DESC
  LIMIT 10;
END;
$$;

-- Trigger to auto-generate keywords
CREATE OR REPLACE FUNCTION public.set_keywords_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.keywords := public.generate_keywords(NEW.title, NEW.description);
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_keywords_on_insert_update
BEFORE INSERT OR UPDATE ON public.lost_and_found
FOR EACH ROW
EXECUTE FUNCTION public.set_keywords_trigger();

-- Update trigger for updated_at
CREATE TRIGGER update_lost_and_found_updated_at
BEFORE UPDATE ON public.lost_and_found
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();