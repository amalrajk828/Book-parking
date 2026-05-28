import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings } from '../../features/bookingSlice';
import { Link, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiClock, FiDollarSign, FiSearch, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const MyBookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myBookings, loading } = useSelector((state) => state.bookings);
  
  // Lookup state properties
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    setLookupError('');
    
    const cleanId = lookupId.trim().toUpperCase();
    
    if (!cleanId) {
      setLookupError('Please enter a Booking ID');
      return;
    }

    // Basic format validation: BK-XXXXXX where X is numeric
    const isBkIdValid = /^BK-\d{6}$/.test(cleanId);
    if (!isBkIdValid) {
      setLookupError('Invalid Booking ID format. Standard ID resembles "BK-307357".');
      return;
    }

    setLookupLoading(true);
    try {
      const response = await api.get(`/bookings/${cleanId}`);
      if (response.data.success && response.data.booking) {
        navigate(`/bookings/${cleanId}`);
      } else {
        setLookupError('Booking not found in record registry.');
      }
    } catch (err) {
      setLookupError(err.response?.data?.message || 'Booking ticket not found. Please review the ID.');
    }
    setLookupLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 85, damping: 15 } }
  };

  const cardVariants = {
    hidden: { scale: 0.96, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 75, damping: 14 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 p-4 md:p-8 relative font-semibold text-xs text-slate-500 dark:text-slate-400"
    >
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-600/5 blur-3xl pointer-events-none rounded-full animate-float" />

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">My Bookings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-bold">View your complete booking history, download receipts, and retrieve active passes</p>
      </motion.div>

      {/* Ticket Lookup Widget Panel */}
      <motion.div 
        variants={itemVariants}
        className="premium-card p-6 bg-white dark:bg-zinc-950/80 shadow-sm max-w-2xl"
      >
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
          <FiSearch className="text-blue-500" /> Retrieve Reservation Details
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4.5 font-bold leading-relaxed">
          Access receipts, QR tickets, and check-out logs immediately by entering your Booking ID code.
        </p>

        <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="e.g. BK-307357"
            className="glass-input uppercase py-2.5 text-xs tracking-wider font-extrabold placeholder:normal-case placeholder:font-bold flex-grow"
          />
          <button
            type="submit"
            disabled={lookupLoading}
            className="btn-primary py-2.5 px-6 text-xs uppercase tracking-wider font-extrabold justify-center sm:self-stretch"
          >
            {lookupLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                Searching...
              </>
            ) : (
              <>Find Reservation</>
            )}
          </button>
        </form>

        {lookupError && (
          <div className="mt-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-2">
            <FiAlertCircle className="shrink-0 mt-0.5" size={15} />
            <span>{lookupError}</span>
          </div>
        )}
      </motion.div>

      {/* Bookings Grid list */}
      {loading ? (
        <div className="premium-card h-60 rounded-3xl animate-pulse" />
      ) : myBookings.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="premium-card p-12 text-center flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-950"
        >
          <FiBookOpen size={30} className="text-blue-500" />
          <span className="text-slate-400 text-xs font-semibold leading-relaxed max-w-sm">
            You haven't booked any parking slots yet. Go to the Explore page to reserve one.
          </span>
          <Link to="/explore" className="btn-secondary py-2 text-xs font-bold uppercase tracking-wider mt-2">
            Explore Lots
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {myBookings.map((b) => {
            let statusColor = 'bg-blue-500/10 text-blue-500 border border-blue-500/30';
            if (b.status === 'checked-in') statusColor = 'bg-green-500/10 text-green-500 border border-green-500/30';
            if (b.status === 'checked-out') statusColor = 'bg-slate-100 text-slate-700 dark:bg-zinc-800/80 dark:text-slate-300 border border-slate-200/20 dark:border-zinc-800/20';
            if (b.status === 'cancelled' || b.status === 'expired') statusColor = 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';

            return (
              <motion.div 
                key={b._id} 
                variants={cardVariants}
                whileHover={{ y: -2 }}
                className="premium-card p-6 flex flex-col justify-between gap-6 bg-white dark:bg-zinc-950 font-semibold shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">{b.bookingId}</span>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${statusColor}`}>
                      {b.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-white truncate font-sans tracking-wide">
                    {b.area?.name || 'Smart Parking Area'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Slot Reserved</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{b.slot?.slotId || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Vehicle No</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">{b.vehicleDetails?.number}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Reserved Hours</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{b.reservedHours} Hrs</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Estimated Fee</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">₹{b.estimatedAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200/10 dark:border-zinc-900/30 pt-4">
                  <Link 
                    to={`/bookings/${b._id}`}
                    className="btn-primary w-full text-xs py-2.5 justify-center font-extrabold uppercase tracking-wider shadow-sm"
                  >
                    View Ticket & Info
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default MyBookings;
