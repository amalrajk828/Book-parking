import React, { useEffect, useState } from 'react';
import { 
  FiBookOpen, FiSearch, FiSliders, FiClock, FiDollarSign, 
  FiMapPin, FiGrid, FiUser, FiInfo, FiEdit2, FiRotateCcw, FiCheck, FiX, FiAlertTriangle 
} from 'react-icons/fi';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { addToast } = useToast();

  // Editing modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form states
  const [editBookingId, setEditBookingId] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editVehicleType, setEditVehicleType] = useState('Car');
  const [editVehicleNumber, setEditVehicleNumber] = useState('');
  const [editVehicleOwner, setEditVehicleOwner] = useState('');
  const [editCheckInTime, setEditCheckInTime] = useState('');
  const [editCheckOutTime, setEditCheckOutTime] = useState('');

  // Slot reassignment states
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  const [editExtraCharge, setEditExtraCharge] = useState(0);
  const [editExtraMinutes, setEditExtraMinutes] = useState(0);
  const [editOvertimeStatus, setEditOvertimeStatus] = useState('none');
  const [editFinalAmount, setEditFinalAmount] = useState(0);

  const handleWaiveFee = () => {
    setEditExtraCharge(0);
    setEditExtraMinutes(0);
    setEditOvertimeStatus('waived');
    if (selectedBooking) {
      setEditFinalAmount(selectedBooking.estimatedAmount);
    }
  };

  const handleExtraChargeChange = (value) => {
    const charge = Number(value) || 0;
    setEditExtraCharge(charge);
    if (selectedBooking) {
      setEditFinalAmount(selectedBooking.estimatedAmount + charge);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
    setLoading(false);
  };

  const fetchAreas = async () => {
    try {
      const res = await api.get('/areas');
      if (res.data.success) {
        setAreas(res.data.areas);
      }
    } catch (err) {
      console.error('Error fetching areas:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchAreas();
  }, []);

  // Fetch slots when selected area changes in the edit modal
  useEffect(() => {
    const fetchAreaSlots = async () => {
      if (!selectedAreaId) {
        setSlots([]);
        return;
      }
      try {
        const res = await api.get(`/areas/${selectedAreaId}`);
        if (res.data.success) {
          // Keep all slots, filter out occupied/reserved except the one currently assigned to this booking
          const allSlots = res.data.slots || [];
          setSlots(allSlots);
        }
      } catch (err) {
        console.error('Error fetching area slots:', err);
      }
    };
    fetchAreaSlots();
  }, [selectedAreaId]);

  const handleOpenEdit = (booking) => {
    setSelectedBooking(booking);
    setEditBookingId(booking.bookingId);
    setEditStatus(booking.status);
    setEditPaymentStatus(booking.paymentStatus || 'pending');
    setEditVehicleType(booking.vehicleDetails?.type || 'Car');
    setEditVehicleNumber(booking.vehicleDetails?.number || '');
    setEditVehicleOwner(booking.vehicleDetails?.owner || '');
    setEditCheckInTime(booking.checkInTime ? new Date(booking.checkInTime).toISOString().slice(0, 16) : '');
    setEditCheckOutTime(booking.checkOutTime ? new Date(booking.checkOutTime).toISOString().slice(0, 16) : '');
    
    setEditExtraCharge(booking.extraCharge || booking.extraCharges || 0);
    setEditExtraMinutes(booking.extraMinutes || 0);
    setEditOvertimeStatus(booking.overtimeStatus || 'none');
    setEditFinalAmount(booking.finalAmount || booking.actualAmount || booking.estimatedAmount);

    setSelectedAreaId(booking.area?._id || '');
    setSelectedSlotId(booking.slot?._id || '');
    setShowEditModal(true);
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!editBookingId || !editVehicleNumber || !editVehicleOwner) {
      addToast('Please fill out all required fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        bookingId: editBookingId,
        status: editStatus,
        paymentStatus: editPaymentStatus,
        vehicleDetails: {
          type: editVehicleType,
          number: editVehicleNumber,
          owner: editVehicleOwner,
        },
        slot: selectedSlotId,
        checkInTime: editCheckInTime || null,
        checkOutTime: editCheckOutTime || null,
        extraCharge: Number(editExtraCharge),
        extraMinutes: Number(editExtraMinutes),
        overtimeStatus: editOvertimeStatus,
        finalAmount: Number(editFinalAmount),
      };

      const res = await api.patch(`/admin/booking/${selectedBooking._id}/status`, payload);
      if (res.data.success) {
        addToast(res.data.message || 'Booking updated successfully', 'success');
        setShowEditModal(false);
        fetchBookings();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
    setIsSubmitting(false);
  };

  const handleQuickRecover = async (bookingId, targetStatus) => {
    const statusLabel = targetStatus === 'checked-in' ? 'Checked In (Revert Checkout)' : 'Active Confirmed (Revert Check-in)';
    if (!window.confirm(`Are you sure you want to recover this reservation back to ${statusLabel}?`)) return;

    try {
      const res = await api.patch(`/admin/booking/${bookingId}/recover`, { targetStatus });
      if (res.data.success) {
        addToast(res.data.message || 'Booking recovered successfully', 'success');
        setShowEditModal(false);
        fetchBookings();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Recovery failed', 'error');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.username.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicleDetails?.number.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === '' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    let badgeStyle = 'bg-blue-500/10 text-blue-500 border border-blue-500/30';
    if (status === 'checked-in') {
      badgeStyle = 'bg-green-500/10 text-green-500 border border-green-500/30';
    } else if (status === 'checked-out') {
      badgeStyle = 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-400 border border-slate-200 dark:border-zinc-800';
    } else if (status === 'expired') {
      badgeStyle = 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
    } else if (status === 'cancelled') {
      badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/30';
    } else if (status === 'pending') {
      badgeStyle = 'bg-zinc-500/15 text-slate-500 border border-slate-500/30';
    }
    return (
      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeStyle}`}>
        {status === 'checked-out' ? 'Completed' : status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Reservation Control Panel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Full administrative overrides, slot reassignments, billing recalculations, and checkout recovery</p>
        </div>

        {/* Filters and search */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:flex-initial sm:min-w-[240px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/50 dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Search ID, customer, plate..."
            />
          </div>

          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-100/50 dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm outline-none text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Completed</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="glass-card h-80 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 animate-pulse" />
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 text-center text-slate-400 text-sm">
          No bookings discovered matching the select filter options.
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-200/40 dark:border-zinc-800/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto font-medium">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/20 dark:border-zinc-800/40 bg-slate-100/50 dark:bg-zinc-900/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Ticket ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Location & Slot</th>
                  <th className="p-4">Vehicle Plate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Paid Total</th>
                  <th className="p-4">Control Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10 dark:divide-zinc-800/30 text-slate-700 dark:text-slate-300">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="p-4 font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
                      {b.bookingId}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold dark:text-white">{b.user?.username || 'Unassigned'}</span>
                        <span className="text-[10px] text-slate-400 lowercase">{b.user?.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold dark:text-white truncate max-w-[150px]">{b.area?.name || 'Smart Lot'}</span>
                        <span className="text-[10px] text-blue-500 font-extrabold uppercase">Slot {b.slot?.slotId || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold dark:text-white uppercase tracking-wider">{b.vehicleDetails?.number}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{b.vehicleDetails?.type}</span>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(b.status)}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      ₹{b.actualAmount || b.estimatedAmount}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-all"
                      >
                        <FiEdit2 size={12} /> Override stays
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit & Recovery overrides Dialog Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="glass-card max-w-2xl w-full rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 overflow-hidden shadow-xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-950">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200/10 dark:border-zinc-800/30 flex justify-between items-center bg-slate-50/80 dark:bg-zinc-900/40">
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Override Ticket: {selectedBooking.bookingId}</h3>
                <p className="text-xs text-slate-400 mt-1">Directly modify reservation schemas, edit timestamps, or trigger recovery procedures</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleUpdateBooking} className="p-6 overflow-y-auto flex flex-col gap-6 text-sm font-semibold">
              
              {/* ACCIDENTAL MISTAKE RECOVERY PANEL (Alert bar block) */}
              {(selectedBooking.status === 'checked-out' || selectedBooking.status === 'checked-in') && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <FiAlertTriangle className="shrink-0 mt-0.5" size={18} />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold text-xs uppercase tracking-wider">Guide Mistake Quick Recovery Panel</span>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedBooking.status === 'checked-out' 
                          ? 'This reservation is marked as Completed (Checked-Out). If the checkout was recorded accidentally, you can safely revert this action. This will clear checkoutTime, restore the vehicle stay to occupied, and decrement slot availability counts.'
                          : 'This reservation is currently Checked-In. If this arrival check-in was registered by mistake, you can revert it back to active confirmed state.'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-1">
                    {selectedBooking.status === 'checked-out' && (
                      <button
                        type="button"
                        onClick={() => handleQuickRecover(selectedBooking._id, 'checked-in')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm"
                      >
                        <FiRotateCcw size={12} /> Revert Check-out Mistake
                      </button>
                    )}
                    {selectedBooking.status === 'checked-in' && (
                      <button
                        type="button"
                        onClick={() => handleQuickRecover(selectedBooking._id, 'confirmed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm"
                      >
                        <FiRotateCcw size={12} /> Revert Check-in Mistake
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Booking ID */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Ticket Code ID</label>
                  <input
                    type="text"
                    value={editBookingId}
                    onChange={(e) => setEditBookingId(e.target.value)}
                    required
                    className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl"
                  />
                </div>

                {/* Booking Status dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Reservation Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-semibold text-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed (Active)</option>
                    <option value="checked-in">Checked In</option>
                    <option value="checked-out">Completed</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Payment Status dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Payment ledger Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-semibold text-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {/* Vehicle Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Vehicle Casing Type</label>
                  <select
                    value={editVehicleType}
                    onChange={(e) => setEditVehicleType(e.target.value)}
                    className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>

                {/* Vehicle Plate number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Vehicle Plate Number</label>
                  <input
                    type="text"
                    value={editVehicleNumber}
                    onChange={(e) => setEditVehicleNumber(e.target.value)}
                    required
                    className="glass-input py-2 uppercase tracking-wide bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl"
                  />
                </div>

                {/* Owner Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Registered Driver</label>
                  <input
                    type="text"
                    value={editVehicleOwner}
                    onChange={(e) => setEditVehicleOwner(e.target.value)}
                    required
                    className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl"
                  />
                </div>

                {/* Check In Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Gate Check-In Timestamp</label>
                  <input
                    type="datetime-local"
                    value={editCheckInTime}
                    onChange={(e) => setEditCheckInTime(e.target.value)}
                    className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold"
                  />
                </div>

                {/* Check Out Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Gate Check-Out Timestamp</label>
                  <input
                    type="datetime-local"
                    value={editCheckOutTime}
                    onChange={(e) => setEditCheckOutTime(e.target.value)}
                    className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold"
                  />
                </div>

              </div>

              {/* Overtime Billing Overrides & Fees Waiver */}
              <div className="border-t border-slate-200/10 dark:border-zinc-800/30 pt-5 mt-2 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Overtime Billing & Fees Waiver</span>
                  <button
                    type="button"
                    onClick={handleWaiveFee}
                    className="flex items-center gap-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    Waive Overtime Fee
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Extra Minutes</label>
                    <input
                      type="number"
                      value={editExtraMinutes}
                      onChange={(e) => setEditExtraMinutes(Number(e.target.value))}
                      className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Extra Charge (₹)</label>
                    <input
                      type="number"
                      value={editExtraCharge}
                      onChange={(e) => handleExtraChargeChange(e.target.value)}
                      className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold text-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Overtime Status</label>
                    <select
                      value={editOvertimeStatus}
                      onChange={(e) => setEditOvertimeStatus(e.target.value)}
                      className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-semibold text-blue-500"
                    >
                      <option value="none">None</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="waived">Waived</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Final Total (₹)</label>
                    <input
                      type="number"
                      value={editFinalAmount}
                      onChange={(e) => setEditFinalAmount(Number(e.target.value))}
                      className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-black text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Slot Reassignment Sub-Panel */}
              <div className="border-t border-slate-200/10 dark:border-zinc-800/30 pt-5 mt-2 flex flex-col gap-4">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Reassign Parking Space</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Select Area */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400">Target Structure Area</label>
                    <select
                      value={selectedAreaId}
                      onChange={(e) => setSelectedAreaId(e.target.value)}
                      className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl"
                    >
                      <option value="">-- Unassigned Area --</option>
                      {areas.map((a) => (
                        <option key={a._id} value={a._id}>{a.name} ({a.areaId})</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Slot */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400">Target Allocation Space Slot</label>
                    <select
                      value={selectedSlotId}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                      className="glass-input py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold text-blue-500"
                    >
                      <option value="">-- No Slot Selected --</option>
                      {slots.map((s) => {
                        const isCurrentSlot = s._id === selectedBooking.slot?._id;
                        return (
                          <option 
                            key={s._id} 
                            value={s._id} 
                            disabled={s.status !== 'available' && !isCurrentSlot}
                          >
                            {s.slotId} ({s.status === 'available' ? 'Available' : isCurrentSlot ? 'Current Allocation' : s.status})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="border-t border-slate-200/10 dark:border-zinc-800/30 pt-5 mt-3 flex justify-end gap-3 bg-slate-50/50 dark:bg-zinc-900/10 p-4 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition-colors"
                >
                  Close overrides
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary py-2 px-5 text-xs justify-center font-bold"
                >
                  {isSubmitting ? 'Syncing...' : 'Save Parameters Overrides'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBookings;
