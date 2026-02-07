-- Create feedback system with tracking ID and comprehensive features

-- Create feedback categories enum
CREATE TYPE public.feedback_category AS ENUM (
  'metro_service',
  'station_facilities',
  'ticketing',
  'cleanliness',
  'accessibility',
  'safety_security',
  'parking',
  'food_services',
  'technical_issues',
  'staff_behavior',
  'other'
);

-- Create feedback types enum
CREATE TYPE public.feedback_type AS ENUM (
  'complaint',
  'suggestion',
  'compliment'
);

-- Create feedback status enum
CREATE TYPE public.feedback_status AS ENUM (
  'pending',
  'in_review',
  'under_investigation',
  'resolved',
  'closed'
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  feedback_type feedback_type NOT NULL,
  category feedback_category NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  status feedback_status NOT NULL DEFAULT 'pending',
  priority_level INTEGER DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5),
  station_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  admin_response TEXT,
  admin_user_id UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feedback
CREATE POLICY "Users can create their own feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
ON public.feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" 
ON public.feedback 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins can update all feedback" 
ON public.feedback 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create function to generate tracking ID
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tracking_id TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate tracking ID: FB + current year + random 6-digit number
    tracking_id := 'FB' || EXTRACT(YEAR FROM now())::TEXT || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if this tracking ID already exists
    SELECT EXISTS(SELECT 1 FROM feedback WHERE feedback.tracking_id = generate_tracking_id.tracking_id) INTO exists_check;
    
    -- Exit loop if unique tracking ID found
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN tracking_id;
END;
$$;

-- Create trigger function to auto-generate tracking ID
CREATE OR REPLACE FUNCTION public.set_feedback_tracking_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tracking_id IS NULL OR NEW.tracking_id = '' THEN
    NEW.tracking_id := public.generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate tracking ID on insert
CREATE TRIGGER set_feedback_tracking_id_trigger
BEFORE INSERT ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.set_feedback_tracking_id();

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for feedback screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('feedback-screenshots', 'feedback-screenshots', false);

-- Create storage policies for feedback screenshots
CREATE POLICY "Users can upload feedback screenshots" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'feedback-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own feedback screenshots" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'feedback-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all feedback screenshots" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'feedback-screenshots' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);