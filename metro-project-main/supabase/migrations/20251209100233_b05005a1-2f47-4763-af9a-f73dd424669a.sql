-- Add linked_smart_card column to virtual_cards table for syncing with Smart Card
ALTER TABLE public.virtual_cards 
ADD COLUMN linked_smart_card TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.virtual_cards.linked_smart_card IS 'Linked Smart Card number for balance synchronization';