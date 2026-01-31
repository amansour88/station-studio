-- Add stats column to hero_section table for storing the 3 stat cards
ALTER TABLE public.hero_section 
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '[{"number": "78", "label": "محطة", "icon": "Fuel"}, {"number": "5", "label": "مناطق", "icon": "MapPin"}, {"number": "1998", "label": "سنة التأسيس", "icon": "Calendar"}]'::jsonb;