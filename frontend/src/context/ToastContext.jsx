/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/20',
          border: 'border-emerald-500/30 dark:border-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          icon: <FiCheckCircle size={18} className="shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-red-500/10 dark:bg-red-950/20',
          border: 'border-red-500/30 dark:border-red-500/20',
          text: 'text-red-600 dark:text-red-400',
          icon: <FiAlertCircle size={18} className="shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/20',
          border: 'border-amber-500/30 dark:border-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          icon: <FiAlertTriangle size={18} className="shrink-0" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-950/20',
          border: 'border-blue-500/30 dark:border-blue-500/20',
          text: 'text-blue-600 dark:text-blue-400',
          icon: <FiInfo size={18} className="shrink-0" />,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className={`pointer-events-auto w-full backdrop-blur-md rounded-2xl border p-4 shadow-glass-light dark:shadow-glass flex items-start gap-3 bg-white/95 dark:bg-zinc-950/95 font-sans font-semibold text-xs tracking-normal ${styles.bg} ${styles.border} ${styles.text}`}
              >
                {styles.icon}
                <div className="flex-1 leading-relaxed pr-2 pt-0.5">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-200/50 dark:hover:bg-zinc-900/50 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
                >
                  <FiX size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
