-- Fix the convert_lead_to_customer function - remove net schema reference
CREATE OR REPLACE FUNCTION public.convert_lead_to_customer(p_lead_id uuid, p_stripe_payment_intent_id text, p_stripe_customer_id text, p_shipping_cost numeric, p_activation_fee numeric DEFAULT 9.90)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;

-- Fix the notification trigger to use http extension instead of net schema
CREATE OR REPLACE FUNCTION public.notify_new_customer()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  function_url text;
  response record;
BEGIN
  -- Construct the edge function URL
  function_url := 'https://efrzzqqtmiazlsmwprmt.supabase.co/functions/v1/notify-new-customer';
  
  -- Call the edge function with customer data using http extension
  SELECT * INTO response FROM http_post(
    function_url,
    jsonb_build_object(
      'first_name', NEW.first_name,
      'last_name', NEW.last_name,
      'email', NEW.email,
      'phone', NEW.phone,
      'address_line1', NEW.address_line1,
      'address_line2', NEW.address_line2,
      'city', NEW.city,
      'state', NEW.state,
      'zip_code', NEW.zip_code,
      'checkout_completed_at', NEW.checkout_completed_at,
      'customer_id', NEW.id::text
    )::text,
    'application/json'
  );
  
  RETURN NEW;
END;
$function$;