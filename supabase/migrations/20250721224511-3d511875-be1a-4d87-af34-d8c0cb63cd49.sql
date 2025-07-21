-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http;

-- Create function to notify about new customers
CREATE OR REPLACE FUNCTION notify_new_customer()
RETURNS trigger AS $$
DECLARE
  function_url text;
BEGIN
  -- Construct the edge function URL
  function_url := 'https://efrzzqqtmiazlsmwprmt.supabase.co/functions/v1/notify-new-customer';
  
  -- Call the edge function with customer data
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
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
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_new_customer ON public.customers;

-- Create trigger that fires after each new customer is inserted
CREATE TRIGGER trigger_notify_new_customer
  AFTER INSERT ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_customer();