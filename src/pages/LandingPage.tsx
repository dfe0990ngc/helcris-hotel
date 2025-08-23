// LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Coffee, 
  BedDouble, 
  UtensilsCrossed, 
  Sun, 
  Star,
  ArrowRight,
  CheckCircle,
  Hotel,
  Image as ImageIcon
} from 'lucide-react';
import Logo2 from '../components/Common/Logo2';

const LandingPage: React.FC = () => {
  const amenities = [
    {
      icon: BedDouble,
      title: 'Luxury Rooms & Suites',
      description: 'Experience modern comfort with elegant interiors, premium bedding, and stunning views.'
    },
    {
      icon: UtensilsCrossed,
      title: 'Fine Dining',
      description: 'Savor international cuisine and local delicacies prepared by our world-class chefs.'
    },
    {
      icon: Sun,
      title: 'Pool & Spa',
      description: 'Unwind in our relaxing pool, spa, and wellness facilities designed for total rejuvenation.'
    },
    {
      icon: Coffee,
      title: '24/7 Guest Service',
      description: 'Our attentive staff is always ready to make your stay seamless and unforgettable.'
    }
  ];

  const galleryImages = [
    {
      src: "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800",
      alt: "Luxury hotel room"
    },
    {
      src: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800",
      alt: "Fine dining restaurant"
    },
    {
      src: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800",
      alt: "Hotel swimming pool"
    },
    {
      src: "https://www.hotelkralj.rs/wp-content/uploads/2016/10/spa-wellness-kamenje.png",
      alt: "Spa and wellness"
    },
    {
      src: "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=800",
      alt: "Hotel lobby"
    },
    {
      src: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800",
      alt: "Breakfast buffet"
    }
  ];

  const testimonials = [
    {
      name: 'Maria L.',
      role: 'Guest',
      content: 'The staff were warm and welcoming, and the rooms exceeded my expectations. Truly felt like home.',
      rating: 5
    },
    {
      name: 'James K.',
      role: 'Guest',
      content: 'Amazing experience! The spa was relaxing and the dining options were superb. Will definitely return.',
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
                Book Now
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
                <h1 className="font-bold text-gray-900 text-5xl lg:text-6xl leading-tight">
                  Welcome to 
                  <span className="bg-clip-text bg-gradient-to-r from-[#008ea2] to-[#006b7a] text-transparent"> HelCris Hotel</span>
                </h1>
                <p className="text-gray-600 text-xl leading-relaxed">
                  Where comfort meets elegance. Enjoy world-class service, modern amenities, and a truly relaxing stay designed around you.
                </p>
              </div>
              
              <div className="flex sm:flex-row flex-col gap-4">
                <Link 
                  to="/register"
                  className="group flex justify-center items-center bg-gradient-to-r from-[#008ea2] to-[#006b7a] hover:shadow-xl px-8 py-4 rounded-xl font-semibold text-white text-lg hover:scale-105 transition-all duration-200 transform"
                >
                  Book Your Stay
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
                  Exceptional Service
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 w-5 h-5 text-green-500" />
                  Luxurious Comfort
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 w-5 h-5 text-green-500" />
                  Memorable Stays
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="HelCris Hotel Lobby" 
                className="relative shadow-2xl rounded-3xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="bg-white py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-gray-900 text-4xl">
              World-Class Amenities Await You
            </h2>
            <p className="mx-auto max-w-3xl text-gray-600 text-xl">
              From luxurious rooms to relaxing leisure facilities, everything you need for a perfect stay is here.
            </p>
          </div>

          <div className="gap-8 grid md:grid-cols-2 lg:grid-cols-4">
            {amenities.map((amenity, index) => (
              <div 
                key={index}
                className="group bg-white shadow-lg hover:shadow-xl p-8 border border-gray-100 hover:border-[#008ea2]/20 rounded-2xl transition-all duration-300"
              >
                <div className="flex justify-center items-center bg-gradient-to-br from-[#008ea2]/10 to-[#006b7a]/10 mb-6 rounded-2xl w-16 h-16 group-hover:scale-110 transition-transform duration-300">
                  <amenity.icon className="w-8 h-8 text-[#008ea2]" />
                </div>
                <h3 className="mb-4 font-bold text-gray-900 text-xl">{amenity.title}</h3>
                <p className="text-gray-600 leading-relaxed">{amenity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-12 text-center">
            <ImageIcon className="mx-auto mb-4 w-12 h-12 text-[#008ea2]" />
            <h2 className="mb-4 font-bold text-gray-900 text-4xl">
              Explore Our Spaces
            </h2>
            <p className="text-gray-600 text-xl">
              Take a glimpse at the beauty and elegance that awaits you at HelCris Hotel.
            </p>
          </div>

          <div className="gap-6 grid sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image, index) => (
              <div key={index} className="group shadow-lg rounded-2xl overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 transform"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-gray-900 text-4xl">
              Loved by Our Guests
            </h2>
            <p className="text-gray-600 text-xl">
              Hear what our valued guests have to say about their unforgettable stay.
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
            Make Your Stay Unforgettable
          </h2>
          
          <p className="mb-8 text-white/90 text-xl leading-relaxed">
            Whether for business or leisure, <span className="font-semibold">HelCris Hotel</span> is your sanctuary of comfort, elegance, and world-class hospitality.
          </p>
          
          <Link 
            to="/register"
            className="group flex justify-center items-center bg-white hover:shadow-xl mx-auto px-8 py-4 rounded-xl font-semibold text-[#008ea2] text-lg hover:scale-105 transition-all duration-200 transform"
          >
            Book Now
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex md:flex-row flex-col justify-between items-center">
            <div className="mb-8 md:mb-0">
              <Logo2 className="mb-4" />
              <p className="max-w-md text-gray-400">
                HelCris Hotel – Where every stay feels like home, blending modern comfort with timeless hospitality.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="mb-2 text-gray-400">© 2025 HelCris Hotel</p>
              <p className="text-gray-500 text-sm">All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
