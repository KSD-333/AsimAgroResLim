import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { routeMap } from '../../routeMap';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-900 text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-8 w-8 text-white" />
              <span className="font-display font-bold text-2xl">ASIM AGRO</span>
            </div>
            <p className="text-primary-100 mb-6">
              Premium fertilizers for enhanced crop yield. Supporting farmers across India with quality agricultural inputs since 2005.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-primary-800 text-white hover:bg-primary-700 transition duration-300 h-10 w-10 rounded-full flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-primary-800 text-white hover:bg-primary-700 transition duration-300 h-10 w-10 rounded-full flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-primary-800 text-white hover:bg-primary-700 transition duration-300 h-10 w-10 rounded-full flex items-center justify-center"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/${routeMap.home}`}
                  className="text-primary-100 hover:text-white transition duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to={`/${routeMap.products}`}
                  className="text-primary-100 hover:text-white transition duration-200"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to={`/${routeMap.about}`}
                  className="text-primary-100 hover:text-white transition duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to={`/${routeMap.contact}`}
                  className="text-primary-100 hover:text-white transition duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to={`/${routeMap.dealers}`}
                  className="text-primary-100 hover:text-white transition duration-200"
                >
                  Become a Dealer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-300 mt-1 flex-shrink-0" />
                <span className="text-primary-100">
                  ASIM AGRO Industries, Kadegoan Industrial Area, Maharashtra, India 415304
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-300 flex-shrink-0" />
                <span className="text-primary-100">+91 7219452502</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-300 flex-shrink-0" />
                <span className="text-primary-100">info@asimagro.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-200 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} ASIM AGRO. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm text-primary-200">
              <Link to="/privacy-policy" className="hover:text-white transition duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition duration-200">
                Terms of Service
              </Link>
              <Link to="/faq" className="hover:text-white transition duration-200">
                FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;