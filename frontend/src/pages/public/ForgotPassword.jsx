import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      addToast('Recovery email has been dispatched successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Request failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10 border border-slate-200/50 dark:border-zinc-800/60 shadow-glass-light dark:shadow-glass">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
          <FiArrowLeft /> Back to Sign In
        </Link>

        {sent ? (
          <div className="text-center">
            <FiCheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Link Sent</h2>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              A secure password recovery email has been sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>. Please check your inbox and follow the instructions to update your password credentials.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reset Password</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Enter your registered email address to receive recovery steps</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 glass-input"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 mt-2"
              >
                {loading ? 'Sending...' : 'Send Recovery Link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
