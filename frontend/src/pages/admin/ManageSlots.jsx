import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAreas, fetchAreaDetails, clearSelectedArea } from '../../features/parkingSlice';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ManageSlots = () => {
  const dispatch = useDispatch();
  const { areas } = useSelector((state) => state.parking);
  const { selectedArea, slots, loading } = useSelector((state) => state.parking);
  
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    dispatch(fetchAreas());
    return () => {
      dispatch(clearSelectedArea());
    };
  }, [dispatch]);

  const handleAreaChange = (e) => {
    const val = e.target.value;
    setSelectedAreaId(val);
    if (val) {
      dispatch(fetchAreaDetails(val));
    } else {
      dispatch(clearSelectedArea());
    }
  };

  const handleStatusChange = async (slotId, newStatus) => {
    try {
      const res = await api.put(`/admin/slots/${slotId}`, { status: newStatus });
      if (res.data.success) {
        addToast('Slot status updated successfully!', 'success');
        if (selectedAreaId) {
          dispatch(fetchAreaDetails(selectedAreaId));
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update slot status', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Slot Monitoring</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Monitor real-time slot states, vehicle allocations, and force manual status overrides</p>
      </div>

      {/* Select Area Area Select Dropdown */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center gap-4 max-w-md">
        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase shrink-0">Select Parking Area</label>
        <select
          value={selectedAreaId}
          onChange={handleAreaChange}
          className="w-full glass-input py-2 text-sm bg-white/20"
        >
          <option value="">-- Choose Parking Lot --</option>
          {areas.map((a) => (
            <option key={a._id} value={a._id}>{a.name} ({a.areaId})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="glass-card h-80 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 animate-pulse" />
      ) : !selectedArea ? (
        <div className="glass-card p-12 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 text-center text-slate-400 text-sm">
          Please select a parking lot above to inspect and manage its slots.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot) => {
            let statusColor = 'border-green-500/30 text-green-500 bg-green-500/[0.02]';
            if (slot.status === 'reserved') statusColor = 'border-amber-500/30 text-amber-500 bg-amber-500/[0.02]';
            if (slot.status === 'occupied') statusColor = 'border-red-500/30 text-red-500 bg-red-500/[0.02]';
            if (slot.status === 'expired') statusColor = 'border-zinc-700 text-zinc-500 bg-zinc-800/[0.02]';

            return (
              <div
                key={slot._id}
                className={`
                  glass-card p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-sm
                  ${statusColor}
                `}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Slot ID</span>
                    <span className="font-extrabold text-lg text-slate-800 dark:text-white mt-0.5">{slot.slotId}</span>
                  </div>
                  <select
                    value={slot.status}
                    onChange={(e) => handleStatusChange(slot._id, e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded px-2 py-0.5 outline-none font-bold text-xs text-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="occupied">Occupied</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                {slot.status !== 'available' && slot.vehicleDetails?.number ? (
                  <div className="text-xs border-t border-slate-200/10 dark:border-zinc-800/30 pt-3 flex flex-col gap-1 text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Active Occupancy Details</span>
                    <p className="font-medium">Number: <span className="font-bold dark:text-white uppercase tracking-wide">{slot.vehicleDetails.number}</span></p>
                    <p className="font-medium">Owner: <span className="font-bold dark:text-white">{slot.vehicleDetails.owner}</span></p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-medium italic">
                    This slot is currently empty. Available for reservations.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageSlots;
