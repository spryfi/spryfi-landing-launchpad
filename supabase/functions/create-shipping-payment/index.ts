import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
    const { amount, customerEmail, customerName, shippingAddress, leadId } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    console.log(`Creating payment intent for setup: $${(amount / 100).toFixed(2)} shipping + activation fee to ${customerEmail}`);

    // Calculate total amount (shipping + activation fee with 90% discount)
    const activationFee = 99.00; // Original $99 activation fee
    const discountPercent = 90;
    const discountedActivationFee = activationFee * ((100 - discountPercent) / 100); // $9.90
    const totalAmount = amount + (discountedActivationFee * 100); // Convert to cents

    // Create a payment intent for shipping + discounted activation fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount, // total amount in cents (shipping + discounted activation fee)
      currency: "usd",
      description: `SpryFi Setup: Shipping + Activation Fee to ${shippingAddress.city}, ${shippingAddress.state}`,
      receipt_email: customerEmail,
      metadata: {
        customer_name: customerName,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_zip: shippingAddress.zipCode,
        charge_type: "setup_payment",
        lead_id: leadId || '',
        shipping_cost: (amount / 100).toString(),
        activation_fee_original: activationFee.toString(),
        activation_fee_discounted: discountedActivationFee.toString(),
        discount_percent: discountPercent.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`Payment intent created: ${paymentIntent.id}`);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to create payment intent" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});