import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      leadId,
      paymentIntentId,
      customerData,
      shippingCost,
      activationFee = 9.90 // $99 with 90% discount
    } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Initialize Supabase with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log(`Converting lead ${leadId} to customer with payment ${paymentIntentId}`);

    // Get the payment intent from Stripe to verify payment and get customer ID
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(`Payment intent status: ${paymentIntent.status}`);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment has not succeeded');
    }

    let stripeCustomerId = paymentIntent.customer as string;

    // If no customer ID from payment intent, create/find customer
    if (!stripeCustomerId) {
      const customers = await stripe.customers.list({ 
        email: customerData.email, 
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: customerData.email,
          name: `${customerData.firstName} ${customerData.lastName}`,
          address: {
            line1: customerData.address,
            line2: customerData.apartment || undefined,
            city: customerData.city,
            state: customerData.state,
            postal_code: customerData.zipCode,
            country: customerData.country || 'US',
          },
          phone: customerData.phone,
        });
        stripeCustomerId = newCustomer.id;
        console.log(`Created new Stripe customer: ${stripeCustomerId}`);
      }
    }

    // Use the database function to convert lead to customer
    const { data: customerId, error: conversionError } = await supabase
      .rpc('convert_lead_to_customer', {
        p_lead_id: leadId,
        p_stripe_payment_intent_id: paymentIntentId,
        p_stripe_customer_id: stripeCustomerId,
        p_shipping_cost: shippingCost,
        p_activation_fee: activationFee
      });

    if (conversionError) {
      console.error('Conversion error:', conversionError);
      throw new Error(`Failed to convert lead to customer: ${conversionError.message}`);
    }

    console.log(`Successfully converted lead ${leadId} to customer ${customerId}`);

    return new Response(
      JSON.stringify({
        success: true,
        customerId: customerId,
        stripeCustomerId: stripeCustomerId,
        message: "Lead successfully converted to customer"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in convert-lead-to-customer:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to convert lead to customer" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});