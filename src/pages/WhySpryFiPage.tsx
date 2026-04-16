import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Heart, Users, Shield, Zap, DollarSign, HeadphonesIcon, CheckCircle2 } from 'lucide-react';

const WhySpryFiPage = () => {
  const handleCheckAvailability = () => {
    window.dispatchEvent(new CustomEvent('open-address-modal'));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-50 text-[#0047AB] text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-6 border border-blue-100">
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            We Don't Have Shareholders.
            <br />
            <span className="text-[#0047AB]">We Have Neighbors.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            SpryFi was born from a simple frustration: home internet shouldn't be this hard.
            We started because we believed families deserve reliable, honest internet — without the games big providers play.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Built by People Who Were Fed Up, Too</h2>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
                We've all been there. Hidden fees that show up on your bill. A 45-minute hold just to talk to someone. Internet that crawls at 7pm when the whole family is streaming.
              </p>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
                We built SpryFi because we wanted something different — not just better speeds, but a better experience. An internet company that treats you like a neighbor, not a number.
              </p>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                That means one honest price, real human support, and service that just works. Every day. For everything you do.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What We Believe</h3>
              <div className="space-y-5">
                {[
                  { icon: Heart, text: 'Customers are neighbors, not account numbers.' },
                  { icon: DollarSign, text: 'The price you see should be the price you pay.' },
                  { icon: HeadphonesIcon, text: 'Support should be human, fast, and helpful.' },
                  { icon: Shield, text: "If you're not happy, you shouldn't be locked in." },
                  { icon: Zap, text: 'Home internet should just work — every time.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-[#0047AB] mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 text-[15px]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Families Choose SpryFi</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              It's not just about faster internet. It's about a better way to connect your home.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: 'One Simple Price',
                description: 'No hidden fees, no equipment rentals, no surprise charges. What you see is what you pay — every single month.',
              },
              {
                icon: HeadphonesIcon,
                title: 'Personal Support, Always',
                description: 'Real humans, not robots. Reach us via live chat or phone anytime. We answer fast and we actually help.',
              },
              {
                icon: Zap,
                title: 'Internet That Just Works',
                description: 'Stream, game, work from home, video call — all at the same time. Whole-home coverage with unlimited data.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                  <item.icon className="w-7 h-7 text-[#0047AB]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick trust */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
            {['No contracts, ever', 'Free Dragon router included', '14-day money-back guarantee', 'Cancel anytime'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
          <Link
            to="/"
            className="inline-block bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold px-10 py-4 rounded-full text-lg shadow-xl transition-all"
          >
            Check Availability
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhySpryFiPage;
