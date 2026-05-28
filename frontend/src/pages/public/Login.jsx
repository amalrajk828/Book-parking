import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../features/authSlice';
import { FiMail, FiLock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative bg-slate-50/20 dark:bg-zinc-950/20 font-semibold text-xs">
      
      {/* Decorative Blur Background shapes */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 translate-y-1/2 w-[280px] h-[280px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 border border-slate-200/50 dark:border-zinc-900/50 shadow-glass-light dark:shadow-glass bg-white/80 dark:bg-zinc-950/80"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-sans">Welcome Back</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-bold font-sans">Sign in to control your smart slots</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl text-xs flex items-center gap-2">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {searchParams.get('expired') === 'true' && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-500 rounded-2xl text-xs flex items-center gap-2">
            <FiAlertCircle size={16} />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-slate-500 dark:text-slate-400">
          <div className="flex flex-col gap-1.5">
            <label className="font-extrabold uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 glass-input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-extrabold uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 glass-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider font-extrabold mt-4"
          >
            {loading ? 'Verifying...' : 'Sign In'}
            <FiArrowRight />
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 dark:text-slate-400 font-bold">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
