-- Create food_stalls table
CREATE TABLE public.food_stalls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  station_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  opening_hours TEXT DEFAULT '9:00 AM - 10:00 PM',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stall_id UUID NOT NULL REFERENCES public.food_stalls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- price in paise
  image_url TEXT,
  category TEXT DEFAULT 'main',
  is_available BOOLEAN DEFAULT true,
  preparation_time INTEGER DEFAULT 15, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stall_id UUID NOT NULL REFERENCES public.food_stalls(id),
  total_amount INTEGER NOT NULL, -- in paise
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'UPI',
  payment_status TEXT DEFAULT 'pending',
  delivery_station TEXT NOT NULL,
  notes TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL, -- price per item in paise
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.food_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for food_stalls (public read)
CREATE POLICY "Anyone can view food stalls" 
ON public.food_stalls 
FOR SELECT 
USING (true);

-- RLS policies for menu_items (public read)
CREATE POLICY "Anyone can view menu items" 
ON public.menu_items 
FOR SELECT 
USING (true);

-- RLS policies for orders (user-specific)
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for order_items (user-specific through orders)
CREATE POLICY "Users can view their own order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_food_stalls_station ON public.food_stalls(station_name);
CREATE INDEX idx_menu_items_stall ON public.menu_items(stall_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_food_stalls_updated_at
BEFORE UPDATE ON public.food_stalls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();