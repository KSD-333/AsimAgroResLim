import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CallToAction: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/dealers' } });
    } else {
      navigate('/dealers');
    }
  };
  return (
    <section className="section bg-white relative overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h2 className="text-primary-900 mb-6">Become an ASIM AGRO Dealer Today</h2>
            <p className="text-gray-600 mb-8">
              Join our growing network of dealers and gain access to premium quality fertilizers, competitive margins, and comprehensive support services.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-gray-700">
                  <span className="font-medium">Exclusive Territory Rights</span> - Secure your business with protected geographic areas
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-gray-700">
                  <span className="font-medium">Competitive Margins</span> - Enjoy attractive profit margins on all product categories
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-gray-700">
                  <span className="font-medium">Marketing Support</span> - Access customized marketing materials and promotional campaigns
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary-600 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-gray-700">
                  <span className="font-medium">Technical Training</span> - Receive comprehensive product and application knowledge
                </p>
              </div>
            </div>

            <a 
              href="/dealers" 
              onClick={handleApplyClick}
              className="btn btn-primary"
            >
              Apply Now
            </a>
          </div>

          <div className="relative animate-slide-in-right">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.pexels.com/photos/3912472/pexels-photo-3912472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Farmer in field with crop"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 to-transparent">
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-white font-semibold text-xl mb-2">
                    "Since becoming an ASIM AGRO dealer, my business has grown by 40% in just one year."
                  </p>
                  <p className="text-primary-100">
                    - Vijay Patil, Agrochemicals Distributor
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 h-24 w-24 bg-accent-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-primary-500 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;