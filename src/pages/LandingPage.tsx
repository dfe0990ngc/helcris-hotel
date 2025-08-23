import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Shield, 
  BarChart3, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  Hotel
} from 'lucide-react';
// import Logo from '../components/Common/Logo';
import Logo2 from '../components/Common/Logo2';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Booking Management',
      description: 'Streamline reservations with intelligent scheduling and automated confirmations.'
    },
    {
      icon: Users,
      title: 'Guest Experience',
      description: 'Deliver exceptional service with personalized guest profiles and preferences.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Make data-driven decisions with comprehensive reporting and analytics.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee for peace of mind.'
    }
  ];

  const testimonials = [
    {
      name: 'Anonymous User',
      role: 'Guest',
      hotel: 'Unknown',
      content: 'Booking reservation is seamless and I am very satisfied about it.',
      rating: 5
    },
    {
      name: 'Anonymous User',
      role: 'Guest',
      hotel: 'Unknown',
      content: 'Very straight forward. All features are easy to learn and navigate.',
      rating: 5
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="top-0 z-50 fixed bg-white/80 backdrop-blur-md border-gray-100 border-b w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <div>
                <Logo2 />
            </div>
            <div className="flex justify-end items-center space-x-4">
              <Link 
                to="/login" 
                className="font-medium text-gray-700 hover:text-[#008ea2] transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-[#008ea2] to-[#006b7a] hover:shadow-lg px-6 py-2 rounded-full text-white hover:scale-105 transition-all duration-200 transform"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#008ea2]/5 to-[#006b7a]/10 pt-24 pb-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="items-center gap-12 grid lg:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center bg-[#008ea2]/10 px-4 py-2 rounded-full font-medium text-[#008ea2] text-sm">
                    <Star className="mr-2 w-4 h-4" />
                    Trusted by 500+ Happy Guests
                </div>

                <h1 className="font-bold text-gray-900 text-5xl lg:text-6xl leading-tight">
                    Book your stay at
                    <span className="bg-clip-text bg-gradient-to-r from-[#008ea2] to-[#006b7a] text-transparent"> HelCris Hotel </span>
                    today!
                </h1>

                <p className="text-gray-600 text-xl leading-relaxed">
                    Experience comfort and convenience like never before. From seamless bookings to exceptional service, HelCris Hotel is your perfect choice for modern hospitality.
                </p>
              </div>
              
              <div className="flex sm:flex-row flex-col gap-4">
                <Link 
                  to="/register"
                  className="group flex justify-center items-center bg-gradient-to-r from-[#008ea2] to-[#006b7a] hover:shadow-xl px-8 py-4 rounded-xl font-semibold text-white text-lg hover:scale-105 transition-all duration-200 transform"
                >
                  Register Now
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  to="/login"
                  className="flex justify-center items-center bg-white hover:bg-[#008ea2] px-8 py-4 border-[#008ea2] border-2 rounded-xl font-semibold text-[#008ea2] hover:text-white text-lg transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-gray-600 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 w-5 h-5 text-green-500" />
                  People's Choice
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 w-5 h-5 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 w-5 h-5 text-green-500" />
                  Cancel anytime
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#008ea2]/20 to-[#006b7a]/20 rounded-3xl rotate-6 transform"></div>
              <img 
                src="https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Modern hotel lobby" 
                className="relative shadow-2xl rounded-3xl w-full h-96 object-cover"
              />
              <div className="-bottom-6 -left-6 absolute bg-white shadow-xl p-6 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-2xl">+40%</p>
                    <p className="text-gray-600 text-sm">Revenue Growth</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-gray-900 text-4xl">
              Everything You Need has been Prepared
            </h2>
            <p className="mx-auto max-w-3xl text-gray-600 text-xl">
              Our comprehensive platform includes all the tools and features you need to manage your bookings efficiently.
            </p>
          </div>

          <div className="gap-8 grid md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white shadow-lg hover:shadow-xl p-8 border border-gray-100 hover:border-[#008ea2]/20 rounded-2xl transition-all duration-300"
              >
                <div className="flex justify-center items-center bg-gradient-to-br from-[#008ea2]/10 to-[#006b7a]/10 mb-6 rounded-2xl w-16 h-16 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-[#008ea2]" />
                </div>
                <h3 className="mb-4 font-bold text-gray-900 text-xl">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-gray-900 text-4xl">
              Recommended by Guests
            </h2>
            <p className="text-gray-600 text-xl">
              See how HelCris takes care of their customers
            </p>
          </div>

          <div className="gap-8 grid md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white shadow-lg hover:shadow-xl p-8 rounded-2xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="fill-current w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-gray-700 text-lg italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="pt-4 border-t">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="font-medium text-[#008ea2]">{testimonial.role}</p>
                  <p className="text-gray-600 text-sm">{testimonial.hotel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#008ea2] to-[#006b7a] py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <Hotel className="mx-auto mb-6 w-16 h-16 text-white" />
            
            <h2 className="mb-6 font-bold text-white text-4xl">
            Elevate Your Hotel Experience
            </h2>
            
            <p className="mb-8 text-white/90 text-xl leading-relaxed">
            Discover why leading hoteliers choose <span className="font-semibold">HelCris</span> 
            to simplify operations, delight guests, and maximize profits. Start your free trial today and see the difference.
            </p>
            
            <div className="flex sm:flex-row flex-col justify-center gap-4">
            <Link 
                to="/register"
                className="group flex justify-center items-center bg-white hover:shadow-xl px-8 py-4 rounded-xl font-semibold text-[#008ea2] text-lg hover:scale-105 transition-all duration-200 transform"
            >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
                to="/login"
                className="flex justify-center items-center bg-transparent hover:bg-white px-8 py-4 border-2 border-white rounded-xl font-semibold text-white hover:text-[#008ea2] text-lg transition-all duration-200"
            >
                Sign In
            </Link>
            </div>
        </div>
        </section>


      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex md:flex-row flex-col justify-between items-center">
            <div className="mb-8 md:mb-0">
              <Logo2 className="mb-4" />
              <p className="max-w-md text-gray-400">
                Empowering hotels worldwide with cutting-edge management solutions for the modern hospitality industry.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="mb-2 text-gray-400">© 2025 HelCris Hotel Management</p>
              <p className="text-gray-500 text-sm">All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;