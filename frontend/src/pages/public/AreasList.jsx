import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAreas } from '../../features/parkingSlice';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiSearch, FiSliders, FiCpu, FiGrid } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AreasList = () => {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const dispatch = useDispatch();
  const { areas, loading } = useSelector((state) => state.parking);

  useEffect(() => {
    dispatch(fetchAreas({ search, city, vehicleType }));
  }, [dispatch, search, city, vehicleType]);

  const handleClearFilters = () => {
    setSearch('');
    setCity('');
    setVehicleType('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 70, damping: 14 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 85, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative"
    >
      {/* Decorative Blob Glow */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none rounded-full animate-float" />

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">Parking Structures</h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            Discover active parking structures, maps, check-in gates, and check live slot allocations.
          </p>
        </div>
      </motion.div>

      {/* Filter Toolbar with glassmorphism */}
      <motion.div 
        variants={itemVariants} 
        className="glass-card p-5 rounded-3xl border border-slate-200/50 dark:border-zinc-900/50 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-semibold"
      >
        {/* Search Input */}
        <div className="relative text-xs">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100/30 dark:bg-zinc-950/20 border border-slate-200/60 dark:border-zinc-900 rounded-xl text-xs outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
            placeholder="Search structure name, ID..."
          />
        </div>

        {/* City Filter */}
        <div className="relative text-xs">
          <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100/30 dark:bg-zinc-950/20 border border-slate-200/60 dark:border-zinc-900 rounded-xl text-xs outline-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none font-bold"
          >
            <option value="">All Cities</option>
            <option value="Kochi">Kochi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chennai">Chennai</option>
          </select>
        </div>

        {/* Vehicle Filter */}
        <div className="relative text-xs">
          <FiSliders className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100/30 dark:bg-zinc-950/20 border border-slate-200/60 dark:border-zinc-900 rounded-xl text-xs outline-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none font-bold"
          >
            <option value="">All Vehicles</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Truck">Truck</option>
          </select>
        </div>

        {/* Clear Trigger */}
        <button
          onClick={handleClearFilters}
          className="btn-secondary py-2.5 text-xs uppercase tracking-wider font-extrabold justify-center"
        >
          Reset Filters
        </button>
      </motion.div>

      {/* Areas List Grid (Visual structures blocks) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="premium-card h-80 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : areas.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16 premium-card rounded-3xl bg-white dark:bg-zinc-950 flex flex-col items-center justify-center gap-3">
          <FiGrid size={32} className="text-blue-500" />
          <span className="text-slate-400 text-xs font-semibold leading-relaxed max-w-sm">No active parking structures match your filter preferences. Please try again with different inputs.</span>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {areas.map((area) => {
            const occupancyRate = ((area.totalSlots - area.availableSlots) / area.totalSlots) * 100;
            return (
              <motion.div 
                key={area._id}
                variants={cardVariants}
                whileHover={{ y: -3, scale: 1.005 }}
                className="premium-card rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm bg-white dark:bg-zinc-950 font-semibold text-xs text-slate-500 dark:text-slate-400"
              >
                <div>
                  {/* Casing Gradient Header block */}
                  <div className="h-44 bg-gradient-to-br from-slate-900 via-zinc-900 to-zinc-950 relative flex items-center justify-center border-b border-slate-200/10 dark:border-zinc-900/40">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:10px_20px] pointer-events-none opacity-80" />
                    {area.image ? (
                      <img src={area.image} alt={area.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="text-center flex flex-col items-center gap-2">
                        <FiCpu className="text-blue-500 animate-glow" size={30} />
                        <span className="font-extrabold tracking-widest text-lg text-white font-sans">{area.areaId}</span>
                      </div>
                    )}
                    <span className="absolute top-3.5 right-3.5 text-[9px] font-black bg-blue-600/90 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {area.city}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-extrabold text-lg text-slate-800 dark:text-white truncate font-sans tracking-wide">{area.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5 font-bold">
                      <FiMapPin className="text-blue-500" size={13} /> {area.address}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200/10 dark:border-zinc-900/30 pt-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <FiClock className="text-slate-400" />
                        <span>{area.openingTime} - {area.closingTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-extrabold text-blue-600 dark:text-blue-400">
                        <FiDollarSign />
                        <span>₹{area.feePerHour}/hr</span>
                      </div>
                    </div>

                    {/* Progress occupancy bar */}
                    <div className="mt-5 flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">Slot Occupancy</span>
                        <span className={area.availableSlots === 0 ? 'text-red-500 font-extrabold' : 'text-slate-400 font-bold'}>
                          {area.availableSlots} / {area.totalSlots} Slots Free
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-slate-200/10 dark:border-zinc-800/10">
                        <div 
                          style={{ width: `${occupancyRate}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 60 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link 
                    to={`/explore/${area._id}`} 
                    className="btn-primary w-full text-xs justify-center py-3 font-extrabold uppercase tracking-wider shadow-md"
                  >
                    View Slots & Book
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AreasList;
