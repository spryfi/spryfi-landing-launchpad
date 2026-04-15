import React from 'react';
import dragonModem from '@/assets/dragon-modem.jpg';
import { Shield, Wifi, Battery, Zap, Monitor, Lock } from 'lucide-react';

export const DragonModem = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-950 to-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block bg-red-600/20 text-red-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-red-500/30">
            INCLUDED FREE WITH YOUR PLAN
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Dragon 5G High Performance
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              Internet Modem
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Engineered for gamers, businesses, and high-demand users
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-red-500/10 blur-[100px] rounded-full" />
            <img
              src={dragonModem}
              alt="Dragon 5G High Performance Internet Modem"
              loading="lazy"
              width={800}
              height={800}
              className="relative z-10 w-full max-w-md rounded-2xl"
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-5xl font-black text-green-400">FREE</span>
              <span className="text-2xl text-gray-500 line-through">$699.95</span>
            </div>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              With its high-speed capabilities and robust reliability, the Dragon modem is perfect for intensive tasks — ensuring seamless gaming, uninterrupted business operations, and whole-home coverage.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <Zap className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">High-Performance</h4>
                  <p className="text-gray-400 text-xs mt-1">Designed for demanding use cases</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <Monitor className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">128 Devices</h4>
                  <p className="text-gray-400 text-xs mt-1">Connect your entire home or office</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <Lock className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Advanced Security</h4>
                  <p className="text-gray-400 text-xs mt-1">Enterprise-grade network protection</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <Battery className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Battery Backup</h4>
                  <p className="text-gray-400 text-xs mt-1">Stay online even during outages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
