import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookingById, userCancelBooking, clearActiveBooking } from '../../features/bookingSlice';
import { FiArrowLeft, FiDownload, FiCheckCircle, FiInfo, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const BookingDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { activeBooking, loading, error } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);


  useEffect(() => {
    dispatch(fetchBookingById(id));
    return () => {
      dispatch(clearActiveBooking());
    };
  }, [dispatch, id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setIsCancelling(true);
    const res = await dispatch(userCancelBooking(id));
    if (res.meta.requestStatus === 'fulfilled') {
      addToast('Booking cancelled successfully', 'success');
    } else {
      addToast(res.payload || 'Failed to cancel', 'error');
    }
    setIsCancelling(false);
  };

  const handleDownloadTicket = () => {
    if (!activeBooking?.qrCode) return;
    const link = document.createElement('a');
    link.href = activeBooking.qrCode;
    link.download = `ParkSmart-Ticket-${activeBooking.bookingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !activeBooking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center flex flex-col items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500 animate-shake">
          <FiAlertTriangle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight">Ticket Not Found</h2>
        <p className="leading-relaxed">
          {error || 'The reservation you are looking for does not exist, or you are not authorized to view it.'}
        </p>
        <Link to="/my-bookings" className="btn-primary mt-4 py-2.5 px-6 text-xs uppercase tracking-wider font-extrabold shadow-md">
          Return to My Bookings
        </Link>
      </div>
    );
  }

  // Security Check: Standard User can only read their own bookings
  if (user?.role === 'user' && activeBooking.user?._id && activeBooking.user._id !== user._id) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center flex flex-col items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500 animate-shake">
          <FiAlertTriangle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight">Unauthorized Access</h2>
        <p className="leading-relaxed">
          You are not authorized to view this booking record.
        </p>
        <Link to="/my-bookings" className="btn-primary mt-4 py-2.5 px-6 text-xs uppercase tracking-wider font-extrabold shadow-md">
          Return to My Bookings
        </Link>
      </div>
    );
  }

  const renderStatusBadge = (status) => {
    let badgeStyle = 'bg-blue-600/10 text-blue-500 border border-blue-500/30';
    let label = 'Active';

    if (status === 'checked-in') {
      badgeStyle = 'bg-green-600/10 text-green-500 border border-green-500/30';
      label = 'Checked In';
    } else if (status === 'checked-out') {
      badgeStyle = 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-400 border border-slate-200 dark:border-zinc-800';
      label = 'Completed';
    } else if (status === 'expired') {
      badgeStyle = 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      label = 'Expired';
    } else if (status === 'cancelled') {
      badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/30';
      label = 'Cancelled';
    } else if (status === 'confirmed') {
      badgeStyle = 'bg-blue-600/10 text-blue-500 border border-blue-500/30';
      label = 'Active';
    } else if (status === 'pending') {
      badgeStyle = 'bg-zinc-500/15 text-slate-500 border border-slate-500/30';
      label = 'Pending';
    }

    return (
      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${badgeStyle}`}>
        {label}
      </span>
    );
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
      className="max-w-5xl mx-auto px-4 py-8 relative transition-all duration-300 font-semibold text-xs text-slate-500 dark:text-slate-400"
    >
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none animate-float" />

      <motion.div variants={itemVariants}>
        <Link to="/my-bookings" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-800 dark:hover:text-white mb-8 transition-colors">
          <FiArrowLeft /> Back to Bookings
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Visual QR Ticket */}
        <motion.div variants={itemVariants} className="md:col-span-1">
          <div className="premium-card overflow-hidden flex flex-col items-center bg-white dark:bg-zinc-950/80 shadow-sm border border-slate-200/40 dark:border-zinc-900/40">
            
            {/* Ticket Header */}
            <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center text-white flex flex-col gap-1 items-center relative">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-200">Smart Ticket Pass</span>
              <h2 className="font-black text-2xl tracking-widest uppercase font-sans">{activeBooking.bookingId}</h2>
              <div className="mt-2.5">{renderStatusBadge(activeBooking.status)}</div>
            </div>

            {/* QR Scanner Area */}
            <div className="p-8 flex flex-col items-center text-center bg-white dark:bg-zinc-950 w-full border-b border-slate-200/10 dark:border-zinc-900/30">
              {activeBooking.qrCode ? (
                <img 
                  src={activeBooking.qrCode} 
                  alt="Scannable Pass" 
                  className="w-44 h-44 p-2 border border-slate-200/50 dark:border-zinc-900 rounded-2xl bg-white shadow-sm glow-primary" 
                />
              ) : (
                <div className="w-44 h-44 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs">Loading Pass Barcode...</div>
              )}
              <p className="text-[10px] text-slate-400 mt-4 leading-relaxed max-w-[200px] font-bold">
                Present this scannable barcode at the entrance gate checkpoints to check-in.
              </p>
            </div>

            {/* Actions Button */}
            <div className="p-6 w-full flex flex-col gap-3 bg-slate-50/20 dark:bg-zinc-900/10">
              <button 
                onClick={handleDownloadTicket}
                className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-extrabold justify-center"
              >
                <FiDownload /> Download Pass PNG
              </button>
              {(activeBooking.status === 'confirmed' || activeBooking.status === 'pending') && (
                <button 
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="btn-outline w-full py-3 text-xs uppercase tracking-wider font-extrabold justify-center border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Cancel Reservation
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Ticket details & Check-in timelines */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Timeline Status Display with beautiful indicators */}
          <motion.div variants={itemVariants} className="premium-card p-6 bg-white dark:bg-zinc-950/80">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 block">Live Check-In Timeline</h3>
            
            {(activeBooking.status === 'confirmed' || activeBooking.status === 'pending') && (
              <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                <FiClock className="animate-spin text-blue-500 shrink-0" size={20} />
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-sm font-sans tracking-wide">Waiting for Check-In</span>
                  <p className="text-xs font-semibold leading-relaxed">Your spot is reserved. Please present your QR ticket upon arrival at the parking structure.</p>
                </div>
              </div>
            )}

            {activeBooking.status === 'checked-in' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-2xl">
                  <FiCheckCircle className="text-green-500 shrink-0" size={20} />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-extrabold text-sm font-sans tracking-wide">Active: Checked In</span>
                    <p className="text-xs font-semibold leading-relaxed">Your vehicle is currently parked inside the allocated space.</p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-4 px-2 pt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Gate Check-In Time</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
                      {new Date(activeBooking.checkInTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeBooking.status === 'checked-out' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 rounded-2xl">
                  <FiCheckCircle className="text-slate-400 shrink-0" size={20} />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-extrabold text-sm font-sans tracking-wide">Completed: Checked Out</span>
                    <p className="text-xs font-semibold leading-relaxed">Your parking stay is completed and the slot has been freed.</p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 grid grid-cols-2 sm:grid-cols-3 gap-6 px-2 pt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Gate Check-In Time</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
                      {new Date(activeBooking.checkInTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Gate Check-Out Time</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
                      {new Date(activeBooking.checkOutTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Parking Duration</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
                      {activeBooking.checkOutTime && activeBooking.checkInTime 
                        ? `${((new Date(activeBooking.checkOutTime) - new Date(activeBooking.checkInTime)) / (1000 * 60 * 60)).toFixed(1)} Hrs` 
                        : `${activeBooking.reservedHours} Hrs`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeBooking.status === 'expired' && (
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl">
                <FiAlertTriangle className="shrink-0" size={20} />
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-sm font-sans tracking-wide">Expired Pass</span>
                  <p className="text-xs font-semibold leading-relaxed">Your booking has expired as checkout did not occur within bounds.</p>
                </div>
              </div>
            )}

            {activeBooking.status === 'cancelled' && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl animate-shake">
                <FiInfo className="shrink-0" size={20} />
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-sm font-sans tracking-wide">Reservation Cancelled</span>
                  <p className="text-xs font-semibold leading-relaxed">This booking was cancelled and slot bookings refunded.</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Core Booking parameters */}
          <motion.div variants={itemVariants} className="premium-card p-6 bg-white dark:bg-zinc-950/80 flex flex-col gap-6">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-200/10 dark:border-zinc-900/30 pb-3 block">
              Reservation Parameters
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex flex-col gap-0.5 font-bold">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Structure Name</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5 truncate">
                  {activeBooking.area?.name || 'Smart Parking Area'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Space Slot ID</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5">
                  {activeBooking.slot?.slotId || 'A1'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Booking ID</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5 uppercase">
                  {activeBooking.bookingId}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 font-bold">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Vehicle No</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5 uppercase tracking-wider">
                  {activeBooking.vehicleDetails?.number}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Vehicle Type</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {activeBooking.vehicleDetails?.type}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 font-bold">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Reservation Stay</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {activeBooking.reservedHours} Hours
                </span>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Booking Date</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {new Date(activeBooking.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Financial Invoice Ledger */}
            <div className="border-t border-slate-200/10 dark:border-zinc-900/30 pt-4 mt-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-4">Invoice Ledger</span>
              <div className="flex flex-col gap-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Reserved Base Price ({activeBooking.reservedHours} Hrs @ ₹{activeBooking.area?.feePerHour || 50}/hr)</span>
                  <span className="text-slate-800 dark:text-white font-bold">₹{activeBooking.estimatedAmount}</span>
                </div>
                {activeBooking.extraCharges > 0 && (
                  <div className="flex justify-between text-amber-500">
                    <span className="flex items-center gap-1"><FiAlertTriangle size={12} /> Overtime Additional Charges</span>
                    <span className="font-extrabold">+ ₹{activeBooking.extraCharges}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-extrabold border-t border-slate-200/10 dark:border-zinc-900/30 pt-3 mt-1 uppercase tracking-wide">
                  <span className="text-slate-800 dark:text-white">Total Amount Paid</span>
                  <span className="text-base text-blue-600 dark:text-blue-400">₹{activeBooking.actualAmount || activeBooking.estimatedAmount}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 border-t border-slate-200/10 dark:border-zinc-900/30 pt-2">
                  <span>Payment Status</span>
                  <span className="text-green-500 font-extrabold flex items-center gap-0.5">
                    <FiCheckCircle /> PAID (CREDIT)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default BookingDetails;
