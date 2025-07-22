-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS notify_new_customer_trigger ON public.customers;

-- Create the trigger to call the notification function when a new customer is inserted
CREATE TRIGGER notify_new_customer_trigger
    AFTER INSERT ON public.customers
    FOR EACH ROW 
    EXECUTE FUNCTION public.notify_new_customer();