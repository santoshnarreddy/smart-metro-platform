-- Update Chaitanyapuri to be fully occupied
UPDATE public.parking_availability 
SET occupied_slots = total_slots 
WHERE station_name = 'Chaitanyapuri';

-- Insert Victoria Memorial station parking data if not exists
INSERT INTO public.parking_availability (station_id, station_name, vehicle_type, total_slots, occupied_slots)
VALUES 
  ('23', 'Victoria Memorial', 'two_wheeler', 80, 35),
  ('23', 'Victoria Memorial', 'four_wheeler', 40, 18)
ON CONFLICT DO NOTHING;