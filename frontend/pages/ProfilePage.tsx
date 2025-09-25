import React from 'react';
import UpdateProfileForm from '../components/profile/UpdateProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// FIX: Removed React.FC to fix framer-motion prop type errors.
const UserAvatar = ({ username }: { username: string }) => {
  const initials = username.charAt(0).toUpperCase();
  return (
    <div className="w-24 h-24 rounded-full bg-primary dark:bg-dark-primary flex items-center justify-center text-white text-4xl font-bold mb-4">
      {initials}
    </div>
  );
};

// FIX: Removed React.FC to fix framer-motion prop type errors.
const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="flex flex-col items-center md:items-start mb-8">
          {user && <UserAvatar username={user.username} />}
          <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">Profile Management</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div 
            className="bg-surface dark:bg-dark-surface p-8 rounded-2xl shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-text-primary dark:text-dark-text-primary">Update Profile Information</h2>
          <UpdateProfileForm />
        </motion.div>
        <motion.div 
            className="bg-surface dark:bg-dark-surface p-8 rounded-2xl shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-text-primary dark:text-dark-text-primary">Change Password</h2>
          <ChangePasswordForm />
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;