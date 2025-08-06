import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CustomerData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  checkout_completed_at: string;
  customer_id: string;
  lead_id?: string;
  ssid?: string;
  passkey?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const customerData: CustomerData = await req.json();
    console.log('Received new customer notification:', customerData);

    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    if (!sendGridApiKey) {
      throw new Error('SENDGRID_API_KEY not found in environment variables');
    }

    // Format the address
    const fullAddress = [
      customerData.address_line1,
      customerData.address_line2,
      customerData.city,
      customerData.state,
      customerData.zip_code
    ].filter(Boolean).join(', ');

    // Format the date
    const purchaseDate = new Date(customerData.checkout_completed_at).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Compose email content
    const emailSubject = `New SpryFi Customer Activated: Lead ${customerData.lead_id || 'N/A'} → Client ${customerData.customer_id}`;
    const emailContent = `
A new customer has just checked out and is live:

• Lead ID:   ${customerData.lead_id || 'N/A'}
• Client ID: ${customerData.customer_id}
• Name:      ${customerData.first_name} ${customerData.last_name}
• Email:     ${customerData.email}
• SSID:      ${customerData.ssid || 'N/A'}
• Passkey:   ${customerData.passkey || 'N/A'}
• Service Address: ${fullAddress}

Please follow up as needed.
    `;

    // Send email via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'newcustomer@spryfi.net' }],
            subject: emailSubject,
          },
        ],
        from: { email: 'notifications@sprybroadband.com', name: 'SpryFi Notifications' },
        content: [
          {
            type: 'text/html',
            value: emailContent,
          },
        ],
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('SendGrid API error:', errorText);
      throw new Error(`SendGrid API error: ${sendGridResponse.status} - ${errorText}`);
    }

    // Get message ID from SendGrid response headers
    const messageId = sendGridResponse.headers.get('x-message-id');
    console.log('Email sent successfully. Message ID:', messageId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Customer notification email sent successfully',
        messageId: messageId,
        customer_id: customerData.customer_id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in notify-new-customer function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);