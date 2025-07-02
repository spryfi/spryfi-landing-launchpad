import React from 'react';

export const Comparison = () => {
  const comparisons = [
    {
      bad: "❌ Hidden fees everywhere",
      good: "✅ One transparent price"
    },
    {
      bad: "❌ 2-year contracts required", 
      good: "✅ Month-to-month always"
    },
    {
      bad: "❌ Prices increase annually",
      good: "✅ Rate locked for life"
    },
    {
      bad: "❌ Equipment rental fees",
      good: "✅ Modem included free"
    },
    {
      bad: "❌ Data caps & throttling",
      good: "✅ Truly unlimited"
    }
  ];

  return (
    <section className="py-20 bg-white px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
          The Difference is Clear
        </h2>
        
        <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-2 bg-gray-800 text-white p-6">
            <div className="text-xl font-bold text-center">Big Cable Companies</div>
            <div className="text-xl font-bold text-center">SpryFi</div>
          </div>
          
          {comparisons.map((item, index) => (
            <div key={index} className="grid grid-cols-2 border-b border-gray-200 last:border-b-0">
              <div className="p-6 text-gray-700 bg-red-50 border-r border-gray-200">
                {item.bad}
              </div>
              <div className="p-6 text-gray-700 bg-green-50">
                {item.good}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};