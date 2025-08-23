import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { forgotPassword } from '../../api/api.js';
import toast from 'react-hot-toast';
import Logo from '../../components/Common/Logo';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ResetPassword: React.FC = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  
  const [formData,setFormData] = useState({
    id: searchParams.get('user'),
    key: searchParams.get('key'),
    password: '',
    password_confirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    if (formData.password === '') {
      toast.error('Password cannot be empty!');
      return;
    }
    
    if (formData.password !== formData.password_confirmation) {
      toast.error('Password and Password Confirmation must be the same!');
      return;
    }

    setLoading(true);

    try {
      const { data } = await forgotPassword({...formData});
      toast.success(data?.message || 'Your password has been reset successfully!');

      navigate('/login');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Password reset failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-[#008ea2] to-[#006b7a] p-4 min-h-screen">
      <div className="relative bg-white shadow-2xl p-8 rounded-2xl w-full max-w-md">
        <Link 
          to="/login"
          className="top-6 left-6 absolute bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        <div className="mb-4 text-center">
          <Logo/>
          <h1 className="font-bold text-gray-900 text-3xl">Reset your Password</h1>
          <p className="mt-2 text-gray-600">Please enter your new desired password below:</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
              <label htmlFor="password_confirmation" className="block mb-2 font-medium text-gray-700 text-sm">
              Confirm Password
              </label>
              <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
              placeholder="Confirm your password"
              required
              />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#008ea2] hover:bg-[#006b7a] disabled:opacity-50 py-3 rounded-lg w-full font-medium text-white transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            <Link to="/login" className="font-medium text-[#008ea2] hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;