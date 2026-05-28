import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetPasswordUser } from '../../features/authSlice';
import { FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      addToast('Please enter all fields', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(resetPasswordUser({ token, password, confirmPassword }));
      if (result.meta.requestStatus === 'fulfilled' || result.payload?.success) {
        addToast('Password updated successfully! Redirecting...', 'success');
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        addToast(result.payload || 'Failed to reset password. Token may be invalid or expired.', 'error');
      }
    } catch (error) {
      console.error('Password reset action failed:', error);
      addToast('An unexpected error occurred. Please try again.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative font-semibold text-xs text-slate-500 dark:text-slate-400">
      
      {/* Decorative Blob Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 translate-y-1/2 w-[280px] h-[280px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 border border-slate-200/50 dark:border-zinc-900/50 shadow-glass-light dark:shadow-glass bg-white/80 dark:bg-zinc-950/80"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors font-bold">
          <FiArrowLeft /> Back to Sign In
        </Link>

        {success ? (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-14 w-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20"
            >
              <FiCheckCircle size={28} />
            </motion.div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">Credentials Saved</h2>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-xs mx-auto">
              Your password has been successfully updated in database. You will be redirected to log in shortly...
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">Define Password</h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-bold">Enter your new secure password credentials below</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 mt-6 text-slate-500 dark:text-slate-400">
              
              <div className="flex flex-col gap-1.5">
                <label className="font-extrabold uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 glass-input"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-extrabold uppercase tracking-wide">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-11 glass-input"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 mt-4 text-xs uppercase tracking-wider font-extrabold shadow-lg shadow-blue-500/10"
              >
                {loading ? 'Updating Credentials...' : 'Save Password'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
