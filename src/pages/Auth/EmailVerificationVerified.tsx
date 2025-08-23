import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Common/Logo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EmailVerificationVerified: React.FC = () => {
  
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
       navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-[#008ea2] to-[#006b7a] p-4 min-h-screen">
      <div className="relative bg-white shadow-2xl p-8 rounded-2xl w-full max-w-xl">
        <Link 
          to="/login"
          className="top-6 left-6 absolute bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        <div className="mb-8 text-center">
          <Logo/>
          <h1 className="font-bold text-gray-900 text-3xl">Email Verification Success!</h1>
          <p className="mt-2 text-gray-600">You have successfully verified your email address. Please click the button below to begin using your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#008ea2] hover:bg-[#006b7a] disabled:opacity-50 py-3 rounded-lg w-full font-medium text-white transition-colors"
          >
            {loading ? 'Redirecting...' : 'Go to Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationVerified;