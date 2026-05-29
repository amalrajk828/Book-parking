import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings } from '../../features/bookingSlice';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCompass, FiBell, FiActivity, FiMapPin, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myBookings, loading } = useSelector((state) => state.bookings);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    dispatch(fetchMyBookings());
    
    // Fetch notifications
    const getNotifications = async () => {
      try {
        await api.get('/auth/profile');
        setNotifications([
          { _id: '1', message: 'Welcome to ParkSmart! Explore active slot grids now.', createdAt: new Date() }
        ]);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    getNotifications();
  }, [dispatch]);

  const activeBookings = myBookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 p-4 md:p-8"
    >
      
      {/* Header welcome banner */}
      <motion.div 
        variants={itemVariants}
        className="premium-card p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-zinc-950 dark:to-zinc-900/40 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl pointer-events-none" />
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">Hello, {user?.username}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-semibold leading-relaxed">
            Manage your parking slots, view digital QR tickets, and retrieve billing logs.
          </p>
        </div>
        <Link to="/explore" className="btn-primary py-2.5 text-xs uppercase tracking-wide font-extrabold self-start sm:self-auto shadow-md hover:shadow-lg shadow-blue-500/10">
          <FiCompass /> Book New Parking
        </Link>
      </motion.div>

      {/* Grid statistics metrics */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-semibold">
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="premium-card p-6 rounded-2xl flex items-center gap-4 bg-white dark:bg-zinc-950/80"
        >
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
            <FiActivity size={24} />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Passes</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">{activeBookings.length}</span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="premium-card p-6 rounded-2xl flex items-center gap-4 bg-white dark:bg-zinc-950/80"
        >
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            <FiBookOpen size={24} />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Stay History</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">{myBookings.length}</span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="premium-card p-6 rounded-2xl flex items-center gap-4 bg-white dark:bg-zinc-950/80"
        >
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
            <FiBell size={24} />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">System Alerts</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">{notifications.length}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Booking matrices overview split list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 columns: Active Bookings */}
        <motion.div variants={containerVariants} className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Active Parking Tickets</h2>
          
          {loading ? (
            <div className="premium-card h-40 rounded-2xl animate-pulse" />
          ) : activeBookings.length === 0 ? (
            <div className="premium-card p-12 text-center text-xs text-slate-400 bg-white/50 dark:bg-zinc-950/20">
              <FiCompass className="mx-auto text-blue-500 mb-3" size={28} />
              <span>No active reservations found. Locate a vacant parking structure to get started.</span>
              <Link to="/explore" className="btn-secondary py-2 text-xs font-bold uppercase mt-4 mx-auto max-w-[180px]">
                Explore Structures
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeBookings.map((b) => {
                const isCheckedIn = b.status === 'checked-in';
                const statusBadgeStyle = isCheckedIn 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                  : 'bg-blue-500/10 text-blue-500 border border-blue-500/30';

                return (
                  <motion.div 
                    key={b._id} 
                    variants={itemVariants}
                    whileHover={{ scale: 1.005 }}
                    className="premium-card p-6 flex flex-col justify-between items-start gap-4 bg-white dark:bg-zinc-950 font-semibold"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-center w-full justify-between font-semibold">
                      <div className="flex flex-col gap-1.5 flex-grow">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${statusBadgeStyle}`}>
                            {b.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">{b.bookingId}</span>
                        </div>
                        
                        <h3 className="font-extrabold text-base text-slate-800 dark:text-white mt-1.5 font-sans">
                          {b.area?.name || 'Smart Parking Lot'}
                        </h3>
                        
                        <div className="text-xs text-slate-400 font-bold flex flex-wrap items-center gap-3 mt-1 uppercase tracking-wide">
                          <span className="flex items-center gap-1"><FiMapPin className="text-blue-500" /> Space: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{b.slot?.slotId || 'A1'}</span></span>
                          <span>•</span>
                          <span>Plate: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{b.vehicleDetails?.number}</span></span>
                        </div>
                      </div>

                      {/* Small scannable QR Code inline */}
                      {b.qrCode && (
                        <div className="shrink-0 p-1.5 border border-slate-200/60 dark:border-zinc-800/80 rounded-xl bg-white shadow-sm flex items-center justify-center">
                          <img 
                            src={b.qrCode} 
                            alt="Scan QR" 
                            className="w-16 h-16 rounded-lg bg-white" 
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                        <Link 
                          to={`/bookings/${b._id}`} 
                          className="btn-primary py-2 px-5 text-xs font-extrabold uppercase tracking-wider text-center shadow-md animate-pulse"
                        >
                          View QR Ticket
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Right 1 column: Notifications activity panel */}
        <motion.div variants={containerVariants} className="lg:col-span-1 flex flex-col gap-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Recent Activity</h2>
          
          <motion.div 
            variants={itemVariants}
            className="premium-card p-6 flex flex-col gap-4.5 bg-white dark:bg-zinc-950"
          >
            {notifications.map((n) => (
              <div key={n._id} className="flex gap-3 text-xs leading-relaxed border-b border-slate-200/10 dark:border-zinc-900/20 pb-4.5 last:border-0 last:pb-0">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl shrink-0 h-8 w-8 flex items-center justify-center">
                  <FiBell size={14} />
                </div>
                <div className="flex flex-col gap-0.5 font-semibold">
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">{n.message}</p>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-1.5 flex items-center gap-1">
                    <FiClock /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • System notification
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default UserDashboard;
