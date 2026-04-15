import React from 'react';
import dragonModem from '@/assets/dragon-modem.png';
import { Battery, Zap, Monitor, Lock } from 'lucide-react';

export const DragonModem = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block bg-red-600/20 text-red-400 text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-6 border border-red-500/30">
            Included Free With Your Plan
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-3 tracking-tight">
            Dragon High Performance
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 mb-6">
            Internet Modem
          </h3>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Engineered for gamers, businesses, and high-demand users
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image with dramatic presentation */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/15 to-orange-500/10 blur-[120px] rounded-full scale-75" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/40 blur-2xl rounded-full" />
            <img
              src={dragonModem}
              alt="Dragon High Performance Internet Modem"
              loading="lazy"
              className="relative z-10 w-full max-w-lg rounded-3xl drop-shadow-[0_35px_80px_rgba(239,68,68,0.3)] drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Details with clear hierarchy */}
          <div>
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-6xl font-black text-green-400 tracking-tight">FREE</span>
              <span className="text-2xl text-gray-600 line-through decoration-2">$699.95</span>
            </div>
            <p className="text-green-400/70 text-sm font-medium mb-8 tracking-wide uppercase">
              With every SpryFi plan
            </p>

            <p className="text-gray-300 text-lg mb-10 leading-relaxed">
              With its high-speed capabilities and robust reliability, the Dragon modem is perfect for intensive tasks — ensuring seamless gaming, uninterrupted business operations, and whole-home coverage.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:bg-white/[0.06] transition-colors">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Zap className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-0.5">High-Performance</h4>
                  <p className="text-gray-500 text-xs">Designed for demanding use cases</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:bg-white/[0.06] transition-colors">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Monitor className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-0.5">128 Devices</h4>
                  <p className="text-gray-500 text-xs">Connect your entire home or office</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:bg-white/[0.06] transition-colors">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Lock className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-0.5">Advanced Security</h4>
                  <p className="text-gray-500 text-xs">Enterprise-grade network protection</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:bg-white/[0.06] transition-colors">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Battery className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-0.5">Battery Backup</h4>
                  <p className="text-gray-500 text-xs">Stay online even during outages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
