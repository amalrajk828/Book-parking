import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiActivity, FiMapPin, FiCpu, FiGrid, FiUserCheck, FiChevronRight, FiUser, FiMail, FiPhone, FiCreditCard, FiClock, FiX, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const GuideDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();
  
  // States
  const [assignedAreaDetails, setAssignedAreaDetails] = useState(null);
  const [slotsList, setSlotsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Inspector Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [updatingSlotStatus, setUpdatingSlotStatus] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState(null);

  const getGuideArea = async () => {
    setLoading(true);
    try {
      const res = await api.get('/areas');
      if (res.data.success) {
        // Find area assigned to this guide user ID
        const area = res.data.areas.find(a => a.assignedGuide?._id === user._id || a.assignedGuide === user._id);
        if (area) {
          // Fetch slot list
          const detailsRes = await api.get(`/areas/${area._id}`);
          if (detailsRes.data.success) {
            setAssignedAreaDetails(detailsRes.data.area);
            setSlotsList(detailsRes.data.slots);
          }
        }
      }
    } catch (err) {
      console.error('[FRONTEND DEBUG] Error loading guide area details:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    getGuideArea();
  }, [dispatch, user]);

  const handleSlotClick = async (slot) => {
    setSelectedSlot(slot);
    setBookingDetails(null);
    setCheckoutSummary(null);
    setModalError('');
    setModalOpen(true);

    if (slot.status === 'available') {
      setModalLoading(false);
      return;
    }

    setModalLoading(true);
    try {
      const res = await api.get(`/slots/${slot._id}/booking`);
      if (res.data.success) {
        setBookingDetails(res.data.booking);
      } else {
        setModalError('No active booking found for this slot.');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to retrieve slot booking details.');
    }
    setModalLoading(false);
  };

  const handleCheckIn = async () => {
    if (!bookingDetails) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/bookings/${bookingDetails._id}/check-in`);
      if (res.data.success) {
        addToast('Check-In gate entry confirmed successfully.', 'success');
        setModalOpen(false);
        getGuideArea(); // Reload area slot allocations
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'error');
    }
    setActionLoading(false);
  };

  const handleCheckOut = async () => {
    if (!bookingDetails) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/bookings/${bookingDetails._id}/check-out`);
      if (res.data.success) {
        addToast('Departure Check-Out completed successfully!', 'success');
        setCheckoutSummary({
          bookedDurationMinutes: res.data.bookedDurationMinutes,
          actualDurationMinutes: res.data.actualDurationMinutes,
          extraMinutes: res.data.extraMinutes,
          extraCharge: res.data.extraCharge,
          totalAmount: res.data.totalAmount,
          paymentStatus: res.data.booking?.paymentStatus || 'paid',
          bookingId: res.data.booking?.bookingId,
        });
        getGuideArea(); // Reload area slot allocations
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-out failed', 'error');
    }
    setActionLoading(false);
  };

  const handleUpdateSlotStatus = async (newStatus) => {
    if (!selectedSlot) return;
    setUpdatingSlotStatus(true);
    try {
      const res = await api.put(`/slots/${selectedSlot._id}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(res.data.message || 'Slot status updated successfully', 'success');
        setModalOpen(false);
        getGuideArea(); // Reload slot grid map
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update slot status.', 'error');
    }
    setUpdatingSlotStatus(false);
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
      className="flex flex-col gap-8 p-4 md:p-8 relative font-semibold text-xs text-slate-500 dark:text-slate-400"
    >
      <div className="absolute top-10 right-10 w-80 h-80 bg-blue-500/5 blur-3xl pointer-events-none rounded-full animate-float" />

      {/* Header welcome banner */}
      <motion.div 
        variants={itemVariants} 
        className="premium-card p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-950/80"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">Guide Officer Panel</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-bold">Manage check-in confirmations, scan customer QR tickets, and check slot allocations</p>
        </div>
        <Link to="/guide/scanner" className="btn-primary py-2.5 text-xs uppercase tracking-wide font-extrabold shadow-md">
          <FiGrid /> Verify Ticket QR
        </Link>
      </motion.div>

      {loading ? (
        <div className="premium-card h-80 animate-pulse" />
      ) : !assignedAreaDetails ? (
        <motion.div 
          variants={itemVariants}
          className="premium-card p-12 text-center flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-950"
        >
          <FiUserCheck size={32} className="text-blue-500 animate-float" />
          <span className="text-slate-400 text-xs font-semibold leading-relaxed max-w-sm">
            You are not currently assigned to any parking area. Please request the System Admin to bind you to an active parking structure.
          </span>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Area details and grid mapping */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div 
              variants={itemVariants}
              className="premium-card p-6 bg-white dark:bg-zinc-950/80 shadow-sm"
            >
              <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 font-sans">
                <FiMapPin className="text-blue-500" />
                Structure: {assignedAreaDetails.name}
              </h2>
              <p className="text-[11px] text-slate-400 mt-1.5 ml-6 font-bold">{assignedAreaDetails.address}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 border-t border-slate-200/10 dark:border-zinc-900/30 pt-6 text-xs font-semibold">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Total Slots</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white">{assignedAreaDetails.totalSlots}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Available Slots</span>
                  <span className="text-lg font-black text-green-500">{assignedAreaDetails.availableSlots}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Occupied Slots</span>
                  <span className="text-lg font-black text-amber-500">{assignedAreaDetails.occupiedSlots}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Fee per Hour</span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹{assignedAreaDetails.feePerHour}</span>
                </div>
              </div>
            </motion.div>

            {/* Interactive Grid Map */}
            <motion.div 
              variants={itemVariants}
              className="premium-card p-6 bg-white dark:bg-zinc-950/80 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200/10 dark:border-zinc-900/30 pb-4 mb-6 gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Active Grid Allocation</h3>
                  <p className="text-xs text-slate-400 mt-1 font-bold">Click any Booked or Checked-In slot to inspect reservation details</p>
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-green-500/20 border border-green-500" />
                    <span>Free</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-red-500/20 border border-red-500" />
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-amber-500/20 border border-amber-500" />
                    <span>Parked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-zinc-700/20 border border-zinc-600" />
                    <span>Expired</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {slotsList.map((slot) => {
                  let colorClass = 'neon-glow-green cursor-pointer';
                  if (slot.status === 'reserved') {
                    colorClass = 'neon-glow-red cursor-pointer';
                  } else if (slot.status === 'occupied') {
                    colorClass = 'neon-glow-amber cursor-pointer';
                  } else if (slot.status === 'expired') {
                    colorClass = 'neon-glow-zinc cursor-pointer';
                  }

                  return (
                    <button
                      key={slot._id}
                      onClick={() => handleSlotClick(slot)}
                      className={`
                        h-16 border rounded-2xl flex flex-col items-center justify-center font-extrabold text-sm tracking-wide transition-all duration-300 active:scale-95 hover:scale-[1.03]
                        ${colorClass}
                      `}
                    >
                      <span className="text-base font-black">{slot.slotId.substring(slot.slotId.lastIndexOf('-') + 1)}</span>
                      <span className="text-[9px] font-black uppercase mt-0.5 tracking-wider">
                        {slot.status === 'reserved' ? 'Booked' : slot.status === 'occupied' ? 'Parked' : slot.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column: General guide operational guidelines */}
          <div className="lg:col-span-1">
            <motion.div 
              variants={itemVariants}
              className="premium-card p-6 bg-white dark:bg-zinc-950/80 shadow-sm flex flex-col gap-6"
            >
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Officer Operations</h3>
                <p className="text-xs text-slate-400 mt-1 font-bold">Grid monitoring operational flows</p>
              </div>

              <div className="flex flex-col gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/10 dark:border-zinc-900/30 pt-4">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0 font-bold">1</span>
                  <p>Slots colored <span className="text-red-500 font-bold">Red</span> represent confirmed reservations waiting for check-in.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0 font-bold">2</span>
                  <p>Slots colored <span className="text-amber-500 font-bold">Yellow</span> represent checked-in, occupied spaces.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0 font-bold">3</span>
                  <p>Clicking any booked or parked slot will open a detailed client inspection panel instantly.</p>
                </div>
              </div>

              <Link to="/guide/scanner" className="btn-primary py-3 text-xs uppercase tracking-wider font-extrabold justify-center w-full mt-4 shadow-md">
                Scan Arrival QR Code
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* Structured Inspector Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 shadow-glass rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-50/80 dark:bg-zinc-900/40 border-b border-slate-200/10 dark:border-zinc-900/30 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Slot Inspector</span>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1 font-sans">
                    Slot: {selectedSlot?.slotId}
                  </h3>
                </div>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
                {checkoutSummary ? (
                  <div className="flex flex-col gap-6 text-sm">
                    {/* Success Header */}
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
                        <FiCheckCircle size={28} />
                      </div>
                      <h4 className="text-lg font-black text-slate-800 dark:text-white mt-1.5 font-sans">Check-Out Receipt</h4>
                      <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
                        Released Space Successfully
                      </span>
                    </div>

                    {/* Receipt Itemized Parameters */}
                    <div className="flex flex-col gap-3.5 bg-slate-100/30 dark:bg-zinc-900/20 border border-slate-200/20 dark:border-zinc-900/40 p-5 rounded-3xl text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                      <div className="flex justify-between border-b border-dashed border-slate-200/20 dark:border-zinc-800/40 pb-2">
                        <span>Ticket ID</span>
                        <span className="font-extrabold text-slate-800 dark:text-white uppercase">{checkoutSummary.bookingId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Booked Duration</span>
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">
                          {Math.floor(checkoutSummary.bookedDurationMinutes / 60)} hrs {checkoutSummary.bookedDurationMinutes % 60} mins
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actual Duration</span>
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">
                          {Math.floor(checkoutSummary.actualDurationMinutes / 60)} hrs {checkoutSummary.actualDurationMinutes % 60} mins
                        </span>
                      </div>
                      
                      {checkoutSummary.extraMinutes > 0 && (
                        <div className="flex justify-between text-amber-500 font-bold">
                          <span>Overtime Duration</span>
                          <span>+ {checkoutSummary.extraMinutes} mins</span>
                        </div>
                      )}

                      {checkoutSummary.extraCharge > 0 && (
                        <div className="flex justify-between text-amber-500 font-black border-t border-dashed border-slate-200/20 dark:border-zinc-800/40 pt-2.5">
                          <span>Overtime Extra Fee</span>
                          <span>+ ₹{checkoutSummary.extraCharge}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm font-black border-t border-dashed border-slate-200/20 dark:border-zinc-800/40 pt-3 mt-1 text-slate-900 dark:text-white">
                        <span>Grand Total Charged</span>
                        <span className="text-base text-blue-600 dark:text-blue-400 font-sans font-black">₹{checkoutSummary.totalAmount}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider px-2">
                      <span className="text-slate-400">Payment Status</span>
                      <span className="text-green-500 font-extrabold flex items-center gap-1">
                        <FiCheckCircle /> PAID (CREDIT)
                      </span>
                    </div>
                  </div>
                ) : selectedSlot?.status === 'available' ? (
                  <div className="flex flex-col gap-6 text-sm">
                    {/* Vacant Info Panel */}
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-start gap-2.5">
                      <FiInfo className="shrink-0 mt-0.5" size={18} />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-xs uppercase tracking-wider">Vacant Parking Space</span>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 mt-0.5">
                          This slot is currently empty (Available) and has no active reservation. Guides can safely monitor the space or manually update its status if needed.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/10 dark:border-zinc-800/30 pt-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Slot Number</span>
                        <span className="text-sm font-black text-slate-800 dark:text-white mt-0.5 uppercase">
                          {selectedSlot?.slotId}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Slot Status</span>
                        <span className="text-sm font-black text-emerald-500 mt-0.5 uppercase flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                        </span>
                      </div>
                    </div>

                    {/* Manual override status selection */}
                    <div className="border-t border-slate-200/10 dark:border-zinc-800/30 pt-4 flex flex-col gap-2.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Safe Status Override</label>
                      <div className="flex flex-wrap gap-2">
                        {['reserved', 'occupied', 'expired'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateSlotStatus(st)}
                            disabled={updatingSlotStatus}
                            className="btn-secondary py-1.5 px-3.5 text-[10px] font-extrabold uppercase tracking-wide rounded-lg flex items-center justify-center shrink-0 border border-slate-200/30 dark:border-zinc-800/30"
                          >
                            Set {st === 'reserved' ? 'Booked' : st === 'occupied' ? 'Parked' : st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : modalLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-blue-500" />
                    <span className="text-xs text-slate-400 font-semibold">Retrieving Reservation from MongoDB...</span>
                  </div>
                ) : modalError ? (
                  <div className="flex flex-col gap-5 text-sm">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-2">
                      <FiAlertTriangle className="shrink-0 mt-0.5" size={16} />
                      <span>{modalError}</span>
                    </div>

                    {/* Manual override status selection fallback */}
                    <div className="border-t border-slate-200/10 dark:border-zinc-800/30 pt-4 flex flex-col gap-2.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Safe Status Override</label>
                      <div className="flex flex-wrap gap-2">
                        {['available', 'reserved', 'occupied', 'expired'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateSlotStatus(st)}
                            disabled={updatingSlotStatus}
                            className="btn-secondary py-1.5 px-3.5 text-[10px] font-extrabold uppercase tracking-wide rounded-lg border border-slate-200/30 dark:border-zinc-800/30 font-bold"
                          >
                            Set {st === 'reserved' ? 'Booked' : st === 'occupied' ? 'Parked' : st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : bookingDetails ? (
                  <div className="flex flex-col gap-6 text-sm">
                    
                    {/* Status & ID */}
                    <div className="flex justify-between items-center border-b border-slate-200/10 dark:border-zinc-900/35 pb-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Booking ID</span>
                        <span className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{bookingDetails.bookingId}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Status</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          bookingDetails.status === 'checked-in' 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                        }`}>
                          {bookingDetails.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-semibold text-slate-500 dark:text-slate-400">
                      
                      {/* Customer Info */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">User Name</span>
                        <span className="text-slate-800 dark:text-white font-extrabold flex items-center gap-1.5 mt-0.5">
                          <FiUser className="text-slate-400" /> {bookingDetails.user?.username}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">User Email</span>
                        <span className="text-slate-800 dark:text-white font-bold flex items-center gap-1.5 mt-0.5">
                          <FiMail className="text-slate-400" /> {bookingDetails.user?.email}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Phone Number</span>
                        <span className="text-slate-800 dark:text-white font-bold flex items-center gap-1.5 mt-0.5">
                          <FiPhone className="text-slate-400" /> {bookingDetails.user?.phone || 'N/A'}
                        </span>
                      </div>

                      {/* Vehicle */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Vehicle Number</span>
                        <span className="text-slate-800 dark:text-white font-extrabold uppercase mt-0.5">
                          {bookingDetails.vehicleDetails?.number}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Vehicle Type</span>
                        <span className="text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                          {bookingDetails.vehicleDetails?.type}
                        </span>
                      </div>

                      {/* Location details */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Parking Area</span>
                        <span className="text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                          {bookingDetails.area?.name || 'Smart Lot'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Slot Number</span>
                        <span className="text-slate-800 dark:text-white font-extrabold mt-0.5">
                          {bookingDetails.slot?.slotId || selectedSlot?.slotId}
                        </span>
                      </div>

                      {/* Financial / Payment */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Payment Status</span>
                        <span className="text-green-500 font-extrabold flex items-center gap-1 mt-0.5">
                          <FiCheckCircle /> {bookingDetails.paymentStatus?.toUpperCase() || 'PAID'} (₹{bookingDetails.actualAmount || bookingDetails.estimatedAmount})
                        </span>
                      </div>

                      {/* Timestamps */}
                      <div className="flex flex-col gap-0.5 col-span-2 border-t border-slate-200/10 dark:border-zinc-800/30 pt-3">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Booking Date</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                          <FiClock /> {new Date(bookingDetails.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Entry Time</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                          <FiClock /> {bookingDetails.slot?.activeTiming?.start ? new Date(bookingDetails.slot.activeTiming.start).toLocaleTimeString() : new Date(bookingDetails.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      {bookingDetails.checkInTime && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Check-In Time</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                            <FiClock /> {new Date(bookingDetails.checkInTime).toLocaleTimeString()}
                          </span>
                        </div>
                      )}

                      {bookingDetails.checkOutTime && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Check-Out Time</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                            <FiClock /> {new Date(bookingDetails.checkOutTime).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Manual override status selection */}
                    <div className="border-t border-slate-200/10 dark:border-zinc-800/30 pt-4 flex flex-col gap-2.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest animate-glow">Safe Status Override</label>
                      <div className="flex flex-wrap gap-2">
                        {['available', 'reserved', 'occupied', 'expired'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateSlotStatus(st)}
                            disabled={updatingSlotStatus}
                            className="btn-secondary py-1.5 px-3.5 text-[10px] font-extrabold uppercase tracking-wide rounded-lg border border-slate-200/30 dark:border-zinc-800/30 font-bold hover:border-blue-500/40"
                          >
                            Set {st === 'reserved' ? 'Booked' : st === 'occupied' ? 'Parked' : st}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    Inspector Idle.
                  </div>
                )}
              </div>

              {/* Modal Footer Check-In/Check-Out options */}
              <div className="p-6 bg-slate-50/50 dark:bg-zinc-900/10 border-t border-slate-200/10 dark:border-zinc-800/30 flex gap-3">
                {checkoutSummary ? (
                  <button
                    onClick={() => {
                      setCheckoutSummary(null);
                      setModalOpen(false);
                    }}
                    className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-extrabold justify-center"
                  >
                    Done & Close
                  </button>
                ) : (
                  <>
                    {bookingDetails?.status === 'confirmed' && (
                      <button
                        onClick={handleCheckIn}
                        disabled={actionLoading}
                        className="btn-primary flex-1 py-3 text-xs uppercase tracking-wider font-extrabold justify-center"
                      >
                        {actionLoading ? 'Processing Check-In...' : 'Confirm Check-In'}
                      </button>
                    )}

                    {bookingDetails?.status === 'checked-in' && (
                      <button
                        onClick={handleCheckOut}
                        disabled={actionLoading}
                        className="btn-primary bg-amber-500 hover:bg-amber-600 border-amber-500 flex-1 py-3 text-xs uppercase tracking-wider font-extrabold justify-center animate-glow"
                      >
                        {actionLoading ? 'Processing Checkout...' : 'Confirm Checkout & Exit'}
                      </button>
                    )}

                    <button
                      onClick={() => setModalOpen(false)}
                      className="btn-secondary py-3 text-xs font-extrabold uppercase tracking-wider px-6 justify-center"
                    >
                      Close Panel
                    </button>
                  </>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GuideDashboard;
