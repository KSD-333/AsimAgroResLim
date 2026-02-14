import React from 'react';
import { Leaf, Shield, Droplets, Award, Truck, HeartHandshake } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-4 text-primary-600 bg-primary-50 p-3 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-primary-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: <Leaf className="h-8 w-8" />,
      title: 'Eco-Friendly Formulations',
      description: 'Our products are designed to enhance crop yield while minimizing environmental impact through sustainable practices.'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Quality Assurance',
      description: 'Every product undergoes rigorous testing to ensure consistent quality and effectiveness in various soil conditions.'
    },
    {
      icon: <Droplets className="h-8 w-8" />,
      title: 'Balanced Nutrition',
      description: 'Our scientifically formulated products provide the perfect balance of macro and micronutrients for optimal plant growth.'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Certified Products',
      description: 'Our fertilizers meet and exceed industry standards with certifications that guarantee their quality and safety.'
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Reliable Supply Chain',
      description: 'Our efficient distribution network ensures timely delivery of products to dealers across the country.'
    },
    {
      icon: <HeartHandshake className="h-8 w-8" />,
      title: 'Dealer Support',
      description: 'We provide comprehensive support including technical assistance, marketing materials, and training for all our dealers.'
    },
  ];

  return (
    <section className="section bg-gray-100">
      <div className="container-custom">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-primary-900 mb-4">Why Choose Asim Agro Research</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            With over two decades of experience in developing premium fertilizers, we are committed to enhancing agricultural productivity while promoting sustainable farming practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
          {features.map((feature, index) => (
            <Feature 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;