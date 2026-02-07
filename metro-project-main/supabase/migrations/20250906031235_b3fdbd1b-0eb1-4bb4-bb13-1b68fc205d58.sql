-- Create parking bookings table
CREATE TABLE public.parking_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  station_id TEXT NOT NULL,
  station_name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('two_wheeler', 'four_wheeler')),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_number INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on parking_bookings
ALTER TABLE public.parking_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for parking_bookings
CREATE POLICY "Users can view their own parking bookings" 
ON public.parking_bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own parking bookings" 
ON public.parking_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parking bookings" 
ON public.parking_bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create parking availability table (for tracking real-time availability)
CREATE TABLE public.parking_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  station_name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('two_wheeler', 'four_wheeler')),
  total_slots INTEGER NOT NULL,
  occupied_slots INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(station_id, vehicle_type, date)
);

-- Enable RLS on parking_availability (public read access)
ALTER TABLE public.parking_availability ENABLE ROW LEVEL SECURITY;

-- Create policy for parking_availability (anyone can read)
CREATE POLICY "Anyone can view parking availability" 
ON public.parking_availability 
FOR SELECT 
USING (true);

-- Create offline tickets table
CREATE TABLE public.offline_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  source_station TEXT NOT NULL,
  destination_station TEXT NOT NULL,
  passenger_count INTEGER NOT NULL DEFAULT 1,
  travel_date DATE NOT NULL,
  travel_time TIME NOT NULL,
  fare_amount INTEGER NOT NULL,
  qr_data TEXT NOT NULL,
  is_validated BOOLEAN NOT NULL DEFAULT false,
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS on offline_tickets
ALTER TABLE public.offline_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for offline_tickets
CREATE POLICY "Users can view their own offline tickets" 
ON public.offline_tickets 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create offline tickets" 
ON public.offline_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own offline tickets" 
ON public.offline_tickets 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create trigger for updating updated_at column on parking_bookings
CREATE TRIGGER update_parking_bookings_updated_at
BEFORE UPDATE ON public.parking_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample parking availability data
INSERT INTO public.parking_availability (station_id, station_name, vehicle_type, total_slots, occupied_slots) VALUES
('1', 'Nagole', 'two_wheeler', 100, 45),
('1', 'Nagole', 'four_wheeler', 50, 22),
('2', 'Uppal', 'two_wheeler', 80, 35),
('2', 'Uppal', 'four_wheeler', 40, 18),
('4', 'NGRI', 'two_wheeler', 60, 25),
('4', 'NGRI', 'four_wheeler', 30, 12),
('6', 'Tarnaka', 'two_wheeler', 70, 30),
('6', 'Tarnaka', 'four_wheeler', 35, 15),
('8', 'Secunderabad East', 'two_wheeler', 120, 55),
('8', 'Secunderabad East', 'four_wheeler', 60, 28),
('10', 'Secunderabad West', 'two_wheeler', 150, 70),
('10', 'Secunderabad West', 'four_wheeler', 75, 35),
('12', 'Musheerabad', 'two_wheeler', 80, 40),
('12', 'Musheerabad', 'four_wheeler', 40, 18),
('14', 'Chikkadpally', 'two_wheeler', 90, 42),
('14', 'Chikkadpally', 'four_wheeler', 45, 20),
('16', 'Sultan Bazar', 'two_wheeler', 70, 32),
('16', 'Sultan Bazar', 'four_wheeler', 35, 16),
('17', 'MG Bus Station', 'two_wheeler', 200, 95),
('17', 'MG Bus Station', 'four_wheeler', 100, 48),
('19', 'New Market', 'two_wheeler', 60, 28),
('19', 'New Market', 'four_wheeler', 30, 14),
('21', 'Dilsukhnagar', 'two_wheeler', 110, 52),
('21', 'Dilsukhnagar', 'four_wheeler', 55, 26),
('22', 'Chaitanyapuri', 'two_wheeler', 90, 43),
('22', 'Chaitanyapuri', 'four_wheeler', 45, 21),
('24', 'LB Nagar', 'two_wheeler', 120, 58),
('24', 'LB Nagar', 'four_wheeler', 60, 28),
('25', 'Miyapur', 'two_wheeler', 200, 95),
('25', 'Miyapur', 'four_wheeler', 100, 48);