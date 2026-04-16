import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { TrustStrip } from '@/components/TrustStrip';
import { PainPoints } from '@/components/PainPoints';
import { PlansSection } from '@/components/PlansSection';
import { WhyDifferent } from '@/components/WhyDifferent';
import { SocialProof } from '@/components/SocialProof';
import { HowItWorks } from '@/components/HowItWorks';
import { Guarantee } from '@/components/Guarantee';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <TrustStrip />
      <PainPoints />
      <PlansSection />
      <WhyDifferent />
      <SocialProof />
      <HowItWorks />
      <Guarantee />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
