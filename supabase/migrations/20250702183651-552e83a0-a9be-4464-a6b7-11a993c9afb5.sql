-- Create shipping_zones table for managing shipping rates
CREATE TABLE public.shipping_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  states TEXT[] NOT NULL,
  base_cost DECIMAL(10,2) NOT NULL,
  estimated_days TEXT NOT NULL DEFAULT '5-7',
  active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_settings table for configuration
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default shipping zones
INSERT INTO public.shipping_zones (name, states, base_cost, estimated_days, active, is_default) VALUES
('Zone 1 - Central', ARRAY['TX', 'OK', 'AR', 'LA', 'NM'], 12.95, '3', true, false),
('Zone 2 - Southwest/Southeast', ARRAY['AZ', 'CA', 'NV', 'UT', 'CO', 'KS', 'MO', 'TN', 'MS', 'AL', 'GA', 'FL'], 16.95, '5', true, false),
('Zone 3 - Midwest/Mid-Atlantic', ARRAY['WA', 'OR', 'ID', 'MT', 'WY', 'ND', 'SD', 'NE', 'IA', 'IL', 'IN', 'OH', 'KY', 'WV', 'VA', 'NC', 'SC'], 19.95, '7', true, false),
('Zone 4 - Northeast/Remote', ARRAY['AK', 'HI', 'ME', 'VT', 'NH', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'DC'], 24.95, '10', true, false),
('Default Zone', ARRAY[]::TEXT[], 16.95, '5-7', true, true);

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category) VALUES
('shipping_origin_city', 'Austin', 'City where packages ship from', 'shipping'),
('shipping_origin_state', 'TX', 'State where packages ship from', 'shipping'),
('shipping_origin_zip', '78701', 'ZIP code where packages ship from', 'shipping'),
('stripe_mode', 'test', 'Stripe mode (test or live)', 'payment'),
('stripe_public_key', '', 'Stripe publishable key', 'payment');

-- Enable Row Level Security
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to shipping zones" ON public.shipping_zones
  FOR SELECT USING (active = true);

CREATE POLICY "Allow public read access to system settings" ON public.system_settings
  FOR SELECT USING (true);

-- Create policies for authenticated insert/update (for admin use)
CREATE POLICY "Authenticated users can manage shipping zones" ON public.shipping_zones
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage system settings" ON public.system_settings
  FOR ALL USING (auth.uid() IS NOT NULL);