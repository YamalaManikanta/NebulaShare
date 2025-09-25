import React from 'react';
import ReactDOM from 'react-dom';
import { NotificationPayload } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface NotificationProps {
  notifications: NotificationPayload[];
  onRemove: (id: number) => void;
}

const icons = {
  success: <CheckCircle className="h-6 w-6 text-white" />,
  error: <XCircle className="h-6 w-6 text-white" />,
  info: <Info className="h-6 w-6 text-white" />,
};

// FIX: Removed React.FC and typed props directly to fix framer-motion prop type errors.
const Notification = ({ notifications, onRemove }: NotificationProps) => {
  const notificationRoot = document.getElementById('notification-root');
  if (!notificationRoot) return null;

  const colorClasses = {
    success: 'bg-success dark:bg-dark-success',
    error: 'bg-danger dark:bg-dark-danger',
    info: 'bg-blue-500',
  };

  return ReactDOM.createPortal(
    <div className="fixed top-5 right-5 z-50 space-y-3">
        <AnimatePresence>
            {notifications.map((notification) => (
                <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className={`relative flex items-center gap-4 px-6 py-4 rounded-xl shadow-lg text-sm font-medium text-white ${colorClasses[notification.type]}`}
                >
                    {icons[notification.type]}
                    <span>{notification.message}</span>
                    <button onClick={() => onRemove(notification.id)} className="absolute top-1 right-1 p-1 rounded-full hover:bg-black/20">&times;</button>
                </motion.div>
            ))}
      </AnimatePresence>
    </div>,
    notificationRoot
  );
};

export default Notification;