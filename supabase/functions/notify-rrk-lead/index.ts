import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RRKLeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  contactPreference: "call" | "text";
  leadId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: RRKLeadData = await req.json();
    console.log("Received RRK lead notification:", data);

    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      throw new Error("SENDGRID_API_KEY not found");
    }

    const fullAddress = [
      data.addressLine1,
      data.addressLine2,
      data.city,
      data.state,
      data.zipCode,
    ]
      .filter(Boolean)
      .join(", ");

    const now = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const contactPrefText = data.contactPreference === "call" ? "📞 Prefers Phone Call" : "💬 Prefers Text Message";

    const subject = "RRK Lead";

    const htmlContent = `
<h2 style="color:#0047AB;">New RRK Lead — SpryFi Direct Coverage</h2>
<p>A new customer in our direct coverage area is ready to sign up. Please contact them to schedule their installation.</p>

<table style="border-collapse:collapse;width:100%;max-width:500px;">
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;background:#f9fafb;">Lead ID</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${data.leadId || "N/A"}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;background:#f9fafb;">Name</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${data.firstName} ${data.lastName}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;background:#f9fafb;">Email</td><td style="padding:6px 12px;border-bottom:1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;background:#f9fafb;">Phone</td><td style="padding:6px 12px;border-bottom:1px solid #eee;"><a href="tel:${data.phone}">${data.phone || "Not provided"}</a></td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;background:#f9fafb;">Service Address</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${fullAddress}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;background:#f9fafb;">Contact Preference</td><td style="padding:6px 12px;border-bottom:1px solid #eee;"><strong>${contactPrefText}</strong></td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold;background:#f9fafb;">Submitted</td><td style="padding:6px 12px;">${now}</td></tr>
</table>

<p style="margin-top:16px;color:#0047AB;"><strong>Action Required:</strong> Contact this customer within 24 hours to schedule their SpryFi installation.</p>
    `.trim();

    const plainContent = `
New RRK Lead — SpryFi Direct Coverage

A new customer in our direct coverage area is ready to sign up. Please contact them to schedule their installation.

Lead ID:            ${data.leadId || "N/A"}
Name:               ${data.firstName} ${data.lastName}
Email:              ${data.email}
Phone:              ${data.phone || "Not provided"}
Service Address:    ${fullAddress}
Contact Preference: ${contactPrefText}
Submitted:          ${now}

Action Required: Contact this customer within 24 hours to schedule their SpryFi installation.
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
    console.log("RRK lead email sent to info@sprywireless.com. Message ID:", messageId);

    return new Response(
      JSON.stringify({ success: true, messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-rrk-lead:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
