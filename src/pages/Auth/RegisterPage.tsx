import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../../components/Common/Logo';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data } = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'guest',
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      toast.success('Registration successful!');
      navigate('/email-verification-prompt',{
        state:{
          email: formData.email,
        }
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-[#008ea2] to-[#006b7a] p-4 min-h-screen">
      <div className="relative bg-white shadow-2xl p-8 rounded-2xl w-full max-w-xl">
        <Link 
          to="/"
          className="top-6 left-6 absolute bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        <div className="mb-8 text-center">
          <Logo/>
          <h1 className="font-bold text-gray-900 text-3xl">Create Account</h1>
          <p className="mt-2 text-gray-600">Join us for the best hotel experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 font-medium text-gray-700 text-sm">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="flex sm:flex-row flex-col justify-between items-start gap-6">
            <div className="w-full">
                <label htmlFor="email" className="block mb-2 font-medium text-gray-700 text-sm">
                Email Address
                </label>
                <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                placeholder="Enter your email"
                required
                />
            </div>

            <div className="w-full">
                <label htmlFor="phone" className="block mb-2 font-medium text-gray-700 text-sm">
                Phone Number
                </label>
                <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                placeholder="Enter your phone number"
                required
                />
            </div>
          </div>

          <div className="flex sm:flex-row flex-col justify-between items-start gap-6">
            <div className="w-full">
                <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
                Password
                </label>
                <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="px-4 py-3 pr-12 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                    placeholder="Create a password"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="top-1/2 right-3 absolute text-gray-500 hover:text-gray-700 -translate-y-1/2 transform"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
            </div>

            <div className="w-full">
                <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700 text-sm">
                Confirm Password
                </label>
                <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                placeholder="Confirm your password"
                required
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#008ea2] hover:bg-[#006b7a] disabled:opacity-50 py-3 rounded-lg w-full font-medium text-white transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#008ea2] hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;