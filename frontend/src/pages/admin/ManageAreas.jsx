import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAreas, createArea, deleteArea, assignAreaGuide } from '../../features/parkingSlice';
import { FiMap, FiPlus, FiTrash, FiUserPlus, FiLayers, FiInfo } from 'react-icons/fi';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ManageAreas = () => {
  const dispatch = useDispatch();
  const { areas, loading } = useSelector((state) => state.parking);
  
  // Guides list for assign dropdown
  const [guides, setGuides] = useState([]);
  const { addToast } = useToast();
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [areaId, setAreaId] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [feePerHour, setFeePerHour] = useState(50);
  const [totalSlots, setTotalSlots] = useState(10);
  
  useEffect(() => {
    dispatch(fetchAreas());
    
    // Fetch guides list
    const fetchGuidesList = async () => {
      try {
        const res = await api.get('/admin/guides');
        if (res.data.success) {
          setGuides(res.data.guides);
        }
      } catch (err) {}
    };
    fetchGuidesList();
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !areaId || !address || !city) return;

    const areaData = {
      name,
      areaId: areaId.toUpperCase(),
      address,
      city,
      feePerHour: Number(feePerHour),
      totalSlots: Number(totalSlots),
      vehicleTypes: ['Car', 'Bike']
    };

    const res = await dispatch(createArea(areaData));
    if (res.meta.requestStatus === 'fulfilled') {
      addToast('Parking Area created successfully and slots automatically generated!', 'success');
      setShowAddForm(false);
      setName('');
      setAreaId('');
      setAddress('');
      setCity('');
    } else {
      addToast(res.payload || 'Failed to create', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: Deleting this parking area will delete ALL associated slots and active bookings. Proceed?')) return;
    dispatch(deleteArea(id));
  };

  const handleAssignGuide = async (areaId, guideId) => {
    const res = await dispatch(assignAreaGuide({ areaId, guideId }));
    if (res.meta.requestStatus === 'fulfilled') {
      addToast('Guide successfully assigned to area', 'success');
    } else {
      addToast(res.payload || 'Failed to assign', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Manage Parking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Configure parking lots, total slots, pricing, and assigned guides</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary py-2.5 text-sm"
        >
          <FiPlus /> Add Parking Area
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 flex flex-col gap-4 max-w-2xl">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">New Parking Lot</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Structure Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Kochi Airport Parking" className="glass-input py-2 text-sm bg-white/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Structure ID Code</label>
              <input type="text" value={areaId} onChange={(e) => setAreaId(e.target.value)} required placeholder="PK-KOCHI-01" className="glass-input py-2 text-sm bg-white/20 uppercase" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Kochi" className="glass-input py-2 text-sm bg-white/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Street Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Highway Junction, Nedumbassery" className="glass-input py-2 text-sm bg-white/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Rate per Hour (₹)</label>
              <input type="number" value={feePerHour} onChange={(e) => setFeePerHour(e.target.value)} required className="glass-input py-2 text-sm bg-white/20" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Slots capacity</label>
              <input type="number" value={totalSlots} onChange={(e) => setTotalSlots(e.target.value)} required className="glass-input py-2 text-sm bg-white/20" />
            </div>
          </div>

          <button type="submit" className="btn-primary py-2.5 text-sm self-start mt-2">
            Confirm & Initialize Area
          </button>
        </form>
      )}

      {/* Areas Table */}
      {loading ? (
        <div className="glass-card h-80 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 animate-pulse" />
      ) : areas.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 text-center text-slate-400 text-sm">
          No parking lots configured. Click "Add Parking Area" above to create one.
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-200/40 dark:border-zinc-800/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/20 dark:border-zinc-800/40 bg-slate-100/50 dark:bg-zinc-900/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Area ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Fee/Hr</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Assigned Guide</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10 dark:divide-zinc-800/30 text-slate-700 dark:text-slate-300 font-medium">
                {areas.map((area) => (
                  <tr key={area._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="p-4 font-bold text-blue-600 dark:text-blue-400">{area.areaId}</td>
                    <td className="p-4 font-bold dark:text-white">{area.name}</td>
                    <td className="p-4 max-w-xs truncate">{area.address}, {area.city}</td>
                    <td className="p-4">₹{area.feePerHour}</td>
                    <td className="p-4">{area.totalSlots} Slots</td>
                    <td className="p-4">
                      <select
                        value={area.assignedGuide?._id || area.assignedGuide || ''}
                        onChange={(e) => handleAssignGuide(area._id, e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded px-2.5 py-1 outline-none font-semibold text-xs text-blue-500"
                      >
                        <option value="">Unassigned</option>
                        {guides.map((g) => (
                          <option key={g._id} value={g._id}>{g.username}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(area._id)}
                        className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete Area"
                      >
                        <FiTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAreas;
