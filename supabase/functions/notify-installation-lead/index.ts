import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InstallationLead {
  leadId: string | null;
  paymentIntentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: InstallationLead = await req.json();
    console.log("Received installation lead notification:", data);

    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      throw new Error("SENDGRID_API_KEY not found");
    }

    const fullAddress = [data.addressLine1, data.city, data.state, data.zipCode]
      .filter(Boolean)
      .join(", ");

    const now = new Date().toLocaleString("en-US", {
      timeZone: "America/Central",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const subject = `🏠 New Installation Lead — ${data.firstName} ${data.lastName} — ${data.city}, ${data.state}`;

    const htmlContent = `
<h2 style="color:#0047AB;">New SpryFi Installation Lead</h2>
<p>A new customer has paid the <strong>$69 installation fee</strong> and is ready for scheduling.</p>

<table style="border-collapse:collapse;width:100%;max-width:500px;">
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;">Lead ID</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${data.leadId || "N/A"}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;">Payment ID</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${data.paymentIntentId}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${data.firstName} ${data.lastName}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:6px 12px;border-bottom:1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:6px 12px;border-bottom:1px solid #eee;"><a href="tel:${data.phone}">${data.phone}</a></td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;">Service Address</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${fullAddress}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;">Plan</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">SpryFi Home — $89.99/mo</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;">Paid</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">$69.00 installation fee</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;">Submitted</td><td style="padding:6px 12px;">${now}</td></tr>
</table>

<p style="margin-top:16px;"><strong>Action Required:</strong> Contact the customer to schedule their installation appointment.</p>
    `.trim();

    const plainContent = `
New SpryFi Installation Lead

Lead ID:         ${data.leadId || "N/A"}
Payment ID:      ${data.paymentIntentId}
Name:            ${data.firstName} ${data.lastName}
Email:           ${data.email}
Phone:           ${data.phone}
Service Address: ${fullAddress}
Plan:            SpryFi Home — $89.99/mo
Paid:            $69.00 installation fee
Submitted:       ${now}

Action Required: Contact the customer to schedule their installation appointment.
    `.trim();

    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: "info@sprywireless.com" }],
            subject,
          },
        ],
        from: { email: "notifications@sprybroadband.com", name: "SpryFi Notifications" },
        content: [
          { type: "text/plain", value: plainContent },
          { type: "text/html", value: htmlContent },
        ],
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error("SendGrid error:", errorText);
      throw new Error(`SendGrid API error: ${sendGridResponse.status} - ${errorText}`);
    }

    const messageId = sendGridResponse.headers.get("x-message-id");
    console.log("Installation lead email sent. Message ID:", messageId);

    return new Response(
      JSON.stringify({ success: true, messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-installation-lead:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
