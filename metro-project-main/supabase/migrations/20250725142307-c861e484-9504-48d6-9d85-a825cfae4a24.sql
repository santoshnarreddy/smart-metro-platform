-- Drop triggers first, then replace function with security definer
DROP TRIGGER IF EXISTS update_food_stalls_updated_at ON public.food_stalls;
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

-- Now drop and recreate the function with proper security
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Recreate the triggers
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