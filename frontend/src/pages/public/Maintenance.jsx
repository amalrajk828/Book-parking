import { motion } from 'framer-motion';
import { FiSliders, FiTool, FiMail, FiPhoneCall } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Maintenance = () => {
  const { settings } = useSelector((state) => state.settings);

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-slate-900 text-white relative overflow-hidden font-sans">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-80" />

      {/* Top Brand Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {settings.websiteLogo ? (
            <img src={settings.websiteLogo} alt="Logo" className="h-8 object-contain" />
          ) : (
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md">
              {settings.websiteName.substring(0, 1).toUpperCase()}
            </div>
          )}
          <span className="font-black text-sm uppercase tracking-widest">{settings.websiteName}</span>
        </div>
        
        {/* Admin Secret Portal Link */}
        <Link 
          to="/login"
          className="glass-card hover:bg-white/10 text-xs font-extrabold uppercase tracking-wider px-4 py-2 rounded-xl transition-all border border-white/5 flex items-center gap-2"
        >
          <FiSliders size={12} className="text-blue-400" />
          Staff Portal
        </Link>
      </header>

      {/* Main Alert Card */}
      <main className="z-10 flex flex-col items-center text-center px-4 max-w-2xl py-12 my-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="h-20 w-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-8 shadow-inner shadow-blue-500/5"
        >
          <FiTool size={36} className="animate-spin" style={{ animationDuration: '3s' }} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl sm:text-5xl font-black tracking-tight leading-tight"
        >
          Under Scheduled <br />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            System Maintenance
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 text-slate-400 text-sm sm:text-base font-semibold leading-relaxed"
        >
          {settings.maintenanceMessage || `We are currently upgrading ${settings.websiteName} to bring you an even smarter and faster parking experience. We apologize for the temporary interruption and will be back online shortly.`}
        </motion.p>

        {/* Contact Info Footer Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center font-semibold text-xs tracking-wider"
        >
          {settings.contactEmail && (
            <a 
              href={`mailto:${settings.contactEmail}`}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/40 border border-white/5 text-slate-300 hover:text-white transition-all hover:bg-slate-800/60"
            >
              <FiMail size={14} className="text-blue-400" />
              <span>{settings.contactEmail}</span>
            </a>
          )}
          {settings.contactPhone && (
            <a 
              href={`tel:${settings.contactPhone}`}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/40 border border-white/5 text-slate-300 hover:text-white transition-all hover:bg-slate-800/60"
            >
              <FiPhoneCall size={14} className="text-blue-400" />
              <span>{settings.contactPhone}</span>
            </a>
          )}
        </motion.div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-6 text-center text-slate-500 font-extrabold text-[10px] tracking-widest uppercase z-10 border-t border-white/5 bg-slate-950/20">
        © {new Date().getFullYear()} {settings.websiteName}. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Maintenance;
