-- Remove Biriyani Hub from food_stalls table
DELETE FROM public.food_stalls WHERE name = 'Biriyani Hub';

-- Also remove any associated menu items for this stall
DELETE FROM public.menu_items WHERE stall_id NOT IN (SELECT id FROM public.food_stalls);