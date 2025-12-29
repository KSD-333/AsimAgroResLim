import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { dealerLocations } from '../data/dealerLocations';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = {
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        subject: formState.subject,
        message: formState.message,
        type: 'message',
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: user?.uid || null,
        userName: user?.displayName || formState.name,
        userEmail: user?.email || formState.email
      };

      console.log('Submitting contact form:', formData);
      await addDoc(collection(db, 'contactForms'), formData);
      
      // Show success message
      setFormSubmitted(true);
      // Reset form
      setFormState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      // Hide success message after 5 seconds
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Error details:', error.code, error.message);
      setError(`Failed to submit form: ${error.message || 'Please try again later.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="bg-primary-900 py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-white mb-6">Contact Us</h1>
            <p className="text-primary-100 text-lg">
              Have questions about our products or interested in becoming a dealer? We're here to help.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information and Form */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="animate-fade-in">
              <h2 className="text-primary-900 mb-6">Get In Touch</h2>
              <p className="text-gray-700 mb-8">
                Whether you have questions about our products, dealer opportunities, or technical support, our team is ready to assist you.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full text-primary-600 flex-shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Head Office</h3>
                    <p className="text-gray-700">
                      ASIM AGRO Industries<br />
                      Plot 123, MIDC Industrial Area<br />
                      Kadegoan, Maharashtra 415304<br />
                      India
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full text-primary-600 flex-shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-700">
                      General Inquiries: +91 1234567890<br />
                      Dealer Support: +91 9876543210<br />
                      Technical Support: +91 8765432109
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full text-primary-600 flex-shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-700">
                      General: info@asimagro.com<br />
                      Sales: sales@asimagro.com<br />
                      Support: support@asimagro.com
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full text-primary-600 flex-shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-700">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 1:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="bg-blue-600 text-white hover:bg-blue-700 transition duration-300 h-10 w-10 rounded-full flex items-center justify-center"
                    aria-label="Facebook"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                  <a
                    href="#"
                    className="bg-pink-600 text-white hover:bg-pink-700 transition duration-300 h-10 w-10 rounded-full flex items-center justify-center"
                    aria-label="Instagram"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a
                    href="#"
                    className="bg-blue-400 text-white hover:bg-blue-500 transition duration-300 h-10 w-10 rounded-full flex items-center justify-center"
                    aria-label="Twitter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                  </a>
                  <a
                    href="#"
                    className="bg-blue-800 text-white hover:bg-blue-900 transition duration-300 h-10 w-10 rounded-full flex items-center justify-center"
                    aria-label="LinkedIn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="animate-slide-up">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-primary-900 mb-6">Send Us a Message</h2>
                
                {formSubmitted && (
                  <div className="mb-6 bg-success-100 text-success-800 p-4 rounded-md flex items-center animate-fade-in">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>Thank you! Your message has been sent successfully. We'll get back to you soon.</p>
                  </div>
                )}
                
                {error && (
                  <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-md flex items-center animate-fade-in">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name*
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
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
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject*
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        required
                        className="input"
                      >
                        <option value="">Select a subject</option>
                        <option value="Product Inquiry">Product Inquiry</option>
                        <option value="Dealer Application">Dealer Application</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Order Status">Order Status</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Message*
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formState.message}
                      onChange={handleChange}
                      required
                      className="input"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dealer Locations */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-primary-900 mb-4">Our Dealer Network</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Find ASIM AGRO products at our authorized dealer locations across the region.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {dealerLocations.map(dealer => (
              <div key={dealer.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition duration-300">
                <h3 className="text-xl font-semibold text-primary-900 mb-2">{dealer.name}</h3>
                <p className="text-gray-600 mb-4">
                  {dealer.address}, {dealer.city}, {dealer.state}
                </p>
                <div className="flex items-center text-gray-700 mb-2">
                  <Phone className="h-4 w-4 mr-2 text-primary-600" />
                  <span>{dealer.phone}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail className="h-4 w-4 mr-2 text-primary-600" />
                  <span>{dealer.email}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Can't find a dealer near you? <a href="#" className="text-primary-600 hover:text-primary-700">Contact us</a> for assistance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;