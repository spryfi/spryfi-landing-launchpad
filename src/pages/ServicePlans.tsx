import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";

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
  provider: string;
  serviceable: boolean;
}

export const ServicePlans = () => {
  const navigate = useNavigate();
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("coverage_result");
    if (!raw) {
      navigate("/");
      return;
    }
    try {
      setCoverageData(JSON.parse(raw));
    } catch {
      navigate("/");
    }
  }, [navigate]);

  if (!coverageData) return null;

  const handleGetStarted = (planType: string) => {
    setSelectedPlan(planType);
    sessionStorage.setItem(
      "qualification_result",
      JSON.stringify({
        qualified: true,
        network_type: "spryfi",
        provider: "spryfi",
      })
    );
    setShowCheckout(true);
  };

  const plans = [
    {
      name: "SpryFi Home",
      price: "$89",
      subtitle: "Great for 1-3 people",
      description: "Perfect for everyday browsing, streaming, and working from home.",
      planType: "spryfi-home",
      features: [
        "Unlimited internet — no data caps",
        "No contracts, cancel anytime",
        "WiFi router included free",
        "No equipment or activation fees",
        "Simple setup — plug in and go",
        "14-day money-back guarantee",
      ],
      popular: false,
    },
    {
      name: "SpryFi Home",
      price: "$129",
      subtitle: "Built for bigger households",
      description: "More bandwidth for families, gamers, and homes with lots of devices.",
      planType: "spryfi-home-premium",
      features: [
        "Unlimited internet — no data caps",
        "No contracts, cancel anytime",
        "WiFi router included free",
        "No equipment or activation fees",
        "Priority support",
        "14-day money-back guarantee",
      ],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full border border-white/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6 py-16 max-w-4xl mx-auto">
        {/* Branding */}
        <div className="text-center mb-2">
          <div className="text-white text-4xl font-bold tracking-tight">SpryFi</div>
          <div className="text-blue-200 text-sm font-medium mt-1">Internet that just works</div>
        </div>

        {/* Success badge */}
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
          You're covered!
        </h1>
        <p className="text-lg text-blue-100 mb-2 text-center max-w-lg">
          Your address qualifies for SpryFi Home Internet — fast, reliable, and truly unlimited.
        </p>

        {/* Address */}
        {coverageData.address && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-10 text-center border border-white/20 max-w-md w-full">
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

        {/* ─── Two Plan Cards ─── */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full mb-10">
          {plans.map((plan) => (
            <div
              key={plan.planType}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "bg-white text-gray-900 shadow-2xl ring-1 ring-gray-200"
                  : "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/15"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0047AB] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md">
                    Best for Families
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className={`text-sm ${plan.popular ? "text-gray-500" : "text-blue-200"}`}>
                  {plan.subtitle}
                </p>
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                <span className={`text-lg ${plan.popular ? "text-gray-400" : "text-blue-200"}`}>/mo</span>
              </div>

              <p className={`text-sm mb-6 leading-relaxed ${plan.popular ? "text-gray-600" : "text-blue-100"}`}>
                {plan.description}
              </p>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-green-500" : "text-blue-200"}`} />
                    <span className={`text-sm ${plan.popular ? "text-gray-600" : "text-blue-100"}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleGetStarted(plan.planType)}
                className={`w-full py-3.5 text-base font-bold rounded-xl transition-all duration-200 ${
                  plan.popular
                    ? "bg-[#0047AB] text-white hover:bg-[#0060D4] shadow-lg"
                    : "bg-white text-[#0047AB] hover:bg-gray-50 shadow-md"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Trust */}
        <div className="grid grid-cols-3 gap-4 max-w-md w-full mb-8">
          {[
            { icon: "📡", label: "5G network" },
            { icon: "🔒", label: "No contracts" },
            { icon: "📦", label: "Free router" },
          ].map((item) => (
            <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-xl mb-0.5">{item.icon}</div>
              <div className="text-xs font-medium text-blue-100">{item.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-blue-200 hover:text-white text-sm underline transition"
        >
          Back to home
        </button>
      </div>

      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          preselectedPlan={selectedPlan || undefined}
          qualificationData={{
            qualified: true,
            address: {
              addressLine1: coverageData.address.addressLine1,
              addressLine2: coverageData.address.addressLine2 || "",
              city: coverageData.address.city,
              state: coverageData.address.state,
              zipCode: coverageData.address.zipCode,
            },
            contact: {
              firstName: coverageData.contact.firstName,
              lastName: coverageData.contact.lastName,
              email: coverageData.contact.email,
              phone: "",
            },
            qualificationResult: {
              qualified: true,
              source: "spryfi",
              network_type: "spryfi",
            },
          }}
        />
      )}
    </div>
  );
};
