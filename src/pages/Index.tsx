
import React, { useState, useEffect } from 'react';
import { Hero } from '@/components/Hero';
import { PainPoints } from '@/components/PainPoints';
import { SocialProof } from '@/components/SocialProof';
import { WhySpryFi } from '@/components/WhySpryFi';
import { Comparison } from '@/components/Comparison';
import { FlashSaleBanner } from '@/components/FlashSaleBanner';
import { PlansSection } from '@/components/PlansSection';
import { FounderVideo } from '@/components/FounderVideo';
import { HowItWorks } from '@/components/HowItWorks';
import { Guarantee } from '@/components/Guarantee';
import { Footer } from '@/components/Footer';

const Index = () => {
  const [saleActive, setSaleActive] = useState(false);

  useEffect(() => {
    // Check if sale is active based on localStorage
    const storedEndDate = localStorage.getItem('spryfi_sale_end');
    if (storedEndDate) {
      const endDate = new Date(storedEndDate);
      setSaleActive(endDate > new Date());
    } else {
      // First visit - activate sale
      setSaleActive(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <PainPoints />
      <SocialProof />
      <WhySpryFi />
      <Comparison />
      <FlashSaleBanner />
      <PlansSection saleActive={saleActive} />
      <FounderVideo />
      <HowItWorks />
      <Guarantee />
      <Footer />
    </div>
  );
};

export default Index;
