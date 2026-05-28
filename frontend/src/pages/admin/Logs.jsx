/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { FiClock, FiActivity, FiShield } from 'react-icons/fi';
import api from '../../utils/api';

const Logs = () => {
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' or 'admin'
  const [guideLogs, setGuideLogs] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGuideLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs');
      if (res.data.success) {
        setGuideLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Error fetching guide logs:', err);
    }
    setLoading(false);
  };

  const fetchAdminLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/activity-logs');
      if (res.data.success) {
        setAdminLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Error fetching admin logs:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'guide') {
      fetchGuideLogs();
    } else {
      fetchAdminLogs();
    }
  }, [activeTab]);

  const formatMixedValue = (val) => {
    if (!val) return 'None';
    if (typeof val === 'object') {
      // If it has specific fields we know
      if (val.number) return `Plate: ${val.number.toUpperCase()} (${val.type})`;
      return JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Access & Audit Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Full audit trail of customer gate check-ins, check-outs, and super-admin data overrides</p>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex bg-slate-100 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-zinc-800/40 p-1 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FiActivity size={14} /> Guide Session Logs
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FiShield size={14} /> Admin Audit Trails
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card h-80 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 animate-pulse" />
      ) : activeTab === 'guide' ? (
        // Guide check-in / check-out session logs table
        guideLogs.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 text-center text-slate-400 text-sm">
            No check-in logs found. Simulate gate entry on a user ticket to create one.
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-200/40 dark:border-zinc-800/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200/20 dark:border-zinc-800/40 bg-slate-100/50 dark:bg-zinc-900/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Ticket</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Parking Lot</th>
                    <th className="p-4">Slot</th>
                    <th className="p-4">Check-In Time</th>
                    <th className="p-4">Check-Out Time</th>
                    <th className="p-4">Overtime Charges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/10 dark:divide-zinc-800/30 text-slate-700 dark:text-slate-300 font-medium">
                  {guideLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{log.bookingId}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold dark:text-white">{log.user?.username}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">{log.vehicleDetails?.number}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold dark:text-white truncate max-w-[150px]">{log.area?.name}</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">{log.slot?.slotId || 'N/A'}</td>
                      <td className="p-4 text-xs font-semibold">{new Date(log.checkInTime).toLocaleString()}</td>
                      <td className="p-4 text-xs font-semibold">
                        {log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : (
                          <span className="text-green-500 font-extrabold uppercase text-[10px] tracking-wider">Parked</span>
                        )}
                      </td>
                      <td className="p-4">
                        {log.extraCharges > 0 ? (
                          <span className="font-extrabold text-red-500">₹{log.extraCharges}</span>
                        ) : (
                          <span className="text-slate-400 font-bold">₹0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        // Admin Audit Trails List Timeline
        adminLogs.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 text-center text-slate-400 text-sm">
            No administrative overrides logged yet. Any manual updates will show up here.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {adminLogs.map((log) => (
              <div 
                key={log._id} 
                className="glass-card p-6 rounded-2xl border border-slate-200/40 dark:border-zinc-800/40 flex flex-col gap-4 shadow-sm bg-white dark:bg-zinc-950 hover:translate-y-[-1px] transition-all"
              >
                {/* Audit log Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/10 dark:border-zinc-800/30 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                      <FiShield size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-500 font-extrabold uppercase tracking-wider block">Administrative Override</span>
                      <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mt-0.5">{log.action}</h3>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <FiClock /> {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Audit details metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-zinc-900/10 p-3 rounded-xl border border-slate-200/10 dark:border-zinc-800/20">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Admin Officer</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{log.adminName}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Admin Email</span>
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{log.admin?.email || 'System'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Target Type</span>
                    <span className="text-blue-500 uppercase font-extrabold">{log.targetType}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Target Entity ID</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[120px]" title={log.targetId}>
                      {log.targetId}
                    </span>
                  </div>
                </div>

                {/* Values Diffs Blocks (Previous vs. New values) */}
                {log.previousValues && log.newValues && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Previous Values */}
                    <div className="p-3 bg-red-500/[0.02] border border-red-500/15 rounded-xl flex flex-col gap-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-red-500">Previous Values</span>
                      <div className="flex flex-col gap-1 text-slate-500 dark:text-slate-400 font-medium">
                        {Object.keys(log.previousValues).map((key) => (
                          <div key={key} className="flex justify-between border-b border-dashed border-slate-200/5 dark:border-zinc-800/10 pb-0.5">
                            <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px]">{key}</span>
                            <span className="truncate max-w-[200px]" title={String(log.previousValues[key])}>
                              {formatMixedValue(log.previousValues[key])}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* New Values */}
                    <div className="p-3 bg-green-500/[0.02] border border-green-500/15 rounded-xl flex flex-col gap-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-green-500">Updated Values</span>
                      <div className="flex flex-col gap-1 text-slate-500 dark:text-slate-400 font-medium">
                        {Object.keys(log.newValues).map((key) => (
                          <div key={key} className="flex justify-between border-b border-dashed border-slate-200/5 dark:border-zinc-800/10 pb-0.5">
                            <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px]">{key}</span>
                            <span className="font-semibold text-green-500 truncate max-w-[200px]" title={String(log.newValues[key])}>
                              {formatMixedValue(log.newValues[key])}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Logs;
