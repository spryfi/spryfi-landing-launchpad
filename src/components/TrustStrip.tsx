import React from 'react';
import { Shield, CreditCard, Wifi, Package, Calendar } from 'lucide-react';

export const TrustStrip = () => {
  const items = [
    { icon: Calendar, label: 'No Contracts' },
    { icon: CreditCard, label: 'No Hidden Fees' },
    { icon: Wifi, label: 'Unlimited Data' },
    { icon: Package, label: 'Free Router' },
    { icon: Shield, label: '14-Day Guarantee' },
  ];

  return (
    <section className="bg-white border-b border-gray-100 py-5 px-6">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-10 gap-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <item.icon className="w-4 h-4 text-[#0047AB]" />
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
};
