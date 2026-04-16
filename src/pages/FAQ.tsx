import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
}

const faqSections: { title: string; items: FAQItem[] }[] = [
  {
    title: 'Plans & Billing',
    items: [
      {
        question: 'What plans does SpryFi offer?',
        answer: 'We offer two simple plans — SpryFi Home ($89/mo) for everyday households and SpryFi Family ($109/mo) for heavier use with more devices. Both include unlimited data and a free Dragon router.',
      },
      {
        question: 'Are there any hidden fees?',
        answer: 'None. The price you see is the price you pay. No equipment rental fees, no activation fees, no surprise charges.',
      },
      {
        question: 'Do I need a contract?',
        answer: 'No. All SpryFi plans are month-to-month. You can cancel anytime with no penalties or termination fees.',
      },
      {
        question: 'What is the Loyalty Circle?',
        answer: "Loyalty Circle is an optional savings program for customers who choose to commit for a longer period. It's completely optional — our standard plans are always month-to-month.",
      },
    ],
  },
  {
    title: 'Installation & Equipment',
    items: [
      {
        question: 'How does installation work?',
        answer: 'SpryFi uses fixed wireless technology — no cable or fiber installation needed. We ship a Dragon router and a small outdoor receiver to your door. Many customers self-install in under 30 minutes. Professional installation is also available.',
      },
      {
        question: 'Is the router really free?',
        answer: 'Yes. Every plan includes a high-performance WiFi 7 Dragon router at no charge. No rental fees, no equipment costs.',
      },
      {
        question: 'What is the Dragon router?',
        answer: "The Dragon is a WiFi 7 gateway that supports up to 128 devices, delivers faster speeds, lower latency, and better whole-home coverage. It's designed for modern household use.",
      },
    ],
  },
  {
    title: 'Speed & Performance',
    items: [
      {
        question: 'What speeds can I expect?',
        answer: 'SpryFi Home delivers speeds up to 250 Mbps and SpryFi Family delivers up to 350 Mbps. Speeds are designed for streaming, gaming, video calls, and multiple devices at once.',
      },
      {
        question: 'Is there a data cap?',
        answer: 'No. All plans include truly unlimited data with no throttling or caps.',
      },
      {
        question: 'What about latency?',
        answer: 'Typical latency ranges from 25–50 ms depending on location and conditions, which works well for gaming, video calls, and everyday use.',
      },
    ],
  },
  {
    title: 'Cancellation & Returns',
    items: [
      {
        question: 'Can I cancel anytime?',
        answer: 'Yes. SpryFi is month-to-month. Cancel whenever you want — no penalties, no fees, no hassle.',
      },
      {
        question: 'What is the money-back guarantee?',
        answer: "New subscribers get a full 14-day money-back guarantee. If SpryFi doesn't work for you, we'll refund your first month.",
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        question: 'How do I get help?',
        answer: 'You can reach us anytime via live chat or phone at 1-512-729-7797. Real humans, fast responses, no runaround.',
      },
      {
        question: 'What are your support hours?',
        answer: 'Our support team is available to help you whenever you need us. Reach out by chat or phone.',
      },
    ],
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<string | null>(null);

  const toggle = (key: string) => setOpenIndex(openIndex === key ? null : key);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-28 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-500">
            Everything you need to know about SpryFi, in plain English.
          </p>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item, i) => {
                  const key = `${section.title}-${i}`;
                  const isOpen = openIndex === key;
                  return (
                    <div key={key} className="border-b border-gray-50">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full text-left py-4 flex items-center justify-between gap-4 group"
                      >
                        <span className="text-[15px] font-medium text-gray-800 group-hover:text-[#0047AB] transition-colors">
                          {item.question}
                        </span>
                        <span className="text-gray-400 text-xl flex-shrink-0 transition-transform" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <p className="text-gray-500 text-[15px] leading-relaxed pb-4 pl-0">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still have questions?</h2>
          <p className="text-gray-500 mb-6">Our team is here to help — reach out anytime.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/support"
              className="bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold px-8 py-3 rounded-full transition-all"
            >
              Contact Support
            </Link>
            <Link
              to="/"
              className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-full transition-all"
            >
              Check Availability
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
