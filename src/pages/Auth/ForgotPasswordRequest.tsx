import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordResetRequest } from '../../api/api.js';
import toast from 'react-hot-toast';
import Logo from '../../components/Common/Logo';
import { ArrowLeft } from 'lucide-react';

const ForgotPasswordRequest: React.FC = () => {
  
  const [email,setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('No Email to has been set!');
      return;
    }

    setLoading(true);

    try {
      await passwordResetRequest({email: email});
      toast.success(`We have sent the password reset link to ${email}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Password reset request failed! Please try again.');
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
          <h1 className="font-bold text-gray-900 text-3xl">Password Reset</h1>
          <p className="mt-2 text-gray-600">Please enter your email below and click the submit button to get <strong>password reset link</strong> via email.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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

export default ForgotPasswordRequest;