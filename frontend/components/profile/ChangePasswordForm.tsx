import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { changePassword } from '../../services/authService';
import { motion } from 'framer-motion';
import { Lock, KeyRound } from 'lucide-react';

// FIX: Removed React.FC to fix framer-motion prop type errors.
const ChangePasswordForm = () => {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      addNotification('New passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      addNotification('Password changed successfully!', 'success');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="currentPassword"  className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Current Password</label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" />
          <input type="password" name="currentPassword" id="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
        </div>
      </div>
      <div>
        <label htmlFor="newPassword"  className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">New Password</label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" />
          <input type="password" name="newPassword" id="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
        </div>
      </div>
       <div>
        <label htmlFor="confirmPassword"  className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Confirm New Password</label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary" />
          <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
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
          <KeyRound size={16} />
          {loading ? 'Changing...' : 'Change Password'}
        </motion.button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;