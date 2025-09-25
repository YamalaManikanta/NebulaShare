import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { updateProfile } from '../../services/authService';
import { motion } from 'framer-motion';
import { User, Mail, Save } from 'lucide-react';

// FIX: Removed React.FC to fix framer-motion prop type errors.
const UpdateProfileForm = () => {
  const { user, setUser } = useAuth();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await updateProfile(formData);
      setUser(response.data.user);
      addNotification('Profile updated successfully!', 'success');
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Username</label>
        <div className="relative mt-1">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" />
          <input
            type="text" name="username" id="username" value={formData.username} onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Email Address</label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" />
          <input
            type="email" name="email" id="email" value={formData.email} onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
          />
        </div>
      </div>
      <div className="text-right">
        <motion.button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary dark:bg-dark-primary hover:bg-primary-hover dark:hover:bg-dark-primary-hover disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>
    </form>
  );
};

export default UpdateProfileForm;