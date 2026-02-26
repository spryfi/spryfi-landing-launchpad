import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, customerEmail, customerName, leadId, serviceAddress } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const installationFee = amount; // already in cents ($69.00 = 6900)

    console.log(
      `Creating installation payment intent: $${(installationFee / 100).toFixed(2)} for ${customerEmail} at ${serviceAddress.addressLine1}, ${serviceAddress.city}, ${serviceAddress.state}`
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: installationFee,
      currency: "usd",
      description: `SpryFi Professional Installation — ${serviceAddress.addressLine1}, ${serviceAddress.city}, ${serviceAddress.state} ${serviceAddress.zipCode}`,
      receipt_email: customerEmail,
      metadata: {
        customer_name: customerName,
        service_address: serviceAddress.addressLine1,
        service_city: serviceAddress.city,
        service_state: serviceAddress.state,
        service_zip: serviceAddress.zipCode,
        charge_type: "installation_fee",
        lead_id: leadId || "",
        installation_fee: (installationFee / 100).toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`Installation payment intent created: ${paymentIntent.id}`);

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
    console.error("Error creating installation payment intent:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create installation payment intent",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
