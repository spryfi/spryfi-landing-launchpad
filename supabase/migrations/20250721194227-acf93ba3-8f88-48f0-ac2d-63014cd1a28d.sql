-- Update customers table to support lead-to-customer conversion
ALTER TABLE public.customers 
DROP COLUMN IF EXISTS plan_selected,
DROP COLUMN IF EXISTS base_price,
DROP COLUMN IF EXISTS discount_applied,
DROP COLUMN IF EXISTS wfh,
DROP COLUMN IF EXISTS agreement_length,
DROP COLUMN IF EXISTS industry;

-- Add comprehensive customer fields
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads_fresh(id),
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_from_payment_id text,
ADD COLUMN IF NOT EXISTS activation_fee_paid numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_cost_paid numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS checkout_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create payment records table for audit trail
CREATE TABLE IF NOT EXISTS public.payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads_fresh(id),
  payment_type text NOT NULL, -- 'activation_fee', 'shipping', 'monthly_service'
  amount numeric NOT NULL,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  status text DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Create policy for payment records (staff and admin access only)
CREATE POLICY "Staff can access payment records" 
ON public.payment_records 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON public.customers(lead_id);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id ON public.customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_customer_id ON public.payment_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_lead_id ON public.payment_records(lead_id);

-- Create function to convert lead to customer
CREATE OR REPLACE FUNCTION public.convert_lead_to_customer(
  p_lead_id uuid,
  p_stripe_payment_intent_id text,
  p_stripe_customer_id text,
  p_shipping_cost numeric,
  p_activation_fee numeric DEFAULT 9.90 -- $99 with 90% discount
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id uuid;
  v_lead_data record;
BEGIN
  -- Get lead data
  SELECT * INTO v_lead_data
  FROM public.leads_fresh
  WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found with id: %', p_lead_id;
  END IF;
  
  -- Create customer record
  INSERT INTO public.customers (
    first_name,
    last_name,
    email,
    phone,
    address,
    address_line1,
    address_line2,
    city,
    state,
    zip_code,
    lead_id,
    stripe_customer_id,
    status,
    created_from_payment_id,
    activation_fee_paid,
    shipping_cost_paid,
    checkout_completed_at,
    created_at
  ) VALUES (
    v_lead_data.first_name,
    v_lead_data.last_name,
    v_lead_data.email,
    v_lead_data.phone,
    CONCAT_WS(', ', v_lead_data.address_line1, v_lead_data.city, v_lead_data.state, v_lead_data.zip_code),
    v_lead_data.address_line1,
    v_lead_data.address_line2,
    v_lead_data.city,
    v_lead_data.state,
    v_lead_data.zip_code,
    p_lead_id,
    p_stripe_customer_id,
    'active',
    p_stripe_payment_intent_id,
    p_activation_fee,
    p_shipping_cost,
    now(),
    now()
  ) RETURNING id INTO v_customer_id;
  
  -- Create payment records
  INSERT INTO public.payment_records (customer_id, lead_id, payment_type, amount, stripe_payment_intent_id, stripe_customer_id, status)
  VALUES 
    (v_customer_id, p_lead_id, 'shipping', p_shipping_cost, p_stripe_payment_intent_id, p_stripe_customer_id, 'completed'),
    (v_customer_id, p_lead_id, 'activation_fee', p_activation_fee, p_stripe_payment_intent_id, p_stripe_customer_id, 'completed');
  
  -- Update lead status
  UPDATE public.leads_fresh
  SET status = 'converted_to_customer',
      updated_at = now()
  WHERE id = p_lead_id;
  
  -- Update provisioning session with customer_id if exists
  UPDATE public.provisioning_sessions
  SET customer_id = v_customer_id
  WHERE lead_id = p_lead_id;
  
  RETURN v_customer_id;
END;
$$;