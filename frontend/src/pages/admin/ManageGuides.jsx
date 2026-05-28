/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { FiPlus, FiAlertCircle, FiEdit2, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ManageGuides = () => {
  const [guides, setGuides] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { addToast } = useToast();

  // Add Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Editing states
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAssignedAreaId, setEditAssignedAreaId] = useState('');
  const [editIsBlocked, setEditIsBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/guides');
      if (res.data.success) {
        setGuides(res.data.guides);
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGuides();
    fetchAreas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !email || !phone || !password) {
      setError('Please enter all fields');
      addToast('Please enter all fields', 'warning');
      return;
    }

    try {
      const res = await api.post('/auth/create-guide', { username, email, phone, password });
      if (res.data.success) {
        addToast('Parking Guide created successfully!', 'success');
        setShowAddForm(false);
        setUsername('');
        setEmail('');
        setPhone('');
        setPassword('');
        fetchGuides();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Guide creation failed');
      addToast(err.response?.data?.message || 'Guide creation failed', 'error');
    }
  };

  const handleOpenEdit = (guide) => {
    setSelectedGuide(guide);
    setEditUsername(guide.username);
    setEditEmail(guide.email);
    setEditPhone(guide.phone);
    setEditAssignedAreaId(guide.assignedArea?._id || '');
    setEditIsBlocked(guide.isBlocked || false);
    setShowEditModal(true);
  };

  const handleUpdateGuide = async (e) => {
    e.preventDefault();
    if (!editUsername || !editEmail || !editPhone) {
      addToast('Please fill out all required fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.patch(`/admin/guide/${selectedGuide._id}`, {
        username: editUsername,
        email: editEmail,
        phone: editPhone,
        assignedArea: editAssignedAreaId || null,
        isBlocked: editIsBlocked
      });

      if (res.data.success) {
        addToast('Parking Guide updated successfully!', 'success');
        setShowEditModal(false);
        fetchGuides();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update guide profile', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Parking Guides</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Add field guides and oversee parking structure assignments</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary py-2.5 text-sm"
        >
          <FiPlus /> Add New Guide
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 flex flex-col gap-4 max-w-md">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">New Guide Profile</h3>
          
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
              <FiAlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Officer Mark" className="glass-input py-2 text-sm bg-white/20" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="mark@parksmart.com" className="glass-input py-2 text-sm bg-white/20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" className="glass-input py-2 text-sm bg-white/20" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="glass-input py-2 text-sm bg-white/20" />
            </div>
          </div>

          <button type="submit" className="btn-primary py-2.5 text-sm self-start mt-2">
            Register Guide
          </button>
        </form>
      )}

      {/* Guides list */}
      {loading ? (
        <div className="glass-card h-80 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 animate-pulse" />
      ) : guides.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 text-center text-slate-400 text-sm">
          No parking guides created. Click "Add New Guide" to configure a gate officer.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((g) => (
            <div key={g._id} className="glass-card p-6 rounded-2xl border border-slate-200/40 dark:border-zinc-800/40 flex flex-col gap-4 shadow-sm hover:translate-y-[-2px] transition-all bg-white dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm uppercase">
                    {g.username.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-white">{g.username}</h3>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase mt-0.5 tracking-wider block">Field Guide</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    g.isBlocked ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                  }`}>
                    {g.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200/10 dark:border-zinc-800/30 pt-4 flex flex-col gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Email</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{g.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Phone</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{g.phone}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/10 dark:border-zinc-800/30 pt-3 mt-1 pb-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Assigned Area</span>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold max-w-[150px] truncate">
                    {g.assignedArea?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Card Action footer */}
              <div className="flex justify-end pt-3 border-t border-slate-200/10 dark:border-zinc-800/30 mt-1">
                <button
                  onClick={() => handleOpenEdit(g)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-all w-full justify-center"
                >
                  <FiEdit2 size={11} /> Override Assignment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Guide Modal */}
      {showEditModal && selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <form onSubmit={handleUpdateGuide} className="glass-card max-w-md w-full rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 overflow-hidden shadow-xl flex flex-col bg-white dark:bg-zinc-950">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200/10 dark:border-zinc-800/30 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/20">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Edit Guide: {selectedGuide.username}</h3>
              <button 
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase">Username</label>
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={(e) => setEditUsername(e.target.value)} 
                  required 
                  className="glass-input py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  required 
                  className="glass-input py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase">Phone Number</label>
                <input 
                  type="text" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                  required 
                  className="glass-input py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase">Structure Lot Assignment</label>
                <select
                  value={editAssignedAreaId}
                  onChange={(e) => setEditAssignedAreaId(e.target.value)}
                  className="glass-input py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-semibold text-blue-500"
                >
                  <option value="">-- No Lot Assigned --</option>
                  {areas.map((a) => (
                    <option key={a._id} value={a._id}>{a.name} ({a.areaId})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase">Account Status</label>
                <select
                  value={editIsBlocked ? 'true' : 'false'}
                  onChange={(e) => setEditIsBlocked(e.target.value === 'true')}
                  className="glass-input py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold text-blue-500"
                >
                  <option value="false">Active / Unblocked</option>
                  <option value="true">Blocked</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/10 border-t border-slate-200/10 dark:border-zinc-800/30 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-2 px-5 text-xs font-bold"
              >
                {isSubmitting ? 'Saving...' : 'Save Guide Details'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default ManageGuides;
