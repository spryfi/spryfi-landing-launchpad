import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const LoyaltyTerms = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="terms-header">
        <div className="max-w-6xl mx-auto px-6">
          <Link to="/" className="back-link">← Back to Home</Link>
          <div className="header-content">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Loyalty Circle Terms & Conditions</h1>
            <p className="header-subtitle">Everything you need to know about your membership, in plain English</p>
            <p className="last-updated">Last updated: December 2024</p>
          </div>
        </div>
      </header>

      {/* Quick Navigation */}
      <nav className="terms-nav">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-lg font-semibold mb-2">Jump to:</h3>
          <div className="nav-links">
            <a href="#overview">Overview</a>
            <a href="#eligibility">Eligibility</a>
            <a href="#discounts">Discounts</a>
            <a href="#commitments">Commitments</a>
            <a href="#cancellation">Cancellation</a>
            <a href="#changes">Changes</a>
            <a href="#renewal">Renewal</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="terms-content">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Overview Section */}
          <section id="overview" className="terms-section">
            <h2 className="text-3xl font-bold mb-6">1. Program Overview</h2>
            <div className="section-content">
              <p>The SpryFi Loyalty Circle is an optional membership program that provides discounted monthly rates in exchange for a service commitment of either 12 or 24 months.</p>
              
              <div className="key-points">
                <h3>Key Points:</h3>
                <ul>
                  <li>Membership is completely optional - month-to-month service is always available</li>
                  <li>Two membership levels: Silver Circle (12 months) and Gold Circle (24 months)</li>
                  <li>Discounts apply for the entire membership term</li>
                  <li>All members receive the same high-quality SpryFi service</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Eligibility Section */}
          <section id="eligibility" className="terms-section">
            <h2 className="text-3xl font-bold mb-6">2. Eligibility Requirements</h2>
            <div className="section-content">
              <h3>Who Can Join:</h3>
              <ul>
                <li>New SpryFi customers during initial signup</li>
                <li>Existing month-to-month customers in good standing</li>
                <li>Customers must be 18 years or older</li>
                <li>Service address must be within SpryFi coverage area</li>
              </ul>
              
              <h3>Restrictions:</h3>
              <ul>
                <li>Cannot combine with other promotional offers</li>
                <li>Limited to residential accounts only</li>
                <li>One membership per account</li>
              </ul>
            </div>
          </section>

          {/* Discount Structure */}
          <section id="discounts" className="terms-section">
            <h2 className="text-3xl font-bold mb-6">3. Discount Structure</h2>
            <div className="section-content">
              <div className="discount-table">
                <h3>Silver Circle (12-Month Membership)</h3>
                <ul>
                  <li><strong>Discount:</strong> 8% off standard monthly rate</li>
                  <li><strong>Essential Plan:</strong> $91.95/month (regularly $99.95)</li>
                  <li><strong>Premium Plan:</strong> $128.75/month (regularly $139.95)</li>
                  <li><strong>Total Savings:</strong> $96-$134 over 12 months</li>
                </ul>
                
                <h3>Gold Circle (24-Month Membership)</h3>
                <ul>
                  <li><strong>Discount:</strong> 16% off standard monthly rate</li>
                  <li><strong>Essential Plan:</strong> $83.96/month (regularly $99.95)</li>
                  <li><strong>Premium Plan:</strong> $117.56/month (regularly $139.95)</li>
                  <li><strong>Total Savings:</strong> $384-$537 over 24 months</li>
                </ul>
              </div>
              
              <div className="important-note">
                <p><strong>Important:</strong> Discounted rates are locked for the entire membership term. SpryFi will not increase your rate during your commitment period.</p>
              </div>
            </div>
          </section>

          {/* Membership Commitments */}
          <section id="commitments" className="terms-section">
            <h2 className="text-3xl font-bold mb-6">4. Your Membership Commitment</h2>
            <div className="section-content">
              <p>By joining the Loyalty Circle, you agree to:</p>
              <ul>
                <li>Maintain active SpryFi service for the full membership term (12 or 24 months)</li>
                <li>Pay your monthly bill on time</li>
                <li>Keep your account in good standing</li>
                <li>Notify us of any service address changes</li>
              </ul>
              
              <h3>What We Promise:</h3>
              <ul>
                <li>Your discounted rate won't change during your term</li>
                <li>Same great SpryFi service and support</li>
                <li>Priority support access for Circle members</li>
                <li>All standard SpryFi features and benefits</li>
              </ul>
            </div>
          </section>

          {/* Early Cancellation */}
          <section id="cancellation" className="terms-section">
            <h2 className="text-3xl font-bold mb-6">5. Early Cancellation Policy</h2>
            <div className="section-content">
              <div className="cancellation-box">
                <h3>If You Need to Cancel Early:</h3>
                <p>We understand that circumstances change. If you need to cancel before your membership term ends, an early termination fee applies:</p>
                
                <div className="fee-structure">
                  <h4>Silver Circle (12-month):</h4>
                  <ul>
                    <li>Months 1-3: $75 early termination fee</li>
                    <li>Months 4-6: $50 early termination fee</li>
                    <li>Months 7-9: $40 early termination fee</li>
                    <li>Months 10-12: $25 early termination fee</li>
                  </ul>
                  
                  <h4>Gold Circle (24-month):</h4>
                  <ul>
                    <li>Months 1-6: $150 early termination fee</li>
                    <li>Months 7-12: $100 early termination fee</li>
                    <li>Months 13-18: $75 early termination fee</li>
                    <li>Months 19-24: $50 early termination fee</li>
                  </ul>
                </div>
                
                <p className="note"><strong>Note:</strong> These fees are designed to roughly offset the discounts you've received, ensuring fairness for all customers.</p>
              </div>
              
              <h3>Exceptions to Early Termination Fees:</h3>
              <ul>
                <li>Military deployment (with orders)</li>
                <li>Death of account holder</li>
                <li>Moving to area without SpryFi coverage (verification required)</li>
                <li>Extended service outages (per our Service Level Agreement)</li>
              </ul>
            </div>
          </section>

          {/* Service Changes */}
          <section id="changes" className="terms-section">
            <h2 className="text-3xl font-bold mb-6">6. Changes During Your Membership</h2>
            <div className="section-content">
              <h3>What You CAN Change:</h3>
              <ul>
                <li>Upgrade from Essential to Premium plan (keeps your Circle discount)</li>
                <li>Add or remove optional features</li>
                <li>Update payment method</li>
                <li>Change service address (within coverage area)</li>
              </ul>
              
              <h3>What You CANNOT Change:</h3>
              <ul>
                <li>Downgrade from Premium to Essential (without penalty)</li>
                <li>Switch to a different membership term</li>
                <li>Transfer membership to another person</li>
                <li>Pause service (except for approved circumstances)</li>
              </ul>
            </div>
          </section>

          {/* Auto-Renewal */}
          <section id="renewal" className="terms-section">
            <h2 className="text-3xl font-bold mb-6">7. What Happens After Your Term</h2>
            <div className="section-content">
              <h3>Automatic Continuation:</h3>
              <p>When your membership term ends, you'll automatically continue with SpryFi service at your Circle member rate on a month-to-month basis. No action needed!</p>
              
              <h3>Your Options at Term End:</h3>
              <ul>
                <li>Continue month-to-month at your discounted Circle rate</li>
                <li>Renew for another 12 or 24-month term (may qualify for additional benefits)</li>
                <li>Switch to standard month-to-month pricing</li>
                <li>Cancel service with no penalty</li>
              </ul>
              
              <p>We'll notify you 30 days before your term ends with your options.</p>
            </div>
          </section>

          {/* Additional Terms */}
          <section className="terms-section">
            <h2 className="text-3xl font-bold mb-6">8. Additional Important Terms</h2>
            <div className="section-content">
              <h3>Billing & Payment:</h3>
              <ul>
                <li>First month's payment due at signup</li>
                <li>Monthly billing cycle based on activation date</li>
                <li>Late payments may result in service suspension</li>
                <li>Returned payments incur a $25 fee</li>
              </ul>
              
              <h3>Fair Use:</h3>
              <ul>
                <li>Service is for residential use only</li>
                <li>Cannot be resold or shared outside your household</li>
                <li>Subject to SpryFi's standard Terms of Service</li>
              </ul>
              
              <h3>Program Changes:</h3>
              <p>SpryFi reserves the right to modify the Loyalty Circle program for new members. Existing members' terms remain unchanged for their commitment period.</p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="terms-section contact-section">
            <h2 className="text-3xl font-bold mb-6">Questions About These Terms?</h2>
            <div className="section-content">
              <p>We're here to help clarify anything about the Loyalty Circle membership.</p>
              <div className="contact-options">
                <div className="contact-method">
                  <h4>Chat with Us</h4>
                  <p>Available 24/7 on our website</p>
                  <Button variant="outline">Start Chat</Button>
                </div>
                <div className="contact-method">
                  <h4>Call Us</h4>
                  <p>1-800-SPRYFI-1</p>
                  <p>Mon-Fri 8am-8pm CT</p>
                </div>
                <div className="contact-method">
                  <h4>Email</h4>
                  <p>loyalty@spryfi.net</p>
                  <p>Response within 24 hours</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer CTA */}
      <section className="terms-footer-cta">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Ready to Save with the Loyalty Circle?</h2>
          <div className="cta-buttons">
            <Link to="/loyalty-savings">
              <Button variant="outline">← Back to Loyalty Circle</Button>
            </Link>
            <Link to="/checkout?circle=silver">
              <Button>Join Silver Circle</Button>
            </Link>
            <Link to="/checkout?circle=gold">
              <Button className="btn-gold">Join Gold Circle</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};