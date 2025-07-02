import React from 'react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

export const LoyaltySavings = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="loyalty-hero">
        <div className="max-w-6xl mx-auto px-6">
          <div className="circle-badge">
            <div className="w-6 h-6 rounded-full border-2 border-white"></div>
            <span>LOYALTY CIRCLE</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Join the SpryFi Loyalty Circle</h1>
          <p className="hero-subtitle text-xl mb-8">Where commitment meets reward. Exclusive savings for members who know what they want.</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">8,400+</span>
              <span className="stat-label">Circle Members</span>
            </div>
            <div className="stat">
              <span className="stat-number">$2.1M</span>
              <span className="stat-label">Saved by Members</span>
            </div>
            <div className="stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Stay Full Term</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">A Simple Exchange of Value</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto">When you join the Loyalty Circle, you're making a smart financial decision. You get guaranteed savings, we get a valued long-term customer. Everyone wins.</p>
          
          <div className="value-cards grid md:grid-cols-3 gap-8">
            <div className="value-card bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-3">Your Commitment</h3>
              <p className="text-gray-600">Stay with SpryFi for 12 or 24 months</p>
            </div>
            <div className="value-card bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">Your Reward</h3>
              <p className="text-gray-600">Up to 16% off every single month</p>
            </div>
            <div className="value-card bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-3">Your Protection</h3>
              <p className="text-gray-600">Locked rates, VIP support, member perks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Choose Your Membership Level</h2>
            <p className="text-xl text-gray-600">All memberships include the same amazing SpryFi service. The only difference? How much you save.</p>
          </div>
          
          <div className="tiers-grid grid lg:grid-cols-3 gap-8">
            {/* Standard Month-to-Month */}
            <div className="tier-card standard bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <div className="tier-header mb-6">
                <h3 className="text-2xl font-bold mb-2">SpryFi Standard</h3>
                <span className="tier-badge bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">FLEXIBLE</span>
              </div>
              <div className="pricing-display space-y-4 mb-6">
                <div>
                  <div className="plan-name text-sm text-gray-600">Essential Plan</div>
                  <div className="price text-3xl font-bold">$99.95<span className="text-lg text-gray-500">/mo</span></div>
                </div>
                <div>
                  <div className="plan-name text-sm text-gray-600">Premium Plan</div>
                  <div className="price text-3xl font-bold">$139.95<span className="text-lg text-gray-500">/mo</span></div>
                </div>
              </div>
              <div className="tier-features mb-6">
                <h4 className="font-semibold mb-3">Perfect for:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Maximum flexibility</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Month-to-month freedom</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> No commitments</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Cancel anytime</li>
                </ul>
              </div>
              <div className="tier-footer">
                <p className="text-gray-600 mb-4">Our most flexible option</p>
                <Button variant="outline" className="w-full">Stay Flexible</Button>
              </div>
            </div>

            {/* 12-Month Silver Circle */}
            <div className="tier-card circle-silver bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-300">
              <div className="tier-header mb-6">
                <h3 className="text-2xl font-bold mb-2">Silver Circle</h3>
                <span className="tier-badge bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">8% SAVINGS</span>
                <div className="term-length text-sm text-gray-600 mt-1">12-month membership</div>
              </div>
              <div className="pricing-display space-y-4 mb-4">
                <div>
                  <div className="plan-name text-sm text-gray-600">Essential Plan</div>
                  <div className="original-price text-sm line-through text-gray-400">$99.95</div>
                  <div className="price text-3xl font-bold">$91.95<span className="text-lg text-gray-500">/mo</span></div>
                  <div className="monthly-savings text-sm text-green-600 font-semibold">Save $8/month</div>
                </div>
                <div>
                  <div className="plan-name text-sm text-gray-600">Premium Plan</div>
                  <div className="original-price text-sm line-through text-gray-400">$139.95</div>
                  <div className="price text-3xl font-bold">$128.75<span className="text-lg text-gray-500">/mo</span></div>
                  <div className="monthly-savings text-sm text-green-600 font-semibold">Save $11.20/month</div>
                </div>
              </div>
              <div className="annual-savings-badge bg-green-500 text-white p-3 rounded-lg text-center mb-6">
                <span className="font-semibold">Total Annual Savings: $96-$134</span>
              </div>
              <div className="tier-features mb-6">
                <h4 className="font-semibold mb-3">Silver Circle Benefits:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center"><span className="text-yellow-500 mr-2">⭐</span> 8% monthly discount</li>
                  <li className="flex items-center"><span className="text-yellow-500 mr-2">⭐</span> Rate locked for 12 months</li>
                  <li className="flex items-center"><span className="text-yellow-500 mr-2">⭐</span> Priority support queue</li>
                  <li className="flex items-center"><span className="text-yellow-500 mr-2">⭐</span> Early access to upgrades</li>
                </ul>
              </div>
              <div className="tier-footer">
                <p className="text-gray-600 mb-4"><strong>Ideal for:</strong> "I'm settled and saving"</p>
                <Button className="w-full btn-silver bg-gray-400 hover:bg-gray-500">Join Silver Circle</Button>
                <small className="text-xs text-gray-500 block mt-2">Terms and conditions apply</small>
              </div>
            </div>

            {/* 24-Month Gold Circle */}
            <div className="tier-card circle-gold relative bg-white rounded-2xl p-8 shadow-2xl border-3 border-yellow-400 transform scale-105">
              <div className="tier-label absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold">
                BEST VALUE
              </div>
              <div className="tier-header mb-6">
                <h3 className="text-2xl font-bold mb-2">Gold Circle</h3>
                <span className="tier-badge bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">16% SAVINGS</span>
                <div className="term-length text-sm text-gray-600 mt-1">24-month membership</div>
              </div>
              <div className="pricing-display space-y-4 mb-4">
                <div>
                  <div className="plan-name text-sm text-gray-600">Essential Plan</div>
                  <div className="original-price text-sm line-through text-gray-400">$99.95</div>
                  <div className="price text-3xl font-bold">$83.96<span className="text-lg text-gray-500">/mo</span></div>
                  <div className="monthly-savings text-sm text-green-600 font-semibold">Save $15.99/month</div>
                </div>
                <div>
                  <div className="plan-name text-sm text-gray-600">Premium Plan</div>
                  <div className="original-price text-sm line-through text-gray-400">$139.95</div>
                  <div className="price text-3xl font-bold">$117.56<span className="text-lg text-gray-500">/mo</span></div>
                  <div className="monthly-savings text-sm text-green-600 font-semibold">Save $22.39/month</div>
                </div>
              </div>
              <div className="annual-savings-badge bg-green-600 text-white p-3 rounded-lg text-center mb-6">
                <span className="font-semibold">Total 2-Year Savings: $384-$537</span>
              </div>
              <div className="tier-features mb-6">
                <h4 className="font-semibold mb-3">Gold Circle Benefits:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center"><span className="text-yellow-500 mr-2">🏆</span> 16% monthly discount</li>
                  <li className="flex items-center"><span className="text-yellow-500 mr-2">🏆</span> Rate locked for 24 months</li>
                  <li className="flex items-center"><span className="text-yellow-500 mr-2">🏆</span> VIP support hotline</li>
                  <li className="flex items-center"><span className="text-yellow-500 mr-2">🏆</span> Free equipment upgrades</li>
                  <li className="flex items-center"><span className="text-yellow-500 mr-2">🏆</span> Gold Circle member card</li>
                </ul>
              </div>
              <div className="tier-footer">
                <p className="text-gray-600 mb-4"><strong>Ideal for:</strong> "SpryFi is my forever choice"</p>
                <Button className="w-full btn-gold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold hover:from-yellow-500 hover:to-yellow-600">Join Gold Circle</Button>
                <small className="text-xs text-gray-500 block mt-2">Terms and conditions apply</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Benefits */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Loyalty Circle Exclusive Perks</h2>
          <div className="benefits-grid grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="benefit text-center">
              <div className="benefit-icon text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">Priority Everything</h3>
              <p className="text-gray-600">Skip the queue for support, upgrades, and installations</p>
            </div>
            <div className="benefit text-center">
              <div className="benefit-icon text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3">Price Protection</h3>
              <p className="text-gray-600">Your rate is locked. No surprises, no increases, guaranteed</p>
            </div>
            <div className="benefit text-center">
              <div className="benefit-icon text-4xl mb-4">🎁</div>
              <h3 className="text-xl font-bold mb-3">Member Rewards</h3>
              <p className="text-gray-600">Exclusive offers, early access to new features, and special perks</p>
            </div>
            <div className="benefit text-center">
              <div className="benefit-icon text-4xl mb-4">🏅</div>
              <h3 className="text-xl font-bold mb-3">VIP Treatment</h3>
              <p className="text-gray-600">Dedicated support line, account manager for Gold members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Math Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">The Smart Money Math</h2>
          <div className="calculator-showcase">
            <h3 className="text-2xl font-bold text-center mb-8">Let's Look at Premium Plan Savings:</h3>
            <div className="calc-comparison grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="calc-column bg-gray-100 p-8 rounded-2xl text-center">
                <h4 className="text-xl font-bold mb-4">Without Loyalty Circle</h4>
                <p className="calc-detail text-gray-600 mb-2">24 months @ $139.95/mo</p>
                <p className="calc-total text-3xl font-bold text-gray-900">Total: $3,358.80</p>
              </div>
              <div className="calc-column featured bg-green-50 border-2 border-green-500 p-8 rounded-2xl text-center">
                <h4 className="text-xl font-bold mb-4 text-green-700">Gold Circle Member</h4>
                <p className="calc-detail text-gray-600 mb-2">24 months @ $117.56/mo</p>
                <p className="calc-total text-3xl font-bold text-green-700">Total: $2,821.44</p>
                <p className="calc-savings text-2xl font-bold text-green-600 mt-2">You Save: $537.36</p>
              </div>
            </div>
            <p className="calc-note text-center text-xl font-semibold text-green-600 mt-8">That's like getting 3.8 months FREE!</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Fair Terms, Clear Conditions</h2>
          <div className="trust-grid grid md:grid-cols-3 gap-8">
            <div className="trust-item bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-600">Life Happens Clause</h3>
              <p className="text-gray-600 mb-4">Need to cancel early? We understand. Our early termination fees are reasonable and clearly stated.</p>
              <a href="/loyalty-terms" className="text-blue-600 hover:underline">View full terms →</a>
            </div>
            <div className="trust-item bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-600">Membership Rules</h3>
              <p className="text-gray-600 mb-4">Simple and straightforward. No hidden clauses, no gotchas. Just honest terms for honest savings.</p>
              <a href="/loyalty-terms" className="text-blue-600 hover:underline">Read the details →</a>
            </div>
            <div className="trust-item bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-600">Auto-Renewal</h3>
              <p className="text-gray-600">After your term, you continue at your Circle rate month-to-month. Want another term? Just ask!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to Join the Circle?</h2>
          <p className="text-xl text-gray-600 mb-8">Remember: Standard month-to-month is always available. The Loyalty Circle is simply here for those who want to save more.</p>
          <div className="cta-options flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button variant="outline" className="w-full md:w-auto">Continue with Standard</Button>
            <Button className="w-full md:w-auto bg-gray-400 hover:bg-gray-500 text-white">Join Silver Circle (Save 8%)</Button>
            <Button className="w-full md:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold hover:from-yellow-500 hover:to-yellow-600">Join Gold Circle (Save 16%)</Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">By joining the Loyalty Circle, you agree to our <a href="/loyalty-terms" className="text-blue-600 hover:underline">membership terms and conditions</a>.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};