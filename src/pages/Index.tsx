import React from 'react';
import { Hero } from '@/components/Hero';
import { PainPoints } from '@/components/PainPoints';
import { SocialProof } from '@/components/SocialProof';
import { WhySpryFi } from '@/components/WhySpryFi';
import { Comparison } from '@/components/Comparison';
import { PlansSection } from '@/components/PlansSection';
import { DragonModem } from '@/components/DragonModem';
import { WhyDifferent } from '@/components/WhyDifferent';
import { HowItWorks } from '@/components/HowItWorks';
import { Guarantee } from '@/components/Guarantee';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <PainPoints />
      <SocialProof />
      <WhySpryFi />
      <Comparison />
      <PlansSection />
      <DragonModem />
      <WhyDifferent />
      <HowItWorks />
      <Guarantee />
      <Footer />
    </div>
  );
};

export default Index;
