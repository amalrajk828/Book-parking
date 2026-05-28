import React from 'react';
import { FiCpu, FiTrendingUp, FiShield, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto px-4 py-16 relative font-semibold text-xs text-slate-500 dark:text-slate-400"
    >
      {/* Decorative Blob Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2.5s' }} />

      {/* Hero Header */}
      <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest text-[9px] mb-4 border border-blue-500/10">
          Smart City Infrastructure
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white font-sans tracking-tight leading-tight">
          Next-Generation{' '}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Smart Parking
          </span>
        </h1>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold max-w-2xl mx-auto">
          ParkSmart resolves urban congestion and parking frustrations by connecting smart sensor matrices directly to premium user dashboards. We coordinate gate officers, slot reservations, and automated payments seamlessly.
        </p>
      </motion.div>

      {/* Vision & Core Pillars Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {[
          {
            icon: <FiCpu className="text-blue-500" size={24} />,
            title: 'IoT Sensor Integration',
            desc: 'Our platform processes live signals from simulated IoT slot occupancy meters, mapping real-time free/reserved states directly onto your device screen without any lag.'
          },
          {
            icon: <FiTrendingUp className="text-indigo-500" size={24} />,
            title: 'Optimized Urban Mobility',
            desc: 'By letting drivers search and pre-book parking spots, we eliminate cruising times, reduce local traffic congestion, and slash fuel waste and local carbon emissions.'
          },
          {
            icon: <FiShield className="text-purple-500" size={24} />,
            title: 'QR Gate Verification',
            desc: 'Security is paramount. Receive instant scannable high-fidelity ticket codes, verified securely at checkpoints by gate officers in single-scan check-ins.'
          },
          {
            icon: <FiUsers className="text-cyan-500" size={24} />,
            title: 'Unified Dashboard Hub',
            desc: 'A robust ecosystem bridging regular drivers, gate guides, and structure managers with analytics metrics, daily revenue charts, and audit trail logs.'
          }
        ].map((pillar, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className="premium-card p-8 bg-white dark:bg-zinc-950/80 border border-slate-200/40 dark:hover:border-blue-500/20 rounded-3xl flex items-start gap-5 shadow-sm"
          >
            <div className="p-3.5 bg-slate-100 dark:bg-zinc-900/60 rounded-2xl shrink-0">
              {pillar.icon}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white font-sans tracking-wide">{pillar.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-semibold">{pillar.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Structured Mission Card */}
      <motion.div
        variants={itemVariants}
        className="premium-card p-8 md:p-10 rounded-3xl text-center bg-gradient-to-br from-white to-slate-50/30 dark:from-zinc-950 dark:to-zinc-900/40 border border-slate-200/50 dark:border-zinc-800/40 relative overflow-hidden shadow-sm"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl pointer-events-none" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight mb-4">Our Ultimate Mission</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold max-w-3xl mx-auto">
          "To provide Frictionless Smart City Infrastructure. We believe that urban parking shouldn't be a search puzzle. Through smart engineering, modular MERN architecture, and premium user-centric aesthetics, we make parking spaces completely interactive, transparent, and effortlessly accessible to everyone."
        </p>
      </motion.div>
    </motion.div>
  );
};

export default About;
