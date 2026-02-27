import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Phone, MessageSquare, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CoverageData {
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  provider: string;
  serviceable: boolean;
  leadId?: string;
}

// Phone input mask: formats as (512) 555-1234
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const SpryFiService = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [phone, setPhone] = useState("");
  const [contactPreference, setContactPreference] = useState<"call" | "text">("call");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  useEffect(() => {
    const raw = sessionStorage.getItem("coverage_result");
    if (!raw) {
      navigate("/");
      return;
    }
    try {
      const data = JSON.parse(raw);
      setCoverageData(data);
    } catch {
      navigate("/");
    }
  }, [navigate]);

  if (!coverageData) return null;

  const handleSubmit = async () => {
    // Validate phone (must have 10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toast({
        title: "Phone required",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Send notification email to info@sprywireless.net
      await supabase.functions.invoke("notify-rrk-lead", {
        body: {
          firstName: coverageData.contact.firstName,
          lastName: coverageData.contact.lastName,
          email: coverageData.contact.email,
          phone: phone,
          addressLine1: coverageData.address.addressLine1,
          addressLine2: coverageData.address.addressLine2 || "",
          city: coverageData.address.city,
          state: coverageData.address.state,
          zipCode: coverageData.address.zipCode,
          contactPreference: contactPreference,
          leadId: coverageData.leadId || null,
        },
      });

      // Update lead if we have an ID
      if (coverageData.leadId) {
        try {
          await supabase.from("leads_fresh").update({
            phone: phone,
            contact_preference: contactPreference,
            status: "rrk_submitted",
            updated_at: new Date().toISOString(),
          }).eq("id", coverageData.leadId);
        } catch (err) {
          console.error("Lead update failed (non-blocking):", err);
        }
      }

      // Show thank you toast and redirect to home
      toast({
        title: "Thank you!",
        description: `We'll ${contactPreference === "call" ? "call" : "text"} you within 24 hours to schedule your installation.`,
      });
      
      // Clear session and redirect home
      sessionStorage.removeItem("coverage_result");
      navigate("/");
    } catch (err: any) {
      console.error("Submit error:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again or give us a call directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Collect phone & preference ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white relative overflow-hidden">
      <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full border border-white/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-2">
          <div className="text-white text-4xl font-bold tracking-tight">SpryFi</div>
          <div className="text-blue-200 text-sm font-medium mt-1">Internet that just works</div>
        </div>

        <div className="my-6">
          <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)] relative">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.65-4.35-1.65-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.86 9.14 5 13z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center leading-tight">
          Great news! SpryFi is<br />available at your address
        </h1>
        <p className="text-lg text-blue-100 mb-2 text-center max-w-lg">
          You qualify for our direct SpryFi network — faster and less expensive than Starlink or ViaSat, with zero data limits.
        </p>

        {coverageData.address && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 text-center border border-white/20 max-w-md w-full">
            <p className="text-xs text-blue-200 mb-0.5">Your address</p>
            <p className="font-semibold text-sm">
              {coverageData.address.addressLine1}
              {coverageData.address.addressLine2 && `, ${coverageData.address.addressLine2}`}
            </p>
            <p className="font-semibold text-sm">
              {coverageData.address.city}, {coverageData.address.state} {coverageData.address.zipCode}
            </p>
          </div>
        )}

        {/* ─── Contact Form Card ─── */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-gray-900 max-w-md w-full mb-8">
          <div className="text-center mb-6">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">SpryFi Home</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold tracking-tight">$89.99</span>
              <span className="text-xl text-gray-400">/mo</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Unlimited home internet</p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              "Truly unlimited — no data caps, ever",
              "No contracts, cancel anytime",
              "Professional on-site installation",
              "14-day money-back guarantee",
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <hr className="my-6" />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(512) 555-1234"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How should we contact you?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setContactPreference("call")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition ${
                    contactPreference === "call"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">Call me</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContactPreference("text")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition ${
                    contactPreference === "text"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">Text me</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#0047AB] hover:bg-[#0060D4] disabled:bg-gray-400 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Get Scheduled"
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            We'll contact you within 24 hours to schedule your installation.
          </p>
        </div>

        {/* Contact info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md w-full mb-8 border border-white/20">
          <p className="text-center text-blue-100 mb-4">
            Want to schedule right now? Give us a call!
          </p>
          <div className="flex flex-col items-center gap-3">
            <a
              href="tel:512-656-8732"
              className="flex items-center gap-2 text-white font-semibold hover:text-blue-200 transition"
            >
              <Phone className="w-5 h-5" />
              (512) 656-8732
            </a>
            <a
              href="mailto:info@sprywireless.net"
              className="flex items-center gap-2 text-blue-200 hover:text-white transition"
            >
              <Mail className="w-4 h-4" />
              info@sprywireless.net
            </a>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-blue-200 hover:text-white text-sm underline transition"
        >
          Back to home
        </button>
      </div>
    </div>
  );
};
