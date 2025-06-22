
-- Add the missing anchor_address_id column to the leads_fresh table
ALTER TABLE public.leads_fresh 
ADD COLUMN anchor_address_id UUID REFERENCES public.anchor_address(id);

-- Add an index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_leads_fresh_anchor_address_id 
ON public.leads_fresh(anchor_address_id);
