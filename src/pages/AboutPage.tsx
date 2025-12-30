import React from 'react';
import { MapPin, Users, Factory, Award, Truck, Phone } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="bg-primary-900 py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-white mb-6">About ASIM AGRO</h1>
            <p className="text-primary-100 text-lg">
              A leading manufacturer of premium fertilizers committed to enhancing agricultural productivity and sustainability.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-primary-900 mb-6">About Us</h2>
              <p className="text-gray-700 mb-4">
                Agriculture and farmers are often portrayed as being in crisis today. However, the truth is that when farmers receive the right guidance at the right time and use accurate, effective solutions, nothing can stop them from achieving exceptional yields. With the aim of providing timely advice, precise crop solutions, and direct on-field guidance to rural farmers and young individuals entering agriculture, Aseem Agro Research was established.
              </p>
              <p className="text-gray-700 mb-4">
                Asim Agro’s mission is to bring prosperity and satisfaction to both farming and farmers by combining science, technology, and dedicated hard work. Guided by this vision, young entrepreneur Sameer Attar founded the company. With the support of experienced scientists and trained professionals, Asim Agro has developed a wide range of farmer-friendly products. Backed by real field experience and advanced technology, these products have proven highly effective and are in strong demand. Moving forward, the company remains committed to developing innovative solutions that make agriculture more profitable and sustainable
              </p>

            </div>
            <div className="relative animate-slide-up">
              <img
                src="https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Modern agricultural facility"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-primary-500 rounded-full opacity-20"></div>
              <div className="absolute -top-6 -right-6 h-24 w-24 bg-accent-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="bg-primary-800 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-white mb-2">20+</div>
              <div className="text-primary-100">Years in Business</div>
            </div>
            <div className="animate-fade-in delay-100">
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-primary-100">Farmers Served</div>
            </div>
            <div className="animate-fade-in delay-200">
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-primary-100">Dealer Network</div>
            </div>
            <div className="animate-fade-in delay-300">
              <div className="text-4xl font-bold text-white mb-2">10+</div>
              <div className="text-primary-100">Product Varieties</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-primary-900 mb-6">Our Values</h2>
            <p className="text-gray-700">
              At ASIM AGRO, our core values guide everything we do - from product formulation to customer service and environmental responsibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full inline-flex mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-900">Quality Excellence</h3>
              <p className="text-gray-700">
                We maintain the highest standards in our manufacturing processes, ensuring each product delivers consistent performance in the field.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full inline-flex mb-4">
                <Factory className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-900">Innovation</h3>
              <p className="text-gray-700">
                Our team of agronomists continuously research and develop new formulations to address evolving agricultural challenges.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full inline-flex mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-900">Farmer Success</h3>
              <p className="text-gray-700">
                We measure our success by the prosperity of the farmers who use our products, ensuring they receive both quality inputs and technical support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing Process */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 animate-slide-up">
              <img
                src="https://images.pexels.com/photos/2284170/pexels-photo-2284170.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Modern manufacturing facility"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2 animate-fade-in">
              <h2 className="text-primary-900 mb-6">Our Manufacturing Process</h2>
              <p className="text-gray-700 mb-4">
                ASIM AGRO's state-of-the-art manufacturing facility in Kadegoan follows a rigorous production process that emphasizes quality, precision, and environmental responsibility.
              </p>

              <div className="space-y-6 mt-8">
                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full flex-shrink-0 mr-4">
                    <span className="font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-800 mb-1">Raw Material Selection</h3>
                    <p className="text-gray-600">We source the finest raw materials from trusted suppliers, ensuring they meet our stringent quality standards.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full flex-shrink-0 mr-4">
                    <span className="font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-800 mb-1">Precision Formulation</h3>
                    <p className="text-gray-600">Our team utilizes advanced technology to create precise nutrient formulations tailored to different crop requirements.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full flex-shrink-0 mr-4">
                    <span className="font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-800 mb-1">Quality Testing</h3>
                    <p className="text-gray-600">Every batch undergoes rigorous quality testing in our in-house laboratory to ensure it meets both regulatory standards and our own quality benchmarks.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full flex-shrink-0 mr-4">
                    <span className="font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-800 mb-1">Packaging & Distribution</h3>
                    <p className="text-gray-600">Our products are packaged in moisture-resistant materials and distributed through our extensive dealer network to ensure freshness.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-primary-900 mb-6">Visit Our Facility</h2>
              <p className="text-gray-700 mb-6">
                We welcome dealer visits to our manufacturing facility in Kadegoan, where you can witness our production processes and quality control measures firsthand.
              </p>

              <div className="flex items-start mb-4">
                <MapPin className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Factory Address</h3>
                  <p className="text-gray-700">
                    ASIM AGRO Industries<br />
                    Plot 123, MIDC Industrial Area<br />
                    Kadegoan, Maharashtra 415304<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Contact</h3>
                  <p className="text-gray-700">
                    Phone: +91 1234567890<br />
                    Email: factory@asimagro.com
                  </p>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <img
                src="https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Factory location"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary-500 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;