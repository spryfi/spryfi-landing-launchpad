import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

export const TechnicalDetails = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/#plans" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to plans
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Technical Details
          </h1>
          <p className="text-gray-500 text-lg">
            Speeds, equipment, and service details for our two plans.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Plan comparison table */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 pr-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Feature</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-900">SpryFi Home</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-900">SpryFi Family</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { feature: 'Download Speed', home: 'Up to 100 Mbps', family: 'Up to 300 Mbps' },
                  { feature: 'Upload Speed', home: 'Up to 10 Mbps', family: 'Up to 20 Mbps' },
                  { feature: 'Data Cap', home: 'Unlimited', family: 'Unlimited' },
                  { feature: 'Connected Devices', home: 'Up to 128', family: 'Up to 128' },
                  { feature: 'Typical Latency', home: '25–50 ms', family: '25–50 ms' },
                  { feature: 'Monthly Price', home: '$89/mo', family: '$109/mo' },
                  { feature: 'Contract', home: 'None — month to month', family: 'None — month to month' },
                  { feature: 'Support', home: 'Live & chat support', family: 'Priority live & chat support' },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="py-3 pr-4 text-sm font-medium text-gray-700">{row.feature}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{row.home}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{row.family}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Speeds listed are maximum achievable speeds. Actual speeds may vary based on location, network conditions, and number of connected devices.
          </p>
        </section>

        {/* Equipment */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Equipment</h2>
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Dragon High-Performance Router</h3>
              <p className="text-sm text-gray-600">
                Included free with every plan. The Dragon router is a high-performance WiFi 6 gateway designed 
                to cover your entire home. It supports up to 128 simultaneous device connections and provides 
                both 2.4 GHz and 5 GHz bands for optimal performance.
              </p>
            </div>
            <ul className="space-y-2">
              {[
                'WiFi 6 (802.11ax) technology',
                'Dual-band: 2.4 GHz + 5 GHz',
                'Up to 128 devices supported',
                'Simple plug-and-play setup',
                'No rental fees — yours to use for free',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Installation */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Installation</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              SpryFi uses fixed wireless technology to deliver internet to your home. There is no cable line 
              or fiber installation required. In most cases, setup involves placing a small outdoor receiver 
              and connecting it to your Dragon router indoors.
            </p>
            <p>
              Professional installation is available for a one-time fee. Many customers are able to 
              self-install using our guided setup process, which typically takes under 30 minutes.
            </p>
          </div>
        </section>

        {/* Network */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Network & Performance</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              SpryFi operates on a next-generation fixed wireless access (FWA) network. This delivers 
              reliable, high-speed internet without the infrastructure limitations of traditional cable 
              or DSL connections.
            </p>
            <p>
              Typical latency ranges from 25–50 ms, which is suitable for video conferencing, online 
              gaming, and real-time applications. All plans include unlimited data with no throttling 
              or data caps.
            </p>
          </div>
        </section>

        {/* Fair use */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Notes</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• All plans are month-to-month with no long-term contract required.</li>
            <li>• 14-day money-back guarantee applies to new subscribers.</li>
            <li>• SpryFi service is available in select areas. Check availability at your address before ordering.</li>
            <li>• Speeds and performance may vary by location, line-of-sight conditions, and network load.</li>
          </ul>
        </section>

        {/* CTA */}
        <div className="text-center pt-4 pb-8">
          <Link
            to="/#plans"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#0047AB] hover:bg-[#003580] text-white font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to plans
          </Link>
        </div>
      </div>
    </div>
  );
};
