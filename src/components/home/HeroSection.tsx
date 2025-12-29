import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Droplets, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HeroSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDealerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/dealers' } });
    } else {
      navigate('/dealers');
    }
  };
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/80 z-0">
        <img
          src="https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Healthy crop field"
          className="w-full h-full object-cover mix-blend-overlay"
        />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-white mb-6 leading-tight">
              Nurturing Crops, <br />
              <span className="text-accent-400">Enriching Soil</span>
            </h1>
            <p className="text-primary-50 text-lg md:text-xl mb-8 max-w-2xl">
              ASIM AGRO delivers premium-quality fertilizers, designed to maximize crop yield and enhance soil health for sustainable farming.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/products" className="btn btn-accent font-medium text-base">
                Explore Products
              </Link>
              <a 
                href="/dealers" 
                onClick={handleDealerClick}
                className="btn btn-outline text-white border-white hover:bg-white/10 focus:ring-white font-medium text-base"
              >
                Become a Dealer
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Sprout className="h-8 w-8 text-accent-400 flex-shrink-0" />
                <span className="text-white font-medium">Enhanced Crop Growth</span>
              </div>
              <div className="flex items-center space-x-3">
                <Droplets className="h-8 w-8 text-accent-400 flex-shrink-0" />
                <span className="text-white font-medium">Balanced Nutrition</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-8 w-8 text-accent-400 flex-shrink-0" />
                <span className="text-white font-medium">Quality Assured</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block animate-slide-up">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl">
              <h3 className="text-2xl font-semibold text-primary-900 mb-2">Get Started Today</h3>
              <p className="text-gray-600 mb-6">Fill out the form to request a product catalog and pricing.</p>

              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="input"
                    placeholder="Your phone number"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    className="input"
                    placeholder="Tell us about your requirements"
                  ></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary w-full">
                  Request Catalog
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;