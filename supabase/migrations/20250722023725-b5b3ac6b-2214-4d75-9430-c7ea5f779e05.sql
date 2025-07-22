-- Create trigger to automatically send email notification when new customer is created
CREATE OR REPLACE TRIGGER notify_new_customer_trigger
    AFTER INSERT ON public.customers
    FOR EACH ROW 
    EXECUTE FUNCTION public.notify_new_customer();