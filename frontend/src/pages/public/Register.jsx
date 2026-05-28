import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../features/authSlice';
import { FiUser, FiMail, FiPhone, FiLock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'guide') navigate('/guide');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    dispatch(registerUser(formData));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative bg-slate-50/20 dark:bg-zinc-950/20 font-semibold text-xs">
      
      {/* Decorative Blob Glows */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-blue-500/10 blur-3xl pointer-events-none rounded-full animate-float" />
      <div className="absolute bottom-1/4 right-1/3 w-[260px] h-[260px] bg-purple-500/10 blur-3xl pointer-events-none rounded-full animate-float" style={{ animationDelay: '2.5s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 border border-slate-200/50 dark:border-zinc-900/50 shadow-glass-light dark:shadow-glass bg-white/80 dark:bg-zinc-950/80 animate-fade-in"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-sans">Create Account</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-bold font-sans">Join the smart parking revolution</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl text-xs flex items-center gap-2">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 text-slate-500 dark:text-slate-400">
          
          <div className="flex flex-col gap-1.5">
            <label className="font-extrabold uppercase tracking-wide">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-11 glass-input"
                placeholder="John Doe"
                autocomplete="name"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-extrabold uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-11 glass-input"
                placeholder="you@example.com"
                autocomplete="email"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-extrabold uppercase tracking-wide">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-11 glass-input"
                placeholder="9876543210"
                autocomplete="tel"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-extrabold uppercase tracking-wide">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-11 glass-input"
                placeholder="••••••••"
                autocomplete="new-password"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-extrabold uppercase tracking-wide">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-11 glass-input"
                placeholder="••••••••"
                autocomplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider font-extrabold mt-4"
          >
            {loading ? 'Registering...' : 'Create Account'}
            <FiArrowRight />
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 dark:text-slate-400 font-bold">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
