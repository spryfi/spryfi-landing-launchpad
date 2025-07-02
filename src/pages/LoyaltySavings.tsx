import React from 'react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

export const LoyaltySavings = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="loyalty-hero">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Loyalty Savings Program</h1>
          <p className="hero-subtitle text-xl mb-8">Love month-to-month? Keep it! Want to save more? We've got you.</p>
          <div className="hero-disclaimer">
            <span className="badge">100% OPTIONAL</span>
            <span className="separator text-white/60">•</span>
            <span className="badge">CANCEL ANYTIME</span>
            <span className="separator text-white/60">•</span>
            <span className="badge">NO PENALTIES</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Introduction */}
          <div className="intro-section text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Here's the Deal</h2>
            <div className="max-w-4xl mx-auto space-y-4 text-lg text-gray-600">
              <p>We built SpryFi on the principle of no contracts because we hate them too. But some customers asked if they could get a discount for committing to stick around. So we created this.</p>
              <p className="font-semibold text-gray-900">The important part: This is completely optional. Month-to-month is our default and always will be.</p>
            </div>
          </div>

          {/* Savings Options */}
          <div className="savings-grid">
            {/* Month to Month */}
            <div className="savings-card default">
              <div className="card-header">
                <h3 className="text-2xl font-bold mb-2">Month-to-Month</h3>
                <span className="default-badge">DEFAULT OPTION</span>
              </div>
              <div className="pricing my-6">
                <div className="price text-4xl font-bold text-gray-900">$99.95</div>
                <div className="term text-gray-600">per month</div>
              </div>
              <ul className="benefits space-y-2 mb-6">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Cancel anytime</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> No commitment</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Full flexibility</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Most popular choice</li>
              </ul>
              <div className="card-footer">
                <p className="text-gray-600">Perfect if you value flexibility</p>
              </div>
            </div>

            {/* 12 Month */}
            <div className="savings-card">
              <div className="card-header">
                <h3 className="text-2xl font-bold mb-2">12-Month Loyalty</h3>
                <span className="savings-badge">SAVE $60/YEAR</span>
              </div>
              <div className="pricing my-6">
                <div className="price text-4xl font-bold text-gray-900">$94.95</div>
                <div className="term text-gray-600">per month</div>
                <div className="savings-detail text-green-600 font-semibold">$5 off monthly</div>
              </div>
              <ul className="benefits space-y-2 mb-6">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Modest savings</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Rate locked for 12 months</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Can still cancel (small fee)</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Auto-converts to month-to-month</li>
              </ul>
              <div className="card-footer">
                <p className="text-gray-600">Good for: "I'll probably stick around"</p>
              </div>
            </div>

            {/* 24 Month */}
            <div className="savings-card best-value">
              <div className="card-header">
                <h3 className="text-2xl font-bold mb-2">24-Month Loyalty</h3>
                <span className="savings-badge">SAVE $240/2 YEARS</span>
              </div>
              <div className="pricing my-6">
                <div className="price text-4xl font-bold text-gray-900">$89.95</div>
                <div className="term text-gray-600">per month</div>
                <div className="savings-detail text-green-600 font-semibold">$10 off monthly</div>
              </div>
              <ul className="benefits space-y-2 mb-6">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Maximum savings</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Rate locked for 24 months</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Protection from price changes</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> VIP support priority</li>
              </ul>
              <div className="card-footer">
                <p className="text-gray-600">Good for: "SpryFi is my forever ISP"</p>
              </div>
            </div>
          </div>

          {/* The Fine Print Section */}
          <div className="fine-print-section">
            <h2 className="text-3xl font-bold mb-8 text-center">The Friendly Fine Print</h2>
            <div className="fine-print-grid">
              <div className="fine-print-item">
                <h4 className="text-xl font-semibold mb-3 text-blue-600">What if I need to cancel?</h4>
                <p className="mb-3">Life happens. If you're on a loyalty term and need to cancel:</p>
                <ul className="list-disc list-inside mb-3 space-y-1">
                  <li>12-month: Pay remainder of months or $50, whichever is less</li>
                  <li>24-month: Pay remainder of months or $100, whichever is less</li>
                </ul>
                <p className="note">Way more reasonable than the $200+ other ISPs charge.</p>
              </div>
              
              <div className="fine-print-item">
                <h4 className="text-xl font-semibold mb-3 text-blue-600">What happens after my term?</h4>
                <p>You automatically go month-to-month at your loyalty rate. No surprises, no price hikes. Want another term? Just let us know.</p>
              </div>
              
              <div className="fine-print-item">
                <h4 className="text-xl font-semibold mb-3 text-blue-600">Can I switch between terms?</h4>
                <p>Absolutely! Switch from month-to-month to a loyalty term anytime. Going from a longer term to shorter? We'll prorate everything fairly.</p>
              </div>
              
              <div className="fine-print-item">
                <h4 className="text-xl font-semibold mb-3 text-blue-600">Is this really optional?</h4>
                <p>100% yes. Most of our customers stay month-to-month and we love them for it. This is just here if YOU want to save some money.</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2 className="text-3xl font-bold mb-8 text-center">Quick Questions</h2>
            
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="faq-item">
                <h4 className="text-xl font-semibold mb-3 text-gray-900">Why offer this if you hate contracts?</h4>
                <p className="text-gray-600">Because customers asked for it. Some people know they're not going anywhere and want the savings. This gives them that option without forcing it on everyone else.</p>
              </div>
              
              <div className="faq-item">
                <h4 className="text-xl font-semibold mb-3 text-gray-900">Will you pressure me to sign up for a term?</h4>
                <p className="text-gray-600">Never. Our sales team doesn't get bigger commissions for terms. Month-to-month is genuinely fine with us.</p>
              </div>
              
              <div className="faq-item">
                <h4 className="text-xl font-semibold mb-3 text-gray-900">Is the service different on loyalty terms?</h4>
                <p className="text-gray-600">Nope, same great SpryFi service. The only difference is you save money and get priority support access.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <h2 className="text-3xl font-bold mb-4">Ready to Choose?</h2>
            <p className="text-lg text-gray-600 mb-8">Remember: Month-to-month is totally fine. Only choose a loyalty term if it makes sense for YOU.</p>
            <div className="cta-buttons">
              <Button className="btn btn-primary">Continue with Month-to-Month</Button>
              <Button variant="outline" className="btn btn-secondary">Select 12-Month Savings</Button>
              <Button variant="outline" className="btn btn-secondary">Select 24-Month Savings</Button>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};