import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { signup, verifyOtp } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, KeyRound, CheckCircle } from 'lucide-react';

// FIX: Removed React.FC to fix framer-motion prop type errors.
const SignupPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 for signup, 2 for OTP, 3 for success
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(formData);
      addNotification('Registration successful! Please check your email for the OTP.', 'success');
      setStep(2);
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp({ email: formData.email, otp });
      addNotification('Email verified successfully! You can now log in.', 'success');
      setStep(3);
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'OTP verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface dark:bg-dark-surface rounded-2xl shadow-xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" {...motionProps}>
              <h2 className="text-3xl font-bold text-center text-text-primary dark:text-dark-text-primary">Create an Account</h2>
              <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                <div className="space-y-4">
                  <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" /><input name="username" type="text" required className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" placeholder="Username" value={formData.username} onChange={handleChange} /></div>
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" /><input name="email" type="email" required className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" placeholder="Email address" value={formData.email} onChange={handleChange} /></div>
                  <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" /><input name="password" type="password" required className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" placeholder="Password" value={formData.password} onChange={handleChange} /></div>
                </div>
                <motion.button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary dark:bg-dark-primary hover:bg-primary-hover dark:hover:bg-dark-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{loading ? 'Creating Account...' : 'Sign up'}</motion.button>
              </form>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" {...motionProps}>
              <h2 className="text-3xl font-bold text-center text-text-primary dark:text-dark-text-primary">Verify Your Email</h2>
              <p className="text-center text-text-secondary dark:text-dark-text-secondary">An OTP has been sent to {formData.email}</p>
              <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                <div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" /><input name="otp" type="text" required className="w-full pl-10 pr-3 py-2 text-center text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} /></div>
                <motion.button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary dark:bg-dark-primary hover:bg-primary-hover dark:hover:bg-dark-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{loading ? 'Verifying...' : 'Verify OTP'}</motion.button>
              </form>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" {...motionProps} className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-success dark:text-dark-success" />
              <h2 className="mt-4 text-3xl font-bold text-center text-success dark:text-dark-success">Verification Complete!</h2>
              <p className="mt-4 text-text-secondary dark:text-dark-text-secondary">You can now log in to your account.</p>
              <Link to="/" className="inline-block mt-6 px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary dark:bg-dark-primary hover:bg-primary-hover dark:hover:bg-dark-primary-hover">Go to Login</Link>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
          Already have an account?{' '}
          <Link to="/" className="font-medium text-primary dark:text-dark-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;