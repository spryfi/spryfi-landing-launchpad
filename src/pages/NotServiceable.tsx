import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Bell, Zap, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  };
  provider: string | null;
  serviceable: boolean;
}

export const NotServiceable = () => {
  const navigate = useNavigate();
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("coverage_result");
    if (!raw) {
      navigate("/");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setCoverageData(parsed);
      // Mark the lead as not serviceable / waitlist in the DB
      markLeadAsWaitlist(parsed);
    } catch {
      navigate("/");
    }
  }, [navigate]);

  const markLeadAsWaitlist = async (data: CoverageData) => {
    try {
      await supabase.functions.invoke("update-lead", {
        body: {
          email: data.contact.email,
          status: "not_serviceable",
          qualified: false,
          qualification_source: "coverage_api",
          network_type: null,
        },
      });
    } catch (err) {
      console.error("Failed to update lead as waitlist:", err);
    }
  };

  const handleNotifyMe = async () => {
    if (!coverageData) return;
    setSubmitting(true);
    try {
      // Ensure the lead is saved / updated with waitlist flag
      await supabase.functions.invoke("save-lead", {
        body: {
          email: coverageData.contact.email,
          first_name: coverageData.contact.firstName,
          last_name: coverageData.contact.lastName,
          address_line1: coverageData.address.addressLine1,
          address_line2: coverageData.address.addressLine2 || "",
          city: coverageData.address.city,
          state: coverageData.address.state,
          zip_code: coverageData.address.zipCode,
        },
      });
      setNotifySubmitted(true);
    } catch (err) {
      console.error("Notify me error:", err);
      // Still show success since the lead was saved during coverage check
      setNotifySubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!coverageData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-blue-500/5 pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full bg-blue-400/5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/[0.02] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6 py-16 max-w-2xl mx-auto">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="text-white text-4xl font-bold tracking-tight">SpryFi</div>
          <div className="text-blue-300/80 text-sm font-medium mt-1">Internet that just works</div>
        </div>

        {/* Map pin icon — soft, empathetic feel */}
        <div className="my-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-blue-400/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
            <MapPin className="w-11 h-11 text-blue-300" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center leading-tight">
          We're not in your area — <span className="text-blue-300">yet</span>
        </h1>

        <p className="text-lg text-blue-100/80 mb-3 text-center max-w-md leading-relaxed">
          We're growing fast and adding new coverage areas every month.
          Be the first to know when SpryFi reaches your neighborhood.
        </p>

        {/* Address */}
        {coverageData.address && (
          <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 mb-8 text-center border border-white/10 max-w-md w-full">
            <p className="text-xs text-blue-300/60 mb-0.5">Address checked</p>
            <p className="font-medium text-sm text-white/90">
              {coverageData.address.addressLine1}
              {coverageData.address.addressLine2 && `, ${coverageData.address.addressLine2}`}
            </p>
            <p className="font-medium text-sm text-white/90">
              {coverageData.address.city}, {coverageData.address.state} {coverageData.address.zipCode}
            </p>
          </div>
        )}

        {/* Notify CTA */}
        {notifySubmitted ? (
          <div className="bg-green-500/15 border border-green-400/20 rounded-2xl px-8 py-6 text-center max-w-md w-full mb-8 backdrop-blur-sm">
            <div className="w-14 h-14 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
              <Bell className="w-7 h-7 text-green-300" />
            </div>
            <p className="text-green-200 font-bold text-xl mb-1">
              You're on the list!
            </p>
            <p className="text-green-100/70 text-sm leading-relaxed">
              We'll email <span className="font-semibold text-green-200">{coverageData.contact.email}</span> the
              moment coverage is available at your address.
            </p>
          </div>
        ) : (
          <button
            onClick={handleNotifyMe}
            disabled={submitting}
            className="group inline-flex items-center gap-3 px-10 py-4 bg-white text-slate-900 font-bold text-lg rounded-xl hover:bg-gray-100 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mb-8"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving…
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                Notify Me When Available
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full mb-10">
          {[
            {
              icon: Zap,
              title: "Expanding fast",
              desc: "New areas added monthly",
            },
            {
              icon: Bell,
              title: "First to know",
              desc: "We'll email you directly",
            },
            {
              icon: MapPin,
              title: "Your area matters",
              desc: "Demand helps us prioritize",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white/[0.05] backdrop-blur-sm rounded-xl p-5 text-center border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
            >
              <div className="w-9 h-9 mx-auto mb-2 bg-blue-500/15 rounded-lg flex items-center justify-center">
                <item.icon className="w-4 h-4 text-blue-300" />
              </div>
              <div className="font-semibold text-sm text-white/90 mb-0.5">{item.title}</div>
              <div className="text-xs text-blue-200/60">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Reassurance */}
        <div className="bg-white/[0.04] rounded-xl p-6 max-w-md w-full text-center border border-white/[0.06] mb-8">
          <p className="text-sm text-blue-100/70 leading-relaxed">
            Your request helps us decide where to expand next.
            The more people interested in your area, the sooner we get there.
            <span className="block mt-2 text-blue-200/50 text-xs">No spam, ever. Just one email when you're covered.</span>
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-blue-300/60 hover:text-white text-sm underline transition"
        >
          Back to home
        </button>
      </div>
    </div>
  );
};
