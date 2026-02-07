-- Update all existing virtual cards with zero balance to have a default balance of ₹245 (24500 paise)
-- This syncs the virtual card balance with the Smart Card default balance
UPDATE public.virtual_cards 
SET balance = 24500, updated_at = now()
WHERE balance = 0;