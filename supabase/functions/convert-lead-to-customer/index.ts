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
    console.log('🔥🔥🔥 CONVERT LEAD TO CUSTOMER - EXTREME DEBUG MODE 🔥🔥🔥');
    console.log('📥 STEP 1: Function invoked with request body');
    
    const requestBody = await req.json();
    console.log('📥 Raw request body:', JSON.stringify(requestBody, null, 2));
    
    const {
      leadId,
      paymentIntentId,
      customerData,
      shippingCost,
      activationFee = 9.90 // $99 with 90% discount
    } = requestBody;

    console.log('📥 STEP 2: Parsed parameters');
    console.log('📥 leadId:', leadId, '(type:', typeof leadId, ')');
    console.log('📥 paymentIntentId:', paymentIntentId);
    console.log('📥 customerData:', JSON.stringify(customerData, null, 2));
    console.log('📥 shippingCost:', shippingCost);
    console.log('📥 activationFee:', activationFee);

    // Validate required parameters
    if (!leadId) {
      console.error('❌ CRITICAL: leadId is missing or falsy');
      throw new Error('leadId is required');
    }
    if (!paymentIntentId) {
      console.error('❌ CRITICAL: paymentIntentId is missing');
      throw new Error('paymentIntentId is required');
    }
    if (!customerData || !customerData.email) {
      console.error('❌ CRITICAL: customerData or email is missing');
      throw new Error('customerData with email is required');
    }

    console.log('✅ STEP 3: All required parameters validated');

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error('❌ CRITICAL: STRIPE_SECRET_KEY environment variable not set');
      throw new Error('Stripe configuration missing');
    }
    console.log('✅ STEP 4: Stripe secret key found');

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    console.log('✅ STEP 5: Stripe client initialized');

    // Initialize Supabase with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ CRITICAL: Supabase environment variables missing');
      throw new Error('Supabase configuration missing');
    }
    console.log('✅ STEP 6: Supabase environment variables found');

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { 
      auth: { persistSession: false } 
    });
    console.log('✅ STEP 7: Supabase client initialized');

    console.log(`🚀 STEP 8: Converting lead ${leadId} to customer with payment ${paymentIntentId}`);

    // Get the payment intent from Stripe to verify payment and get customer ID
    console.log('💳 STEP 9: Retrieving payment intent from Stripe...');
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(`💳 STEP 10: Payment intent retrieved - status: ${paymentIntent.status}`);
    console.log('💳 Payment intent details:', JSON.stringify({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      customer: paymentIntent.customer,
      currency: paymentIntent.currency
    }, null, 2));

    if (paymentIntent.status !== 'succeeded') {
      console.error(`❌ CRITICAL: Payment status is ${paymentIntent.status}, not succeeded`);
      throw new Error(`Payment has not succeeded. Status: ${paymentIntent.status}`);
    }
    console.log('✅ STEP 11: Payment verified as succeeded');

    let stripeCustomerId = paymentIntent.customer as string;
    console.log('👤 STEP 12: Initial Stripe customer ID from payment:', stripeCustomerId);

    // If no customer ID from payment intent, create/find customer
    if (!stripeCustomerId) {
      console.log('👤 STEP 13: No customer ID found, searching for existing customer by email...');
      const customers = await stripe.customers.list({ 
        email: customerData.email, 
        limit: 1 
      });
      console.log(`👤 Found ${customers.data.length} existing customers for email: ${customerData.email}`);
      
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
        console.log(`👤 STEP 14: Using existing Stripe customer: ${stripeCustomerId}`);
      } else {
        console.log('👤 STEP 14: Creating new Stripe customer...');
        const newCustomerData = {
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
        };
        console.log('👤 New customer payload:', JSON.stringify(newCustomerData, null, 2));
        
        const newCustomer = await stripe.customers.create(newCustomerData);
        stripeCustomerId = newCustomer.id;
        console.log(`👤 STEP 15: Created new Stripe customer: ${stripeCustomerId}`);
      }
    } else {
      console.log('✅ STEP 13-15: Using existing Stripe customer from payment intent');
    }

    // Use the database function to convert lead to customer
    console.log('🏗️ STEP 16: Calling convert_lead_to_customer database function...');
    const dbFunctionParams = {
      p_lead_id: leadId,
      p_stripe_payment_intent_id: paymentIntentId,
      p_stripe_customer_id: stripeCustomerId,
      p_shipping_cost: shippingCost,
      p_activation_fee: activationFee
    };
    console.log('🏗️ Database function parameters:', JSON.stringify(dbFunctionParams, null, 2));

    const { data: customerId, error: conversionError } = await supabase
      .rpc('convert_lead_to_customer', dbFunctionParams);

    console.log('🏗️ STEP 17: Database function completed');
    console.log('🏗️ Returned customer ID:', customerId);
    console.log('🏗️ Conversion error:', conversionError);

    if (conversionError) {
      console.error('❌ CRITICAL: Database conversion error:', JSON.stringify(conversionError, null, 2));
      throw new Error(`Failed to convert lead to customer: ${conversionError.message}`);
    }

    if (!customerId) {
      console.error('❌ CRITICAL: No customer ID returned from database function');
      throw new Error('Database function did not return a customer ID');
    }

    console.log(`🎉 STEP 18: Successfully converted lead ${leadId} to customer ${customerId}`);

    // Send confirmation email
    console.log('📧 STEP 19: Attempting to send confirmation email...');
    try {
      const emailUrl = `${supabaseUrl}/functions/v1/send-confirmation-email`;
      const emailPayload = { customerId: customerId };
      console.log('📧 Email endpoint:', emailUrl);
      console.log('📧 Email payload:', JSON.stringify(emailPayload, null, 2));

      const emailResponse = await fetch(emailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify(emailPayload),
      });

      console.log('📧 Email response status:', emailResponse.status);
      console.log('📧 Email response ok:', emailResponse.ok);

      if (!emailResponse.ok) {
        const emailErrorText = await emailResponse.text();
        console.error("❌ Failed to send confirmation email:", emailErrorText);
      } else {
        const emailSuccessText = await emailResponse.text();
        console.log("✅ STEP 20: Confirmation email sent successfully:", emailSuccessText);
      }
    } catch (emailError) {
      console.error("❌ Error sending confirmation email:", emailError);
      console.error("❌ Email error stack:", emailError.stack);
      // Don't fail the conversion if email fails
    }

    // The database trigger should automatically send the newcustomer@spryfi.net notification
    console.log('🔔 STEP 21: Database trigger should automatically notify newcustomer@spryfi.net');

    const successResponse = {
      success: true,
      customerId: customerId,
      stripeCustomerId: stripeCustomerId,
      message: "Lead successfully converted to customer"
    };

    console.log('🎉 STEP 22: Conversion completed successfully');
    console.log('🎉 Final response:', JSON.stringify(successResponse, null, 2));

    return new Response(
      JSON.stringify(successResponse),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌❌❌ CRITICAL FAILURE in convert-lead-to-customer ❌❌❌");
    console.error("❌ Error type:", error.constructor.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Full error object:", JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to convert lead to customer",
        details: "Check edge function logs for detailed error information"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});