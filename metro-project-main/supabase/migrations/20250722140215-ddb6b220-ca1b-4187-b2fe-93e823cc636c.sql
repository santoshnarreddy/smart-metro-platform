-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION public.update_virtual_card_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;