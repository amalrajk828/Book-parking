import { useState } from 'react';
import { FiSend, FiMail, FiPhoneCall, FiMapPin, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const Contact = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Please enter all required fields', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      addToast('Your support request has been logged successfully!', 'success');
      setLoading(false);
    }, 1200);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 85, damping: 15 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto px-4 py-16 relative font-semibold text-xs text-slate-500 dark:text-slate-400"
    >
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      <motion.div variants={itemVariants} className="mb-12 text-center md:text-left">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">Customer Support</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-bold">Have questions about reserving slots or managing structures? Connect with our team.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Contact Form */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="glass-card p-8 rounded-3xl border border-slate-200/50 dark:border-zinc-900/50 shadow-glass-light dark:shadow-glass bg-white/80 dark:bg-zinc-950/80 min-h-[420px] flex flex-col justify-center">
            {submitted ? (
              <div className="text-center py-12 max-w-sm mx-auto">
                <div className="h-14 w-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <FiSend size={24} className="translate-x-0.5 -translate-y-0.5 animate-bounce" />
                </div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white font-sans tracking-tight">Support Ticket Logged</h2>
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Thank you! Your message has been safely logged in our system. A smart parking support officer will contact you at <span className="text-blue-500">{formData.email}</span> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', message: '' });
                  }}
                  className="btn-secondary py-2.5 text-xs font-bold uppercase mt-6 mx-auto w-full"
                >
                  Log Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-slate-500 dark:text-slate-400">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-extrabold uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full glass-input"
                      placeholder="Amal Raj"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-extrabold uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full glass-input"
                      placeholder="amal@example.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold uppercase tracking-wide">Detailed Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full glass-input leading-relaxed"
                    placeholder="Describe how we can assist you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-3.5 text-xs uppercase tracking-wider font-extrabold self-start shadow-lg shadow-blue-500/10 w-full sm:w-auto px-8"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                      Logging ticket...
                    </>
                  ) : (
                    <>
                      Send Support Request <FiSend />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Right Column: Contact info sidebar */}
        <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-6">
          <div className="premium-card p-6 bg-white dark:bg-zinc-950/80 shadow-sm flex flex-col gap-6">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider font-sans border-b border-slate-200/10 dark:border-zinc-900/30 pb-3 block">
              Contact Details
            </h3>

            <div className="flex flex-col gap-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl mt-0.5">
                  <FiMail size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Email Support</span>
                  <span className="text-slate-800 dark:text-white font-bold block mt-1">support@parksmart.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl mt-0.5">
                  <FiPhoneCall size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Call Support</span>
                  <span className="text-slate-800 dark:text-white font-bold block mt-1">+91 9876543210</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl mt-0.5">
                  <FiMapPin size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Corporate HQ</span>
                  <span className="text-slate-800 dark:text-white font-semibold block mt-1 leading-relaxed">
                    ParkSmart IoT Tech Park,<br />Highway Junction, Nedumbassery,<br />Kochi, Kerala - 683111
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-200/10 dark:border-zinc-900/20 pt-5 mt-1">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl mt-0.5">
                  <FiClock size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Support Hours</span>
                  <span className="text-slate-800 dark:text-white font-semibold block mt-1 leading-relaxed">
                    Monday - Saturday:<br />09:00 AM - 06:00 PM IST
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;
