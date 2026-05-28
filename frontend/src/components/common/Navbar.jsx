import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon, FiLogOut, FiMenu, FiUser, FiMapPin, FiCompass } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-zinc-950/75 border-b border-slate-200/40 dark:border-zinc-900/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Sidebar toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100/80 dark:hover:bg-zinc-900 md:hidden transition-all active:scale-95"
              >
                <FiMenu size={20} />
              </button>
            )}
            
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/10 group-hover:scale-105 transition-all">
                P
              </div>
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                PARKSMART
              </span>
            </Link>
          </div>

          {/* Navigation Links with Active Indicators */}
          <div className="hidden md:flex items-center gap-7 text-xs font-extrabold tracking-widest uppercase">
            <Link 
              to="/" 
              className={`transition-colors py-1 relative ${
                isActive('/') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Home
              {isActive('/') && (
                <span className="absolute bottom-[-18px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
            <Link 
              to="/explore" 
              className={`transition-colors py-1 relative ${
                isActive('/explore') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Parking Lots
              {isActive('/explore') && (
                <span className="absolute bottom-[-18px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors py-1 relative ${
                isActive('/about') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              About Us
              {isActive('/about') && (
                <span className="absolute bottom-[-18px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
            <Link 
              to="/contact" 
              className={`transition-colors py-1 relative ${
                isActive('/contact') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Contact
              {isActive('/contact') && (
                <span className="absolute bottom-[-18px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
          </div>

          {/* User actions block */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-all active:scale-95 border border-transparent dark:hover:border-zinc-800"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3.5">
                {/* Profile Dashboard link */}
                <Link
                  to={
                    user?.role === 'admin' 
                      ? '/admin' 
                      : user?.role === 'guide' 
                      ? '/guide' 
                      : '/dashboard'
                  }
                  className="hidden sm:flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wide transition-all border border-blue-500/10"
                >
                  <FiCompass />
                  Dashboard
                </Link>

                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user?.username?.substring(0, 2)}
                  </div>
                  <span className="hidden lg:block text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-slate-200/20 dark:border-zinc-800">
                    {user?.role}
                  </span>
                </div>

                {/* Logout action */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/15"
                  title="Sign Out"
                >
                  <FiLogOut size={17} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-extrabold text-xs tracking-wider uppercase px-4 py-2 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary py-2 px-5 text-xs tracking-wide uppercase font-extrabold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
