import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import FeatureSection from '../components/home/FeatureSection';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <FeatureSection />
    </>
  );
};

export default HomePage;