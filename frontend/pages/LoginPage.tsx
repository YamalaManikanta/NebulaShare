import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { login as loginService } from '../services/authService';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import type { User } from '../types';

// FIX: Removed React.FC to fix framer-motion prop type errors.
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    setLoading(true);

    // --- Hardcoded demo credentials for tomorrow's demo ---
    const demoEmail = "admin@example.com";
    const demoPassword = "admin";

    if (email === demoEmail && password === demoPassword) {
      const demoUser: User = {
        id: "1",
        username: "admin",
        email: demoEmail,
        role: "ADMIN",
      };
      login("demo-token", demoUser);
      addNotification("Demo login successful!", "success");
      navigate("/dashboard");
      setLoading(false);
      return;
    }
    // ------------------------------------------------------

    try {
      const response = await loginService({ email, password });
      login(response.data.token, response.data.user);
      addNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';
      addNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <motion.div
        className="w-full max-w-md p-8 space-y-8 bg-surface dark:bg-dark-surface rounded-2xl shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2
          className="text-3xl font-bold text-center text-text-primary dark:text-dark-text-primary"
          variants={itemVariants}
        >
          Welcome Back
        </motion.h2>
        <motion.form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" />
              <input
                id="email"
                type="email"
                required
                className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" />
              <input
                id="password"
                type="password"
                required
                className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary dark:bg-dark-primary hover:bg-primary-hover dark:hover:bg-dark-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover dark:focus:ring-dark-primary-hover disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </motion.div>
        </motion.form>
        <motion.p
          className="text-sm text-center text-text-secondary dark:text-dark-text-secondary"
          variants={itemVariants}
        >
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-primary dark:text-dark-primary hover:underline"
          >
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
