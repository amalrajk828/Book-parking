import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyTicketQR, guideConfirmCheckIn, guideConfirmCheckOut, clearScannedBooking } from '../../features/bookingSlice';
import { FiGrid, FiSearch, FiCheckCircle, FiClock, FiUser, FiInfo, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const QRScannerPage = () => {
  const [bookingInput, setBookingInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { scannedBooking, loading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    if (scannedBooking) {
      setSearchError('');
    }
    if (error) {
      setSearchError(error);
    }
  }, [scannedBooking, error]);

  useEffect(() => {
    return () => {
      dispatch(clearScannedBooking());
    };
  }, [dispatch]);

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setSearchError('');
    
    const cleanInput = bookingInput.trim().toUpperCase();

    if (!cleanInput) {
      setSearchError('Please enter a Booking ID');
      return;
    }

    setSearching(true);
    const result = await dispatch(verifyTicketQR(cleanInput));
    setSearching(false);

    if (result.meta.requestStatus === 'rejected') {
      setSearchError(result.payload || 'Reservation not found. Please verify the ID.');
      addToast(result.payload || 'Reservation not found. Please verify the ID.', 'error');
    } else {
      addToast('Ticket successfully verified!', 'success');
    }
  };

  const handleCheckIn = async () => {
    if (!scannedBooking) return;
    const res = await dispatch(guideConfirmCheckIn(scannedBooking._id));
    if (res.meta.requestStatus === 'fulfilled') {
      addToast('Check-In gate entry confirmed! Slot is now occupied.', 'success');
    } else {
      addToast(res.payload || 'Check-in failed', 'error');
    }
  };

  const handleCheckOut = async () => {
    if (!scannedBooking) return;
    const res = await dispatch(guideConfirmCheckOut(scannedBooking._id));
    if (res.meta.requestStatus === 'fulfilled') {
      const { extraCharges, actualAmount, estimatedAmount } = res.payload || {};
      addToast(`Check-Out completed! Overtime Fee: ₹${extraCharges || 0}, Total Paid: ₹${actualAmount || estimatedAmount}`, 'success');
      dispatch(clearScannedBooking());
      setBookingInput('');
    } else {
      addToast(res.payload || 'Check-out failed', 'error');
    }
  };

  const renderStatusBadge = (status) => {
    let badgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30';
    let label = 'Active';

    if (status === 'checked-in') {
      badgeClass = 'bg-green-500/10 text-green-500 border border-green-500/30 animate-pulse';
      label = 'Checked-In';
    } else if (status === 'checked-out') {
      badgeClass = 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-slate-400 border border-slate-300 dark:border-zinc-800';
      label = 'Completed';
    } else if (status === 'expired') {
      badgeClass = 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      label = 'Expired';
    } else if (status === 'cancelled') {
      badgeClass = 'bg-red-500/10 text-red-500 border border-red-500/30';
      label = 'Cancelled';
    } else if (status === 'confirmed') {
      badgeClass = 'bg-blue-600/10 text-blue-500 border border-blue-500/35';
      label = 'Active';
    }

    return (
      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${badgeClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative transition-all text-xs font-semibold text-slate-500 dark:text-slate-400">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans tracking-tight">
          <FiGrid className="text-blue-500" /> Ticket Verification
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Perform high-fidelity lookups by Booking ID to approve gate entrance check-ins and departures
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Search Dashboard Form */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-200/40 dark:border-zinc-800/40 shadow-sm bg-white dark:bg-zinc-950">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider mb-4 font-sans">
              Inspect Booking ID
            </h3>
            
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={bookingInput}
                  onChange={(e) => setBookingInput(e.target.value)}
                  placeholder="e.g. BK-307357"
                  required
                  className="w-full pl-10 pr-4 py-3 glass-input uppercase text-sm font-bold tracking-wider placeholder:normal-case placeholder:font-normal"
                />
              </div>

              {searchError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2">
                  <FiAlertTriangle className="shrink-0 mt-0.5" size={14} />
                  <span>{searchError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={searching || loading}
                className="btn-primary w-full py-3 text-sm justify-center"
              >
                {searching || loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                    Searching Database...
                  </>
                ) : (
                  <>Verify Reservation</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Ticket Screen display */}
        <div className="lg:col-span-2">
          {searching || loading ? (
            /* Loading skeletons */
            <div className="glass-card p-8 rounded-3xl border border-slate-200/40 dark:border-zinc-800/40 shadow-sm h-96 flex flex-col justify-between animate-pulse bg-white dark:bg-zinc-950">
              <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded-xl w-1/3" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
                <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
                <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
                <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
              </div>
              <div className="h-12 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            </div>
          ) : !scannedBooking ? (
            /* Idle Screen */
            <div className="glass-card p-12 rounded-3xl border border-slate-200/40 dark:border-zinc-800/40 shadow-sm text-center text-slate-400 text-sm flex flex-col items-center justify-center min-h-[350px] gap-4 bg-white dark:bg-zinc-950">
              <div className="p-4 bg-blue-500/10 rounded-full text-blue-500 animate-float">
                <FiGrid size={40} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Scanner Standby</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Enter a valid booking code on the left toolpane to retrieve reservation details, verify slot occupancy, and check billing logs.
                </p>
              </div>
            </div>
          ) : (
            /* Ticket Details display Card */
            <div className="glass-card rounded-3xl border border-slate-200/40 dark:border-zinc-800/40 shadow-sm overflow-hidden flex flex-col justify-between min-h-[350px] bg-white dark:bg-zinc-950">
              
              {/* Header */}
              <div className="p-6 md:p-8 bg-slate-100/50 dark:bg-zinc-900/40 border-b border-slate-200/10 dark:border-zinc-800/30 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Verification Ticket</span>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide uppercase font-sans">
                    {scannedBooking.bookingId}
                  </h2>
                </div>
                {renderStatusBadge(scannedBooking.status)}
              </div>

              {/* Param Matrix */}
              <div className="p-6 md:p-8 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm font-semibold">
                  
                  {/* Customer Info */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Customer Name</span>
                    <span className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <FiUser className="text-slate-400" /> {scannedBooking.vehicleDetails?.owner}
                    </span>
                  </div>

                  {/* Registration Code */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Registration Code</span>
                    <span className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mt-0.5">
                      {scannedBooking.vehicleDetails?.number}
                    </span>
                  </div>

                  {/* Vehicle Type */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Vehicle Type</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                      {scannedBooking.vehicleDetails?.type}
                    </span>
                  </div>

                  {/* Parking Structure */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Parking Structure</span>
                    <span className="font-extrabold text-slate-800 dark:text-white mt-0.5 truncate">
                      {scannedBooking.area?.name}
                    </span>
                  </div>

                  {/* Slot ID */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Allocated Slot</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 text-base">
                      {scannedBooking.slot?.slotId || 'A1'}
                    </span>
                  </div>

                  {/* Payment status */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Payment Ledger</span>
                    <span className="font-extrabold text-green-500 mt-0.5 flex items-center gap-1">
                      <FiDollarSign /> Paid - Gateway completed
                    </span>
                  </div>

                  {/* Entry time */}
                  <div className="flex flex-col gap-0.5 border-t border-slate-200/10 dark:border-zinc-800/30 pt-4 md:border-t-0 md:pt-0">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Check-In Time</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <FiClock /> {scannedBooking.checkInTime ? new Date(scannedBooking.checkInTime).toLocaleTimeString() : 'Not Checked In'}
                    </span>
                  </div>

                  {/* Exit time */}
                  <div className="flex flex-col gap-0.5 border-t border-slate-200/10 dark:border-zinc-800/30 pt-4 md:border-t-0 md:pt-0">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Check-Out Time</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <FiClock /> {scannedBooking.checkOutTime ? new Date(scannedBooking.checkOutTime).toLocaleTimeString() : 'Not Checked Out'}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col gap-0.5 border-t border-slate-200/10 dark:border-zinc-800/30 pt-4 md:border-t-0 md:pt-0">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Reserved Duration</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                      {scannedBooking.reservedHours} Hours
                    </span>
                  </div>

                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-6 bg-slate-50/50 dark:bg-zinc-900/20 border-t border-slate-200/10 dark:border-zinc-800/30 flex gap-4">
                {scannedBooking.status === 'confirmed' && (
                  <button
                    onClick={handleCheckIn}
                    className="btn-primary flex-1 py-3 justify-center text-sm font-bold tracking-wide"
                  >
                    Confirm Check-In Gate Entry
                  </button>
                )}

                {scannedBooking.status === 'checked-in' && (
                  <button
                    onClick={handleCheckOut}
                    className="btn-primary bg-amber-500 hover:bg-amber-600 border-amber-500 flex-1 py-3 justify-center text-sm font-bold tracking-wide"
                  >
                    Confirm Departure Checkout
                  </button>
                )}

                <button
                  onClick={() => {
                    dispatch(clearScannedBooking());
                    setBookingInput('');
                    setSearchError('');
                  }}
                  className="btn-secondary py-3 text-sm px-6 font-semibold"
                >
                  Clear Screen
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;
