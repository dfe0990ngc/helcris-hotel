import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../../components/Common/Logo';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);

      toast.removeAll('toast-login-alert');
      toast.success('Login successful!',{
        duration: 3000,
      });
      
      // Navigate based on role (will be handled by App.tsx route protection)
      navigate('/');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Invalid Credentials!');
      if(error?.response?.data?.code === 'EMAIL_NOT_VERIFIED'){
        navigate('/email-not-verified-prompt',{
          state:{
            email: email,
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-[#008ea2] to-[#006b7a] p-4 min-h-screen">
      
      <div className="relative bg-white shadow-2xl p-8 rounded-2xl w-full max-w-md">
        <Link 
          to="/"
          className="top-6 left-6 absolute bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        
        <div className="mb-8 text-center">
          <Logo/>
          <h1 className="font-bold text-gray-900 text-3xl">PCDS - HelCris Hotel</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 font-medium text-gray-700 text-sm">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-3 pr-12 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="bg-[#008ea2] hover:bg-[#006b7a] disabled:opacity-50 py-3 rounded-lg w-full font-medium text-white transition-colors"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            <Link to="/forgot-password-request" className="font-medium text-[#008ea2] hover:underline">
              Forgot Password?
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#008ea2] hover:underline">
              Sign up here
            </Link>
          </p>
        </div>

        <div className="hidden bg-gray-50 mt-8 p-4 rounded-lg">
          <p className="mb-2 font-medium text-gray-700 text-sm">Demo Credentials:</p>
          <div className="space-y-1 text-gray-600 text-sm">
            <p><strong>Admin:</strong> admin@hotel.com / admin123</p>
            <p><strong>Guest:</strong> john@example.com / guest123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;