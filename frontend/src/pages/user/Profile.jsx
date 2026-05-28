import { useSelector } from 'react-redux';
import { FiMail, FiPhone, FiCheckCircle } from 'react-icons/fi';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass-card p-8 rounded-3xl border border-slate-200/40 dark:border-zinc-800/40 shadow-glass-light dark:shadow-glass">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center font-extrabold text-2xl text-white shadow-lg uppercase">
            {user?.username?.substring(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{user?.username}</h1>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-extrabold uppercase mt-1 tracking-wider block">
              {user?.role} Officer
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-slate-200/20 dark:border-zinc-800/30 pt-6">
          <div className="flex items-center gap-3.5 text-sm">
            <FiMail className="text-slate-400 shrink-0" size={18} />
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Email Address</span>
              <span className="font-semibold text-slate-800 dark:text-white mt-0.5">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-sm">
            <FiPhone className="text-slate-400 shrink-0" size={18} />
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Phone Number</span>
              <span className="font-semibold text-slate-800 dark:text-white mt-0.5">{user?.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-sm">
            <FiCheckCircle className="text-slate-400 shrink-0" size={18} />
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Account Status</span>
              <span className="font-extrabold text-green-500 mt-0.5">Active & Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
