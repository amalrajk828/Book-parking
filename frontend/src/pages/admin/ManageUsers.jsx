import { FiUsers, FiLock, FiUnlock, FiSearch, FiEdit2, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  // Editing states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIsBlocked, setEditIsBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (id, username, isBlocked) => {
    if (!window.confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} user ${username}?`)) return;
    try {
      const res = await api.put(`/admin/users/${id}/block`);
      if (res.data.success) {
        addToast(res.data.message || 'Block status toggled successfully', 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditIsBlocked(user.isBlocked);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUsername || !editEmail || !editPhone) {
      addToast('Please fill out all required fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.patch(`/admin/user/${selectedUser._id}`, {
        username: editUsername,
        email: editEmail,
        phone: editPhone,
        isBlocked: editIsBlocked
      });

      if (res.data.success) {
        addToast('User details updated successfully!', 'success');
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user profile', 'error');
    }
    setIsSubmitting(false);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 relative">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Customer Database</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Inspect user accounts, review profile details, and enforce blocking controls</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100/50 dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Search name, email, phone..."
          />
        </div>
      </div>

      {loading ? (
        <div className="glass-card h-80 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 animate-pulse" />
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 text-center text-slate-400 text-sm">
          No matching customer records discovered in the system.
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-200/40 dark:border-zinc-800/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/20 dark:border-zinc-800/40 bg-slate-100/50 dark:bg-zinc-900/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10 dark:divide-zinc-800/30 text-slate-700 dark:text-slate-300 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase text-slate-600 dark:text-slate-300">
                          {u.username.substring(0, 2)}
                        </div>
                        <span className="font-bold dark:text-white">{u.username}</span>
                      </div>
                    </td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.phone}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        u.isBlocked 
                          ? 'bg-red-500/10 text-red-500' 
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/25 text-blue-500 hover:bg-blue-500/10 transition-all"
                        >
                          <FiEdit2 size={12} /> Edit Details
                        </button>
                        <button
                          onClick={() => handleToggleBlock(u._id, u.username, u.isBlocked)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            u.isBlocked
                              ? 'border-green-500/30 text-green-500 hover:bg-green-500/10'
                              : 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                          }`}
                        >
                          {u.isBlocked ? (
                            <><FiUnlock /> Unblock</>
                          ) : (
                            <><FiLock /> Block</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <form onSubmit={handleUpdateUser} className="glass-card max-w-md w-full rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 overflow-hidden shadow-xl flex flex-col bg-white dark:bg-zinc-950">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200/10 dark:border-zinc-800/30 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/20">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Edit Profile: {selectedUser.username}</h3>
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
                {isSubmitting ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default ManageUsers;
