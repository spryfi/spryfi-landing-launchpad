-- Create GIS table to store GIS qualification data
CREATE TABLE IF NOT EXISTS public.gis_qualifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anchor_address_id UUID REFERENCES public.anchor_address(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- GIS response data
  fid INTEGER,
  providerid TEXT,
  technology TEXT,
  minup NUMERIC,
  mindown NUMERIC,
  minsignal NUMERIC,
  brandname TEXT,
  
  -- Additional attributes (stored as JSONB for flexibility)
  raw_attributes JSONB,
  
  -- Qualification result based on minsignal
  qualified BOOLEAN NOT NULL,
  qualification_reason TEXT
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gis_qualifications_anchor_address_id ON public.gis_qualifications(anchor_address_id);
CREATE INDEX IF NOT EXISTS idx_gis_qualifications_minsignal ON public.gis_qualifications(minsignal);

-- Update anchor_address table to store GIS qualification data
ALTER TABLE public.anchor_address 
ADD COLUMN IF NOT EXISTS gis_qualified BOOLEAN,
ADD COLUMN IF NOT EXISTS gis_minsignal NUMERIC,
ADD COLUMN IF NOT EXISTS gis_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS gis_qualification_id UUID REFERENCES public.gis_qualifications(id);