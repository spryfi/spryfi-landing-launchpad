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

export const SpryFiService = () => {
  const navigate = useNavigate();
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

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

  const handleGetStarted = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full border border-white/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16 max-w-3xl mx-auto">
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
          Great news! SpryFi is<br />available at your address
        </h1>
        <p className="text-lg text-blue-100 mb-2 text-center max-w-lg">
          You qualify for our direct SpryFi network — the best price we offer.
        </p>

        {/* Address */}
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

        {/* ─── Pricing Card ─── */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-gray-900 max-w-md w-full mb-8">
          <div className="text-center mb-6">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">SpryFi Home</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-6xl font-extrabold tracking-tight">$89.99</span>
              <span className="text-xl text-gray-400">/mo</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Unlimited home internet</p>
          </div>

          <div className="space-y-3 mb-8">
            {[
              'Truly unlimited — no data caps, ever',
              'No contracts, cancel anytime',
              'WiFi router included free',
              'No equipment or activation fees',
              'Simple setup — plug in and go',
              '14-day money-back guarantee',
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleGetStarted}
            className="w-full py-4 bg-[#0047AB] hover:bg-[#0060D4] text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Get Started
          </button>
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-4 max-w-md w-full mb-8">
          {[
            { icon: '✨', label: 'Simple setup' },
            { icon: '🔒', label: 'No contracts' },
            { icon: '📦', label: 'Free router' },
          ].map((item) => (
            <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-xl mb-0.5">{item.icon}</div>
              <div className="text-xs font-medium text-blue-100">{item.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-blue-200 hover:text-white text-sm underline transition"
        >
          Back to home
        </button>
      </div>

      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          qualificationData={{
            qualified: true,
            address: {
              addressLine1: coverageData.address.addressLine1,
              addressLine2: coverageData.address.addressLine2 || '',
              city: coverageData.address.city,
              state: coverageData.address.state,
              zipCode: coverageData.address.zipCode,
            },
            contact: {
              firstName: coverageData.contact.firstName,
              lastName: coverageData.contact.lastName,
              email: coverageData.contact.email,
              phone: '',
            },
            qualificationResult: {
              qualified: true,
              source: 'spryfi',
              network_type: 'spryfi',
            },
          }}
        />
      )}
    </div>
  );
};
