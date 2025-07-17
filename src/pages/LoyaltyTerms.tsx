import { TableOfContents } from "@/components/ui/table-of-contents";
import { Card, CardContent } from "@/components/ui/card";
import { MailIcon } from "lucide-react";

const SECTIONS = [
  { id: "service-overview", title: "Service Overview" },
  { id: "equipment-policy", title: "Equipment & WiFi 7 AI Router Policy" },
  { id: "activation-billing", title: "Activation & Billing" },
  { id: "money-back", title: "Money-Back Guarantee" },
  { id: "how-to-cancel", title: "How to Cancel" },
  { id: "usage-policy", title: "Usage Policy" },
  { id: "limitations", title: "Service Limitations & Network Management" },
  { id: "payment", title: "Payment, Nonpayment & Credit Reporting" },
  { id: "returns", title: "Returns & Unreturned Equipment" },
  { id: "support", title: "Support & Downtime Credits" },
  { id: "changes", title: "Changes to Terms" },
  { id: "disputes", title: "Disputes & Arbitration" },
];

export function LoyaltyTerms() {
  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <Card className="mx-auto max-w-4xl border-none bg-card shadow-none">
          <CardContent className="p-6 md:p-10">
            <header className="mb-10 text-center">
              <h1 className="mb-2 text-4xl font-bold tracking-tight">SpryFi Home Internet</h1>
              <h4 className="mb-6 text-lg text-muted-foreground">Terms of Service</h4>
              <p className="text-sm text-muted-foreground">Last Updated: July 2025</p>
            </header>

            <p className="mb-10 text-muted-foreground">
              Welcome to SpryFi Home Internet, powered by Spry Wireless Communications Inc. We're committed to providing internet that just works—with simple, fair, and clear terms so you always know what to expect. Please review our Terms of Service below. If you have any questions, reach out any time.
            </p>

            <TableOfContents className="mb-12" items={SECTIONS} />

            <div className="space-y-12">
              <section id="service-overview">
                <h2 className="mb-6 text-2xl font-bold text-primary">1. Service Overview</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li><strong>SpryFi Home Internet</strong> is available for residents within the continental United States.</li>
                  <li>Service is intended for <strong>personal, in-home use only</strong>. Sharing with neighbors, public spaces, or commercial use is strictly prohibited unless you have written approval from SpryFi.</li>
                  <li>Service is delivered via leading national wireless networks. Coverage and performance depend on your location and may change as network providers upgrade their systems.</li>
                  <li>By using SpryFi Home Internet, you agree to these Terms as well as any policies from our network partners.</li>
                </ul>
              </section>

              <section id="equipment-policy">
                <h2 className="mb-6 text-2xl font-bold text-primary">2. Equipment & WiFi 7 AI Router Policy</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li>All routers and equipment provided to you remain the property of Spry Wireless Communications Inc.</li>
                  <li>You <strong>rent</strong> the SpryFi WiFi 7 AI Router as part of your subscription.</li>
                  <li><strong>Return the router in good condition if you cancel.</strong>
                    <ul className="ml-6 mt-2 space-y-2">
                      <li>If you do not return your router within 14 days of cancellation, you will be charged a <strong>$549 non-return fee</strong>.</li>
                      <li>Returned routers must be in original condition, with all included accessories. Excessive damage, missing items, or modifications may result in additional charges.</li>
                    </ul>
                  </li>
                  <li>Do not use the SpryFi router for commercial or shared Wi-Fi without written consent.</li>
                </ul>
              </section>

              <section id="activation-billing">
                <h2 className="mb-6 text-2xl font-bold text-primary">3. Activation & Billing</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li>Service requires a valid debit or credit card on file for automatic monthly billing.</li>
                  <li>All customers pay the first month of service and activation fees at checkout.</li>
                  <li><strong>Monthly subscription fees</strong> and router rental charges are billed in advance every 30 days.</li>
                  <li>Activation, shipping, and SIM fees are non-refundable.</li>
                  <li>We may adjust pricing or terms as needed; if we do, you'll get at least 30 days' notice via email or portal notification.</li>
                </ul>
              </section>

              <section id="money-back">
                <h2 className="mb-6 text-2xl font-bold text-primary">4. Money-Back Guarantee</h2>
                <div className="space-y-4 text-card-foreground">
                  <p><strong>Try SpryFi risk-free!</strong> You get a <strong>14-day Money-Back Guarantee</strong> from the date your router is delivered.</p>
                  <ul className="ml-6 list-inside space-y-2">
                    <li>Return your router in good, working condition within 14 days for a full refund of your subscription and rental fee.</li>
                    <li>Shipping, SIM, and activation fees are not refundable.</li>
                    <li>If the router is damaged or not returned, fees will apply (see Section 9).</li>
                  </ul>
                </div>
              </section>

              <section id="how-to-cancel">
                <h2 className="mb-6 text-2xl font-bold text-primary">5. How to Cancel</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li>Cancel your service at any time by either:
                    <ul className="ml-6 mt-2 space-y-2">
                      <li>Emailing <strong>cancel@spryfi.net</strong></li>
                      <li>Logging into your SpryFi Customer Portal</li>
                    </ul>
                  </li>
                  <li>After you cancel, we'll send you prepaid return instructions for your router.</li>
                  <li>You have 14 days to return your router. If it's not returned, you will be charged the <strong>$549 non-return fee</strong>.</li>
                  <li>Service continues (and is billed) until the router is received and processed.</li>
                </ul>
              </section>

              <section id="usage-policy">
                <h2 className="mb-6 text-2xl font-bold text-primary">6. Usage Policy</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li><strong>For personal home use only.</strong> Sharing your SpryFi connection with neighbors, public spaces, or unauthorized users is not allowed.</li>
                  <li>No running servers, providing public Wi-Fi, or using the service for business purposes unless you have written SpryFi approval.</li>
                  <li>Excessive or abusive usage (continuous streaming, public guest Wi-Fi, web hosting, or attempts to bypass limits) may result in account suspension or termination.</li>
                </ul>
              </section>

              <section id="limitations">
                <h2 className="mb-6 text-2xl font-bold text-primary">7. Service Limitations & Network Management</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li>SpryFi Home Internet operates on major carrier networks. Coverage, speed, and data allowances are determined by those network providers and are subject to change.</li>
                  <li><strong>No minimum speeds or uptime guarantees.</strong> We provide service "as is"—though we always work hard to ensure reliability.</li>
                  <li>Data limits may apply based on your plan or the network provider's policies.</li>
                  <li>Service may be interrupted by outages, weather, maintenance, or events beyond our control.</li>
                </ul>
              </section>

              <section id="payment">
                <h2 className="mb-6 text-2xl font-bold text-primary">8. Payment, Nonpayment & Credit Reporting</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li><strong>Auto-pay is required.</strong> If your payment fails, your service is suspended until payment is made.</li>
                  <li>If your account goes unpaid or you do not return equipment, your balance may be sent to a third-party collections agency and <strong>reported to credit bureaus</strong>, which may impact your credit score.</li>
                  <li>A <strong>$50 reactivation fee</strong> applies if service is suspended for nonpayment.</li>
                  <li>Disputing charges (chargebacks) will result in immediate service suspension, a $25 dispute fee, and may make you ineligible for future SpryFi service.</li>
                </ul>
              </section>

              <section id="returns">
                <h2 className="mb-6 text-2xl font-bold text-primary">9. Returns & Unreturned Equipment</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li>If you cancel, you must return the SpryFi WiFi 7 AI Router (and all accessories) in good, original condition within 14 days.</li>
                  <li>If you fail to return the equipment, or if it is returned damaged or missing items, you will be charged a <strong>$549 replacement fee</strong>.</li>
                  <li>Returns must follow the instructions provided after cancellation (including use of a prepaid shipping label and proper packaging).</li>
                  <li>Do <strong>not</strong> send back equipment without requesting cancellation and receiving a return authorization.</li>
                </ul>
              </section>

              <section id="support">
                <h2 className="mb-6 text-2xl font-bold text-primary">10. Support & Downtime Credits</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li><strong>Support is included!</strong> Reach us by chat, email, or portal for any help with your SpryFi service or router.</li>
                  <li>If you experience a service outage, you may request a downtime credit from our support team. Credits are issued from the time you contact us about the issue.</li>
                </ul>
              </section>

              <section id="changes">
                <h2 className="mb-6 text-2xl font-bold text-primary">11. Changes to Terms</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li>SpryFi Home Internet may update these Terms at any time. We'll always give you at least 30 days' notice of any material change.</li>
                  <li>Continued use of your service after changes means you accept the new terms.</li>
                </ul>
              </section>

              <section id="disputes">
                <h2 className="mb-6 text-2xl font-bold text-primary">12. Disputes & Arbitration</h2>
                <ul className="list-inside space-y-4 text-card-foreground">
                  <li>If you have a problem, <strong>please contact us first</strong>—we want to resolve it quickly and fairly.</li>
                  <li>If we can't resolve your issue, both parties agree to binding arbitration in San Antonio, Texas, rather than going to court.</li>
                  <li>The prevailing party in arbitration may recover costs and attorney's fees.</li>
                </ul>
              </section>
            </div>

            <div className="mt-20 text-center">
              <p className="mb-4 text-lg font-bold">Thank you for choosing SpryFi Home Internet!</p>
              <p className="text-muted-foreground">We're here to keep you connected, simply and reliably—no hidden rules or fine print.</p>
            </div>

            <footer className="mt-20 border-t pt-10">
              <h3 className="mb-6 text-xl font-bold">Have questions?</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MailIcon className="h-5 w-5" />
                <a href="mailto:support@spryfi.net" className="text-primary hover:underline">
                  support@spryfi.net
                </a>
                <span>or through your customer portal.</span>
              </div>
              <p className="mt-8 text-sm text-muted-foreground">SpryFi Home Internet is a service of Spry Wireless Communications Inc.</p>
            </footer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}