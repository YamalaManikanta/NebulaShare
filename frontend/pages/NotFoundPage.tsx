
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
      <h1 className="text-9xl font-extrabold text-primary dark:text-dark-primary tracking-widest">404</h1>
      <div className="bg-secondary dark:bg-dark-secondary text-white px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>
      <p className="mt-4 text-lg text-text-secondary dark:text-dark-text-secondary">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary dark:bg-dark-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-hover dark:hover:bg-dark-primary-hover focus:outline-none focus:ring"
      >
        <Home size={18} />
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;