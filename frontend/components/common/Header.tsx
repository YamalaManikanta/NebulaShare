
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LayoutDashboard, UserCircle, KeyRound, LogOut, LogIn, UserPlus } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const handleLogout = () => {
    logout();
    addNotification('You have been logged out.', 'info');
    navigate('/');
  };

  const linkClass = "flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary transition-colors duration-200";
  const activeLinkClass = "text-primary dark:text-dark-primary font-semibold";

  return (
    <header className="bg-surface dark:bg-dark-surface shadow-md sticky top-0 z-30">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-2xl font-bold text-primary dark:text-dark-primary">
              <span className="text-3xl" role="img" aria-label="cloud with lightning emoji">🌩️</span>
              NebulaShare
            </NavLink>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <NavLink to="/dashboard" className={({isActive}) => isActive ? activeLinkClass : linkClass}><LayoutDashboard size={18} /><span>Dashboard</span></NavLink>
                {user.role === 'ADMIN' && (
                  <NavLink to="/admin" className={({isActive}) => isActive ? activeLinkClass : linkClass}><KeyRound size={18} /><span>Admin</span></NavLink>
                )}
                <NavLink to="/profile" className={({isActive}) => isActive ? activeLinkClass : linkClass}><UserCircle size={18} /><span>Profile</span></NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-danger dark:bg-dark-danger text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/" className={({isActive}) => isActive ? activeLinkClass : linkClass}><LogIn size={18}/> Login</NavLink>
                <NavLink to="/signup" className="flex items-center gap-2 bg-primary dark:bg-dark-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover dark:hover:bg-dark-primary-hover transition-colors"><UserPlus size={18}/>Sign Up</NavLink>
              </>
            )}
             <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;