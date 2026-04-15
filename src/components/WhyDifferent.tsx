import React from 'react';
import lifestyleImg from '@/assets/internet-lifestyle.jpg';
import { DollarSign, HeadphonesIcon, Wifi, MessageCircle, Phone, CheckCircle2 } from 'lucide-react';

export const WhyDifferent = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-blue-50 text-[#0047AB] text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-6 border border-blue-100">
            The SpryFi Difference
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Internet That Just Works.
            <br />
            <span className="text-[#0047AB]">For Everything You Do.</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            No complicated bundles. No surprise fees. No runaround.
            Just fast, reliable internet with real people who care.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-100/50 to-transparent rounded-3xl" />
            <img
              src={lifestyleImg}
              alt="Family enjoying seamless internet at home"
              loading="lazy"
              width={1280}
              height={854}
              className="relative rounded-2xl shadow-xl w-full object-cover"
            />
          </div>

          {/* Value props */}
          <div className="space-y-8">
            {/* One Price */}
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">One Simple Price</h3>
                <p className="text-gray-500 leading-relaxed">
                  The price you see is the price you pay. No hidden fees, no equipment rentals,
                  no surprise charges on your bill. Ever.
                </p>
              </div>
            </div>

            {/* Personal Support */}
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                <HeadphonesIcon className="w-7 h-7 text-[#0047AB]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Personal Support, Always</h3>
                <p className="text-gray-500 leading-relaxed">
                  Real humans, not robots. Reach us anytime via live chat or phone — 
                  we're always here when you need us.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0047AB]">
                    <MessageCircle className="w-4 h-4" /> Live Chat
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0047AB]">
                    <Phone className="w-4 h-4" /> Phone Support
                  </span>
                </div>
              </div>
            </div>

            {/* Just Works */}
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Wifi className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Internet That Just Works</h3>
                <p className="text-gray-500 leading-relaxed">
                  Stream, game, work from home, video call — all at the same time.
                  Whole-home coverage with zero buffering.
                </p>
              </div>
            </div>

            {/* Quick confidence bullets */}
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                {['No contracts required', 'Free premium modem', 'Setup in minutes', 'Cancel anytime'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
