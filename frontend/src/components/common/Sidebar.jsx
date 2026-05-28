import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FiPieChart, FiMap, FiGrid, FiUsers, FiUserCheck, FiBookOpen, 
  FiClipboard, FiUser, FiActivity, FiX, FiShield 
} from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: <FiPieChart size={18} /> },
    { to: '/admin/areas', label: 'Manage Areas', icon: <FiMap size={18} /> },
    { to: '/admin/slots', label: 'Manage Slots', icon: <FiGrid size={18} /> },
    { to: '/admin/users', label: 'Manage Users', icon: <FiUsers size={18} /> },
    { to: '/admin/guides', label: 'Manage Guides', icon: <FiUserCheck size={18} /> },
    { to: '/admin/bookings', label: 'Manage Bookings', icon: <FiBookOpen size={18} /> },
    { to: '/admin/logs', label: 'Access Logs', icon: <FiClipboard size={18} /> },
  ];

  const guideLinks = [
    { to: '/guide', label: 'Guide Panel', icon: <FiActivity size={18} /> },
    { to: '/guide/scanner', label: 'Verify Ticket', icon: <FiGrid size={18} /> },
  ];

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiPieChart size={18} /> },
    { to: '/my-bookings', label: 'My Bookings', icon: <FiBookOpen size={18} /> },
    { to: '/profile', label: 'Profile', icon: <FiUser size={18} /> },
  ];

  const links = 
    user.role === 'admin' 
      ? adminLinks 
      : user.role === 'guide' 
      ? guideLinks 
      : userLinks;

  return (
    <>
      {/* Mobile Drawer Overlay with strict z-index */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* Drawer Menu Sidebar */}
      <aside className={`
        fixed md:sticky top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64
        border-r border-slate-200/40 dark:border-zinc-900/50 flex flex-col justify-between p-4.5
        overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0
        bg-white dark:bg-zinc-950 md:bg-white/60 md:dark:bg-zinc-950/60 md:backdrop-blur-md
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between md:hidden border-b border-slate-200/10 dark:border-zinc-800/30 pb-3">
            <span className="font-extrabold text-[10px] tracking-widest text-slate-400 uppercase">
              Control Panel
            </span>
            <button 
              onClick={toggleSidebar} 
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
                end
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-xs tracking-wider font-extrabold uppercase transition-all duration-200 active:scale-95
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <span className="shrink-0">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* User Badge Profile Summary card */}
        <div className="p-4 bg-slate-100/30 dark:bg-zinc-900/20 rounded-2xl border border-slate-200/20 dark:border-zinc-900/40 flex flex-col gap-1.5 mt-6 shrink-0 shadow-sm relative overflow-hidden bg-gradient-to-br from-white/30 to-slate-50/10 dark:from-zinc-950/20 dark:to-zinc-900/10">
          <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-blue-500/5 blur-xl pointer-events-none" />
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
            <FiShield size={10} className="text-blue-500" /> Logged In
          </span>
          <span className="font-bold text-sm text-slate-800 dark:text-white truncate">{user.username}</span>
          <span className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider block mt-0.5">
            {user.role} Authority
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
