import { Link } from 'react-router-dom';
import { FiMapPin, FiCpu, FiTrendingUp, FiShield, FiArrowRight, FiGithub, FiTwitter, FiMail, FiPhoneCall } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  const cardVariants = {
    hidden: { y: 35, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 70, damping: 14 }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      
      {/* Background Neon Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2.5s' }} />

      {/* Grid Pattern Backdrop Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-80" />

      {/* Hero Section Container */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 flex-grow flex flex-col items-center justify-center text-center relative z-10"
      >
        
        {/* Neon Indicator Badge */}
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-slate-200/50 dark:border-zinc-800/40 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-8 shadow-sm hover:scale-[1.02] transition-transform duration-200"
        >
          <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
          Next-Gen IoT Parking booking Platform
        </motion.div>

        {/* Dynamic Typography Title */}
        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight font-sans"
        >
          Find, Reserve, and Manage{' '}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Parking Slots
          </span>{' '}
          in Real-Time
        </motion.h1>

        {/* Headline Description */}
        <motion.p 
          variants={itemVariants}
          className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-semibold font-sans"
        >
          Skip the search. ParkSmart connects you to premium parking slots across major cities with live availability, instant booking QR codes, and automatic checkout payments.
        </motion.p>

        {/* CTA Actions */}
        <motion.div 
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row gap-4.5 justify-center items-center w-full max-w-md relative"
        >
          <Link to="/explore" className="btn-primary w-full sm:w-auto text-sm px-8 py-3.5 group tracking-wide uppercase font-extrabold shadow-lg shadow-blue-500/10">
            Book a Slot Now
            <FiArrowRight className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Feature Cards Grid (Stagger fade in) */}
        <motion.section 
          variants={containerVariants}
          className="mt-24 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-semibold"
        >
          {[
            {
              icon: <FiMapPin className="text-blue-500 dark:text-blue-400" size={24} />,
              title: 'Multi-City Listings',
              desc: 'Search active parking structures, maps, pricing, and specific guide checkpoints.',
              glowColor: 'hover:border-blue-500/20 dark:hover:border-blue-500/10'
            },
            {
              icon: <FiCpu className="text-indigo-500 dark:text-indigo-400" size={24} />,
              title: 'Live Slots Matrix',
              desc: 'Interactive color-coded visual slot grids showing real-time available and occupied states.',
              glowColor: 'hover:border-indigo-500/20 dark:hover:border-indigo-500/10'
            },
            {
              icon: <FiShield className="text-purple-500 dark:text-purple-400" size={24} />,
              title: 'QR Code Verification',
              desc: 'Receive secure QR ticket codes instantly, scan at gates for instant check-in confirmation.',
              glowColor: 'hover:border-purple-500/20 dark:hover:border-purple-500/10'
            },
            {
              icon: <FiTrendingUp className="text-cyan-500 dark:text-cyan-400" size={24} />,
              title: 'SaaS Analytics',
              desc: 'Admin metrics dashboard calculating daily revenues, peak occupancy, and guide logs.',
              glowColor: 'hover:border-cyan-500/20 dark:hover:border-cyan-500/10'
            },
          ].map((feat, idx) => (
            <motion.div 
              key={idx} 
              variants={cardVariants}
              whileHover={{ y: -3, scale: 1.01 }}
              className={`premium-card p-7 flex flex-col items-center sm:items-start text-center sm:text-left gap-4 bg-white dark:bg-zinc-950/80 ${feat.glowColor}`}
            >
              <div className="p-3.5 bg-slate-100/80 dark:bg-zinc-900/60 rounded-2xl">
                {feat.icon}
              </div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">{feat.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.section>

      </motion.main>

      {/* Premium responsive Footer */}
      <footer className="w-full relative z-10 glass-card border-t border-slate-200/40 dark:border-zinc-900/50 bg-white/70 dark:bg-zinc-950/70 pt-12 pb-6 mt-16 font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
            {/* Logo Column */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold">P</div>
                <span className="font-black text-base uppercase tracking-wider dark:text-white">ParkSmart</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Next-generation IoT smart parking reservation and gate checkout platform.</p>
            </div>

            {/* Support Links */}
            <div className="flex flex-col gap-3.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Company</span>
              <Link to="/about" className="hover:text-blue-500 transition-colors">About Team</Link>
              <Link to="/contact" className="hover:text-blue-500 transition-colors">Contact Support</Link>
              <Link to="/explore" className="hover:text-blue-500 transition-colors">Explore lots</Link>
            </div>

            {/* Address Support */}
            <div className="flex flex-col gap-3.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Contacts</span>
              <div className="flex items-center gap-2">
                <FiPhoneCall size={12} className="text-blue-500" />
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail size={12} className="text-blue-500" />
                <span>support@parksmart.com</span>
              </div>
            </div>

            {/* Social handles */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Join Networks</span>
              <div className="flex items-center gap-3 text-slate-400">
                <a href="#" className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-900 hover:text-blue-500 transition-colors"><FiTwitter size={15} /></a>
                <a href="#" className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-900 hover:text-blue-500 transition-colors"><FiGithub size={15} /></a>
              </div>
            </div>
          </div>

          {/* Bottom Footer bar */}
          <div className="border-t border-slate-200/10 dark:border-zinc-800/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
            <span>&copy; {new Date().getFullYear()} ParkSmart IoT Systems. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-500">Privacy Policy</a>
              <a href="#" className="hover:text-blue-500">Terms of Use</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;
