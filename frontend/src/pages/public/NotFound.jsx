import { Link } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden font-semibold text-xs text-slate-500 dark:text-slate-400">
      
      {/* Decorative Blob Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 translate-y-1/2 w-[280px] h-[280px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 90, damping: 15 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 md:p-10 text-center relative z-10 border border-slate-200/50 dark:border-zinc-900/50 shadow-glass-light dark:shadow-glass bg-white/85 dark:bg-zinc-950/85"
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5, ease: 'easeInOut' }}
          className="h-16 w-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20"
        >
          <FiAlertTriangle size={32} />
        </motion.div>

        <h1 className="text-6xl font-black tracking-tight text-slate-900 dark:text-white font-sans bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent mb-4">
          404
        </h1>
        
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-3 font-sans">
          Parking Spot Not Found
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-xs mx-auto font-medium">
          The page you are looking for doesn't exist, has been moved, or this slot has been occupied elsewhere!
        </p>

        <Link
          to="/"
          className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/10"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Navigate to Safety (Home)
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
