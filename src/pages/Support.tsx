import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MessageCircle, Phone, Mail, Clock, HelpCircle, FileText } from 'lucide-react';

const Support = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            We're Here to Help
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Real humans. Fast answers. No transfers, no runaround.
          </p>
        </div>
      </section>

      {/* Contact methods */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Live Chat */}
          <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-gray-100 text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-7 h-7 text-[#0047AB]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              The fastest way to reach us. Click the chat icon on any page and a real person will respond.
            </p>
            <span className="inline-block text-sm font-medium text-[#0047AB]">
              Available anytime
            </span>
          </div>

          {/* Phone */}
          <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-gray-100 text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Phone className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Call us directly. No phone trees, no hold music marathons.
            </p>
            <a href="tel:+15127297797" className="inline-block text-sm font-bold text-[#0047AB] hover:underline">
              1-512-729-7797
            </a>
          </div>

          {/* Email */}
          <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-gray-100 text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Send us a message and we'll get back to you quickly.
            </p>
            <a href="mailto:support@sprywireless.com" className="inline-block text-sm font-bold text-[#0047AB] hover:underline">
              support@sprywireless.com
            </a>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="py-16 bg-gray-50 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Helpful Resources</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Link to="/faq" className="flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow group">
              <HelpCircle className="w-8 h-8 text-[#0047AB] flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-[#0047AB] transition-colors">FAQ</h3>
                <p className="text-gray-500 text-sm">Answers to common questions</p>
              </div>
            </Link>
            <Link to="/technical-details" className="flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow group">
              <FileText className="w-8 h-8 text-[#0047AB] flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-[#0047AB] transition-colors">Technical Details</h3>
                <p className="text-gray-500 text-sm">Speeds, equipment, and specs</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Support;
