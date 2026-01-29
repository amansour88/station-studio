-- Create regions table
CREATE TABLE public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  map_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- RLS policies for regions
CREATE POLICY "Public can view active regions" 
ON public.regions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins and editors can manage regions" 
ON public.regions 
FOR ALL 
USING (is_admin_or_editor(auth.uid()))
WITH CHECK (is_admin_or_editor(auth.uid()));

-- Add new columns to stations
ALTER TABLE public.stations
ADD COLUMN IF NOT EXISTS google_maps_url text,
ADD COLUMN IF NOT EXISTS products text[];

-- Add trigger for regions updated_at
CREATE TRIGGER update_regions_updated_at
BEFORE UPDATE ON public.regions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default regions based on existing stations
INSERT INTO public.regions (name, slug, display_order) VALUES
('القصيم', 'qassim', 1),
('مكة المكرمة', 'makkah', 2),
('المدينة المنورة', 'madinah', 3),
('حائل', 'hail', 4),
('عسير', 'asir', 5)
ON CONFLICT (slug) DO NOTHING;