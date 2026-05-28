import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { FiDollarSign, FiUsers, FiBookOpen, FiMapPin, FiCpu, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { stats, charts } = data;
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#71717a'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 85, damping: 15 } }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 90, damping: 14 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 p-4 md:p-8 relative font-semibold text-xs text-slate-500 dark:text-slate-400"
    >
      <div className="absolute top-20 left-1/3 w-80 h-80 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">Analytics Overview</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-semibold leading-relaxed">Consolidated real-time operational revenue, peak occupancy matrices, and slot capacities</p>
      </motion.div>

      {/* Grid of aggregated cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-semibold">
        
        {/* Total Revenue */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2 }}
          className="premium-card p-6 flex items-center gap-4 bg-white dark:bg-zinc-950 bg-gradient-to-br from-white to-slate-50/10 dark:from-zinc-950 dark:to-zinc-900/10"
        >
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/10">
            <FiDollarSign size={24} />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Revenue</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight">₹{stats.totalRevenue}</span>
          </div>
        </motion.div>

        {/* Total Customers */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2 }}
          className="premium-card p-6 flex items-center gap-4 bg-white dark:bg-zinc-950 bg-gradient-to-br from-white to-slate-50/10 dark:from-zinc-950 dark:to-zinc-900/10"
        >
          <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/10">
            <FiUsers size={24} />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Customers</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight">{stats.totalUsers}</span>
          </div>
        </motion.div>

        {/* Bookings Managed */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2 }}
          className="premium-card p-6 flex items-center gap-4 bg-white dark:bg-zinc-950 bg-gradient-to-br from-white to-slate-50/10 dark:from-zinc-950 dark:to-zinc-900/10"
        >
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/10">
            <FiBookOpen size={24} />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Bookings Managed</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight">{stats.totalBookings}</span>
          </div>
        </motion.div>

        {/* Parking Areas */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2 }}
          className="premium-card p-6 flex items-center gap-4 bg-white dark:bg-zinc-950 bg-gradient-to-br from-white to-slate-50/10 dark:from-zinc-950 dark:to-zinc-900/10"
        >
          <div className="p-3.5 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400 shadow-sm border border-purple-500/10">
            <FiMapPin size={24} />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Parking Areas</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight">{stats.activeAreas}</span>
          </div>
        </motion.div>

      </motion.div>

      {/* Analytics Charts Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-extrabold text-slate-700 dark:text-slate-300">
        
        {/* Daily Revenue AreaChart */}
        <motion.div variants={itemVariants} className="premium-card p-6 bg-white dark:bg-zinc-950/80">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-5 flex items-center gap-2 uppercase tracking-wider font-sans">
            <FiTrendingUp className="text-emerald-500" /> Daily Revenue (Past 7 Days)
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.dailyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.12} />
                <XAxis dataKey="date" stroke="#71717a" tickLine={false} />
                <YAxis stroke="#71717a" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Peak Hours Bookings LineChart */}
        <motion.div variants={itemVariants} className="premium-card p-6 bg-white dark:bg-zinc-950/80">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-5 flex items-center gap-2 uppercase tracking-wider font-sans">
            <FiCpu className="text-blue-500" /> Peak Hour Booking Analysis
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.peakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.12} />
                <XAxis dataKey="hour" stroke="#71717a" tickLine={false} />
                <YAxis stroke="#71717a" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 1.5, fill: '#18181b' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Slot Occupancy Distributions PieChart */}
        <motion.div variants={itemVariants} className="premium-card p-6 bg-white dark:bg-zinc-950/80">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-5 uppercase tracking-wider font-sans">Structure Slots Allocation</h3>
          <div className="h-72 w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-wider">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Revenue BarChart */}
        <motion.div variants={itemVariants} className="premium-card p-6 bg-white dark:bg-zinc-950/80">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-5 uppercase tracking-wider font-sans">Monthly Revenues Log</h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.12} />
                <XAxis dataKey="month" stroke="#71717a" tickLine={false} />
                <YAxis stroke="#71717a" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
