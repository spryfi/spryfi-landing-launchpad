import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

export const TechnicalDetails = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Link to="/#plans" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to plans
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Technical Details
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Speeds, equipment, and service details for our two plans.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-20">
        {/* Plan comparison table */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Plan Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-4 pr-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Feature</th>
                  <th className="py-4 px-4 text-sm font-semibold text-gray-900">SpryFi Home</th>
                  <th className="py-4 px-4 text-sm font-semibold text-gray-900">SpryFi Family</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { feature: 'Download Speed', home: 'Up to 250 Mbps', family: 'Up to 350 Mbps' },
                  { feature: 'Upload Speed', home: 'Up to 25 Mbps', family: 'Up to 35 Mbps' },
                  { feature: 'Data Cap', home: 'Unlimited', family: 'Unlimited' },
                  { feature: 'Connected Devices', home: 'Up to 128', family: 'Up to 128' },
                  { feature: 'Typical Latency', home: '25–50 ms', family: '25–50 ms' },
                  { feature: 'Monthly Price', home: '$89/mo', family: '$109/mo' },
                  { feature: 'Contract', home: 'None — month to month', family: 'None — month to month' },
                  { feature: 'Support', home: 'Live & chat support', family: 'Priority live & chat support' },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="py-4 pr-4 text-[15px] font-medium text-gray-700">{row.feature}</td>
                    <td className="py-4 px-4 text-[15px] text-gray-600">{row.home}</td>
                    <td className="py-4 px-4 text-[15px] text-gray-600">{row.family}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-5 leading-relaxed">
            Speeds listed are maximum achievable speeds. Actual speeds may vary based on location, network conditions, and number of connected devices.
          </p>
        </section>

        {/* Equipment */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Equipment</h2>
          <div className="bg-gray-50 rounded-2xl p-8 space-y-5">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Dragon High-Performance Router</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Included free with every plan. The Dragon router is a high-performance WiFi 7 gateway 
                designed to keep your entire home connected — with faster speeds, lower latency, and smoother 
                performance across more devices at once.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                'WiFi 7 technology',
                'Better performance for streaming, gaming, and video calls',
                'Improved multi-device performance across the home',
                'Up to 128 devices supported',
                'Simple plug-and-play setup',
                'No rental fees — yours to use for free',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-gray-600 leading-relaxed">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Installation */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Installation</h2>
          <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
            <p>
              SpryFi uses fixed wireless technology to deliver internet to your home — without the need 
              for cable or fiber installation. In most cases, setup includes placing a small outdoor receiver 
              and connecting it to your Dragon router indoors.
            </p>
            <p>
              Professional installation is available for a one-time fee. Many customers are able to 
              self-install using our guided setup process, which typically takes less than 30 minutes.
            </p>
          </div>
        </section>

        {/* Network */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Network & Performance</h2>
          <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
            <p>
              SpryFi operates on a modern fixed wireless access network built for reliable home internet. 
              It's designed to handle streaming, gaming, video calls, and multiple connected devices — 
              without the infrastructure limitations of traditional cable or DSL.
            </p>
            <p>
              On the SpryFi Home plan, speeds reach up to 250 Mbps. On the SpryFi Family plan, 
              speeds reach up to 350 Mbps — plenty of bandwidth for larger households with heavier usage.
            </p>
            <p>
              Typical latency ranges from 25–50 ms, depending on location and conditions. All plans 
              include unlimited data with no throttling or data caps.
            </p>
          </div>
        </section>

        {/* Service Notes */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Service Notes</h2>
          <div className="bg-gray-50 rounded-2xl p-8">
            <ul className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
                All plans are month-to-month with no long-term contract required.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
                14-day money-back guarantee applies to new subscribers.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
                SpryFi service is available in select areas. Check availability at your address before ordering.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
                Speeds and performance may vary by location, line-of-sight conditions, and network load.
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-2 pb-10">
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
