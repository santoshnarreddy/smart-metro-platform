-- Create enum for assistance request status
CREATE TYPE public.assistance_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

-- Create enum for assistance types
CREATE TYPE public.assistance_type AS ENUM ('wheelchair', 'visual_impairment', 'hearing_impairment', 'mobility_aid', 'elderly_support', 'other');

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('passenger', 'volunteer', 'admin');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'passenger',
  is_verified_volunteer BOOLEAN DEFAULT FALSE,
  emergency_contact TEXT,
  specializations TEXT[], -- For volunteers: what types of assistance they can provide
  availability_status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assistance requests table
CREATE TABLE public.assistance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  volunteer_id UUID NULL,
  station_name TEXT NOT NULL,
  assistance_type assistance_type NOT NULL,
  description TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  emergency_contact TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  status assistance_status NOT NULL DEFAULT 'pending',
  priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
  special_instructions TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistance_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Volunteers can view other volunteer profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('volunteer', 'admin')
  )
);

-- Create policies for assistance requests
CREATE POLICY "Users can view their own requests" 
ON public.assistance_requests 
FOR SELECT 
USING (auth.uid() = requester_id);

CREATE POLICY "Volunteers can view all pending requests" 
ON public.assistance_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('volunteer', 'admin')
  )
);

CREATE POLICY "Volunteers can view their accepted requests" 
ON public.assistance_requests 
FOR SELECT 
USING (auth.uid() = volunteer_id);

CREATE POLICY "Users can create assistance requests" 
ON public.assistance_requests 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters can update their own requests" 
ON public.assistance_requests 
FOR UPDATE 
USING (auth.uid() = requester_id);

CREATE POLICY "Volunteers can update requests they accepted" 
ON public.assistance_requests 
FOR UPDATE 
USING (
  auth.uid() = volunteer_id OR 
  (volunteer_id IS NULL AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('volunteer', 'admin')
  ))
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assistance_requests_updated_at
BEFORE UPDATE ON public.assistance_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();