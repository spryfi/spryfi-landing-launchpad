import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CustomerData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  activation_fee_paid: number;
  shipping_cost_paid: number;
  created_from_payment_id: string;
  checkout_completed_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerId } = await req.json();

    // Initialize Supabase with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      throw new Error(`Customer not found: ${customerError?.message}`);
    }

    const customerData = customer as CustomerData;

    // Prepare email content
    const originalActivationFee = 99.00;
    const activationDiscount = originalActivationFee - customerData.activation_fee_paid;
    const totalPaid = customerData.activation_fee_paid + customerData.shipping_cost_paid;

    const emailContent = `
Hi ${customerData.first_name},

Welcome to SpryFi Home Internet! Your onboarding is complete and we're excited to get you connected.

**Order Summary:**
- Device: WiFi 7 AI Router
- Activation Fee: $${originalActivationFee.toFixed(2)}
- Activation Fee Discount: -$${activationDiscount.toFixed(2)}
- Shipping: $${customerData.shipping_cost_paid.toFixed(2)}
- Total Paid: $${totalPaid.toFixed(2)}

Your payment has been received. Your equipment will ship soon. You can manage your account anytime at our customer portal.

**Have questions or need help?**
Reach us at support@spryfi.net or simply reply to this email.

Thank you for choosing SpryFi!

— The SpryFi Home Internet Team

**Order Details:**
- Customer ID: ${customerData.id}
- Order Date: ${new Date(customerData.checkout_completed_at).toLocaleDateString()}
- Payment Reference: ${customerData.created_from_payment_id}

[Terms of Service: https://spryfi.net/terms]
    `;

    // Send email via SendGrid
    const emailPayload = {
      from: {
        email: "welcome@sprybroadband.com",
        name: "SpryFi Home Internet"
      },
      to: [
        {
          email: customerData.email,
          name: `${customerData.first_name} ${customerData.last_name}`
        }
      ],
      cc: [
        {
          email: "onboarding@spryfi.net"
        }
      ],
      subject: "Welcome to SpryFi Home Internet – Your Order Confirmation",
      content: [
        {
          type: "text/plain",
          value: emailContent
        }
      ]
    };

    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error("SendGrid error:", errorText);
      throw new Error(`SendGrid error: ${sendGridResponse.status} - ${errorText}`);
    }

    // Get SendGrid message ID from response headers
    const messageId = sendGridResponse.headers.get('x-message-id');
    console.log(`Confirmation email sent successfully. Message ID: ${messageId}`);

    // Update customer record with email sent timestamp and message ID
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        updated_at: new Date().toISOString(),
        // You might want to add a field for confirmation_email_sent_at and sendgrid_message_id
      })
      .eq('id', customerId);

    if (updateError) {
      console.error('Error updating customer record:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email sent successfully",
        messageId: messageId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to send confirmation email" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});