import React, { useState } from 'react';
import { Check, Shield, Users, TrendingUp, MessageSquare, CheckCircle } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const DealerPage: React.FC = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    yearsInBusiness: '',
    existingBrands: '',
    monthlySales: '',
    businessType: '',
    comments: '',
    agreeTerms: false,
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    // Phone validation - only allow digits and limit to 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: digitsOnly
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'dealerApplications'), {
        ...formData,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('Dealer form submitted successfully');
      setFormSubmitted(true);
      // Reset form
      setFormData({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        yearsInBusiness: '',
        existingBrands: '',
        monthlySales: '',
        businessType: '',
        comments: '',
        agreeTerms: false,
      });
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting dealer form:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="bg-primary-800 py-16 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="6" fill="currentColor" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
          </svg>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-white mb-6">Become an Asim Agro Research Dealer</h1>
            <p className="text-primary-100 text-lg">
              Join our network of successful dealers and grow your business with our premium fertilizer products.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-primary-900 mb-4">Why Partner With Us</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              As an Asim Agro Research dealer, you'll gain access to premium products, exclusive territory rights, and comprehensive support to help your business thrive.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-100">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full inline-flex mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-900">Quality Products</h3>
              <p className="text-gray-700 mb-4">
                Offer your customers premium fertilizers backed by scientific research and consistent quality.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-2 text-gray-700">Wide range of fertilizer products</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-2 text-gray-700">Scientifically formulated blends</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-2 text-gray-700">Consistent performance in the field</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-100">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full inline-flex mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-900">Business Growth</h3>
              <p className="text-gray-700 mb-4">
                Enjoy attractive margins and dedicated support to help your business expand and thrive.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-2 text-gray-700">Competitive dealer margins</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-2 text-gray-700">Exclusive territory rights</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-2 text-gray-700">Special promotions and offers</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-100">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full inline-flex mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-900">Comprehensive Support</h3>
              <p className="text-gray-700 mb-4">
                Receive ongoing training, marketing materials, and technical assistance for you and your customers.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-2 text-gray-700">Product training sessions</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-2 text-gray-700">Marketing and promotional materials</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="ml-2 text-gray-700">Agronomist support for field issues</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Requirements & Process */}
      <section className="section bg-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Requirements */}
            <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in">
              <h2 className="text-2xl font-semibold text-primary-900 mb-6">Dealer Requirements</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full text-primary-600 flex-shrink-0 mt-0.5">
                    <span className="font-medium text-sm">01</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Established Business</h3>
                    <p className="text-gray-700">
                      You should have an existing agricultural inputs business or retail store.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full text-primary-600 flex-shrink-0 mt-0.5">
                    <span className="font-medium text-sm">02</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Storage Facilities</h3>
                    <p className="text-gray-700">
                      Adequate storage space for maintaining product inventory in suitable conditions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full text-primary-600 flex-shrink-0 mt-0.5">
                    <span className="font-medium text-sm">03</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Market Reach</h3>
                    <p className="text-gray-700">
                      Strong connections with local farmers and a good understanding of regional agricultural practices.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full text-primary-600 flex-shrink-0 mt-0.5">
                    <span className="font-medium text-sm">04</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Business Documentation</h3>
                    <p className="text-gray-700">
                      Valid business registration, GST registration, and relevant trade licenses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Process */}
            <div className="bg-white p-8 rounded-lg shadow-sm animate-slide-up">
              <h2 className="text-2xl font-semibold text-primary-900 mb-6">Application Process</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-accent-100 p-2 rounded-full text-accent-600 flex-shrink-0 mt-0.5">
                    <span className="font-medium text-sm">01</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Submit Application</h3>
                    <p className="text-gray-700">
                      Complete and submit the dealer application form with all required information.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-accent-100 p-2 rounded-full text-accent-600 flex-shrink-0 mt-0.5">
                    <span className="font-medium text-sm">02</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Initial Review</h3>
                    <p className="text-gray-700">
                      Our team will review your application and reach out for additional information if needed.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-accent-100 p-2 rounded-full text-accent-600 flex-shrink-0 mt-0.5">
                    <span className="font-medium text-sm">03</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Site Visit</h3>
                    <p className="text-gray-700">
                      A representative will visit your location to assess facilities and discuss partnership details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-accent-100 p-2 rounded-full text-accent-600 flex-shrink-0 mt-0.5">
                    <span className="font-medium text-sm">04</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Agreement & Onboarding</h3>
                    <p className="text-gray-700">
                      Upon approval, we'll finalize the dealership agreement and begin your onboarding process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Application Form */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-primary-900 mb-4">Apply to Become a Dealer</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Complete the form below to start your application process. Our team will review your information and contact you soon.
              </p>
            </div>
            
            {formSubmitted && (
              <div className="mb-10 bg-success-100 text-success-800 p-6 rounded-lg flex items-start animate-fade-in">
                <CheckCircle className="h-6 w-6 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg mb-2">Application Submitted Successfully!</h3>
                  <p>
                    Thank you for your interest in becoming an Asim Agro Research dealer. Our team will review your application and contact you within 2-3 business days to discuss the next steps.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-lg shadow-sm animate-slide-up">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-primary-900 mb-4 pb-2 border-b border-gray-200">Business Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name*
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Owner/Manager Name*
                    </label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      required
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      title="Please enter a valid email address"
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{10}"
                      title="Please enter exactly 10 digits"
                      placeholder="10-digit phone number"
                      className="input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-primary-900 mb-4 pb-2 border-b border-gray-200">Business Address</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address*
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City*
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State*
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      PIN Code*
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-primary-900 mb-4 pb-2 border-b border-gray-200">Business Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type*
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="">Select business type</option>
                      <option value="Retail Store">Retail Store</option>
                      <option value="Wholesale Distributor">Wholesale Distributor</option>
                      <option value="Agri Input Center">Agri Input Center</option>
                      <option value="Farmer Producer Company">Farmer Producer Company</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                      Years in Business*
                    </label>
                    <select
                      id="yearsInBusiness"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="">Select years</option>
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="More than 10 years">More than 10 years</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="existingBrands" className="block text-sm font-medium text-gray-700 mb-1">
                      Existing Fertilizer Brands (if any)
                    </label>
                    <input
                      type="text"
                      id="existingBrands"
                      name="existingBrands"
                      value={formData.existingBrands}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="monthlySales" className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Monthly Sales (₹)*
                    </label>
                    <select
                      id="monthlySales"
                      name="monthlySales"
                      value={formData.monthlySales}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="">Select range</option>
                      <option value="Less than ₹50,000">Less than ₹50,000</option>
                      <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                      <option value="₹1,00,000 - ₹5,00,000">₹1,00,000 - ₹5,00,000</option>
                      <option value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000</option>
                      <option value="More than ₹10,00,000">More than ₹10,00,000</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Comments
                    </label>
                    <textarea
                      id="comments"
                      name="comments"
                      rows={4}
                      value={formData.comments}
                      onChange={handleChange}
                      className="input"
                      placeholder="Tell us more about your business and why you're interested in becoming an Asim Agro Research dealer"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      required
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeTerms" className="text-gray-700">
                      I agree to the Asim Agro Research dealership terms and conditions. I confirm that all information provided is accurate and complete.
                    </label>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DealerPage;