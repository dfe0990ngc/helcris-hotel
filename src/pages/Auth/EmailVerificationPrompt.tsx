import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resendVerification } from '../../api/api.js';
import toast from 'react-hot-toast';
import Logo from '../../components/Common/Logo';
import { ArrowLeft } from 'lucide-react';

const EmailVerificationPrompt: React.FC = () => {
  
  const location = useLocation();
  const email = location.state?.email || '';

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if(!email){
      navigate('/');
    }
  },[email,navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('No Email to has been set!');
      return;
    }

    setLoading(true);

    try {
      await resendVerification({email: email});
      toast.success(`We have resent the email verification to ${email}`);
    } catch (error) {
      console.log(error);
      toast.error('Registration failed. Please try again.');
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

        <div className="mb-4 text-center">
          <Logo/>
          <h1 className="font-bold text-gray-900 text-3xl">Verify Your Email</h1>
          <p className="mt-2 text-gray-600">Please verify your email with the link sent to your email. Sometimes, you need to check your <strong>SPAM</strong> message folder.</p>
          <p className="mt-2 text-orange-600 text-sm">
            <em>If you didn't received an email, please click the button below:</em>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" id="email" name="email" value={email}/>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#008ea2] hover:bg-[#006b7a] disabled:opacity-50 py-3 rounded-lg w-full font-medium text-white transition-colors"
          >
            {loading ? 'Resending email verification...' : 'Resend Email Verification'}
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

export default EmailVerificationPrompt;