import React from 'react';
import HeroSection from '../components/HeroSection';
import WhyUsSection from '../components/WhyUsSection';
import BrandsMarquee from '../components/BrandsMarquee';
import CertifiedBanner from '../components/CertifiedBanner';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <WhyUsSection />
      <CertifiedBanner />
      <BrandsMarquee />
    </>
  );
};

export default HomePage;
