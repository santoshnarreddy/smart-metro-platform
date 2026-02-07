-- Update image URLs for Biriyani Hub and Spice Junction with better quality images
UPDATE food_stalls 
SET image_url = 'https://images.unsplash.com/photo-1563379091339-03b0e2b2f4b9?w=800&q=80'
WHERE name = 'Biriyani Hub';

UPDATE food_stalls 
SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80'
WHERE name = 'Spice Junction';