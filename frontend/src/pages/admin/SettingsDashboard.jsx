import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiSettings, FiGlobe, FiLayers, FiPhone, FiInfo, 
  FiAlertTriangle, FiCheck, FiRefreshCw, FiDollarSign 
} from 'react-icons/fi';
import { updateSettings, clearSettingsError } from '../../features/settingsSlice';

const SettingsDashboard = () => {
  const dispatch = useDispatch();
  const { settings, loading, error } = useSelector((state) => state.settings);

  // Local form states
  const [websiteName, setWebsiteName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [footerText, setFooterText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [termsText, setTermsText] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('branding');

  // Predefined harmonious color presets for standard primary theme choices
  const colorPresets = [
    { name: 'Classic Blue', hex: '#3b82f6' },
    { name: 'Emerald Green', hex: '#10b981' },
    { name: 'Indigo Aura', hex: '#6366f1' },
    { name: 'Purple Neon', hex: '#8b5cf6' },
    { name: 'Cyan Glow', hex: '#06b6d4' },
    { name: 'Amber Smart', hex: '#f59e0b' }
  ];

  // Sync redux state to local form states on load
  useEffect(() => {
    if (settings) {
      setWebsiteName(settings.websiteName || '');
      setLogoUrl(settings.logoUrl || '');
      setPrimaryColor(settings.primaryColor || '#3b82f6');
      setFooterText(settings.footerText || '');
      setContactEmail(settings.contactEmail || '');
      setSupportPhone(settings.supportPhone || '');
      setCurrency(settings.currency || '₹');
      setTermsText(settings.termsText || '');
      setMaintenanceMode(settings.maintenanceMode || false);
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    dispatch(clearSettingsError());

    const result = await dispatch(updateSettings({
      websiteName,
      logoUrl,
      primaryColor,
      footerText,
      contactEmail,
      supportPhone,
      currency,
      termsText,
      maintenanceMode
    }));

    if (updateSettings.fulfilled.match(result)) {
      showToast('Global settings updated and propagated successfully!', 'success');
    } else {
      showToast(result.payload || 'Failed to update system settings', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-semibold">
      
      {/* Dynamic Toast Alerts */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-20 right-4 z-50 px-5 py-3.5 rounded-2xl border text-xs tracking-wide shadow-lg flex items-center gap-3 backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          }`}
        >
          {toast.type === 'success' ? <FiCheck size={16} /> : <FiAlertTriangle size={16} />}
          <span>{toast.message}</span>
        </motion.div>
      )}

      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/15 text-blue-500">
              <FiSettings size={22} className="animate-glow" />
            </span>
            Website Configuration
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2">
            Configure system branding, currencies, themes, and global maintenance modes.
          </p>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex gap-2.5 overflow-x-auto pb-4 mb-6 border-b border-slate-200/40 dark:border-zinc-900/50">
        {[
          { id: 'branding', label: 'Branding & Identity', icon: <FiGlobe size={14} /> },
          { id: 'appearance', label: 'Theme & Style', icon: <FiLayers size={14} /> },
          { id: 'contacts', label: 'Support & Contacts', icon: <FiPhone size={14} /> },
          { id: 'system', label: 'System Controls', icon: <FiInfo size={14} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs tracking-wider uppercase whitespace-nowrap transition-all duration-200 border ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-zinc-950 border-slate-200/50 dark:border-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-900/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Inputs based on Tab */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* TAB 1: Branding & Identity */}
          {activeTab === 'branding' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 sm:p-8 bg-white dark:bg-zinc-950 flex flex-col gap-6"
            >
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <FiGlobe className="text-blue-500" />
                Branding & Identity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Website Name</label>
                  <input
                    type="text"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    required
                    className="glass-input text-xs"
                    placeholder="Enter site name"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Site Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="glass-input text-xs dark:bg-zinc-950"
                  >
                    <option value="₹">Rupee (₹)</option>
                    <option value="$">US Dollar ($)</option>
                    <option value="€">Euro (€)</option>
                    <option value="£">Pound (£)</option>
                    <option value="AED">Dirham (AED)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Website Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="https://example.com/logo.png"
                />
                <span className="text-[10px] text-slate-400 mt-1">Leave empty to use standard typographic gradient brand logo.</span>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Theme & Appearance */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 sm:p-8 bg-white dark:bg-zinc-950 flex flex-col gap-6"
            >
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <FiLayers className="text-blue-500" />
                Color Theme & Styling
              </h2>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Harmonious Color Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setPrimaryColor(preset.hex)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
                        primaryColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'border-blue-500 bg-blue-500/5'
                          : 'border-slate-200/40 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/10 hover:bg-slate-100 dark:hover:bg-zinc-900/30'
                      }`}
                    >
                      <span className="h-4.5 w-4.5 rounded-lg shrink-0 border border-black/5" style={{ backgroundColor: preset.hex }} />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Custom Primary Hex Code</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-16 p-0 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="glass-input text-xs flex-1"
                    placeholder="#3b82f6"
                    pattern="^#([A-Fa-f0-9]{6})$"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">This color controls all buttons, icons, highlights, and borders.</span>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Contacts & Support */}
          {activeTab === 'contacts' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 sm:p-8 bg-white dark:bg-zinc-950 flex flex-col gap-6"
            >
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <FiPhone className="text-blue-500" />
                Support & Contact Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Support Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="support@company.com"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Support Phone</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Footer Text</label>
                <textarea
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="glass-input text-xs min-h-[80px]"
                  placeholder="Enter footer tagline"
                />
              </div>
            </motion.div>
          )}

          {/* TAB 4: System & Maintenance Controls */}
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 sm:p-8 bg-white dark:bg-zinc-950 flex flex-col gap-6"
            >
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <FiInfo className="text-blue-500" />
                System Settings & Policies
              </h2>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Booking Terms & Conditions</label>
                <textarea
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  className="glass-input text-xs min-h-[100px]"
                  placeholder="Specify reservation criteria, pricing guidelines, refund rules..."
                />
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4.5">
                <div className="flex gap-3">
                  <FiAlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wide">Maintenance Mode</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                      Turning this ON will immediately log out and block all general users from accessing any part of the site with a scheduled maintenance alert card. Admins still bypass.
                    </p>
                  </div>
                </div>

                {/* Maintenance switch toggle */}
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-14 h-8 rounded-full transition-all duration-300 relative p-1 shrink-0 ${
                    maintenanceMode ? 'bg-amber-500 shadow-md shadow-amber-500/10' : 'bg-slate-200 dark:bg-zinc-800'
                  }`}
                >
                  <span className={`h-6 w-6 rounded-full bg-white block transition-transform duration-300 shadow-md ${
                    maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Action Trigger Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto px-8.5 font-extrabold text-xs uppercase tracking-widest"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Saving Configuration...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>

        </div>

        {/* Right Column - Side Preview widget */}
        <div className="flex flex-col gap-6">
          <div className="premium-card p-6 bg-gradient-to-b from-white to-slate-50/50 dark:from-zinc-950 dark:to-zinc-950/80 sticky top-24 flex flex-col gap-6.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/10 dark:border-zinc-800 pb-2">
              Branding Preview
            </h3>

            {/* Simulated Header Logo preview */}
            <div className="p-4 bg-slate-100/30 dark:bg-zinc-900/15 border border-slate-200/20 dark:border-zinc-900/40 rounded-2xl flex flex-col gap-3.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Navbar Header Banner</span>
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-6 object-contain" />
                ) : (
                  <div className="h-7.5 w-7.5 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-blue-500/10" style={{ backgroundColor: primaryColor }}>
                    {websiteName ? websiteName.substring(0, 1).toUpperCase() : 'P'}
                  </div>
                )}
                <span className="font-black text-sm tracking-wider uppercase dark:text-white">
                  {websiteName || 'PARKSMART'}
                </span>
              </div>
            </div>

            {/* Theme Customizer info */}
            <div className="p-4 bg-slate-100/30 dark:bg-zinc-900/15 border border-slate-200/20 dark:border-zinc-900/40 rounded-2xl flex flex-col gap-2.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Active Accent Theme</span>
              <div className="flex items-center gap-3">
                <span className="h-6.5 w-6.5 rounded-xl border border-black/5 block shadow-sm shrink-0" style={{ backgroundColor: primaryColor }} />
                <div>
                  <span className="text-xs font-extrabold dark:text-white uppercase tracking-wider block">{primaryColor}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Assigned primary CSS token</span>
                </div>
              </div>
            </div>

            {/* Currency Preview */}
            <div className="p-4 bg-slate-100/30 dark:bg-zinc-900/15 border border-slate-200/20 dark:border-zinc-900/40 rounded-2xl flex flex-col gap-2.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Currency pricing representation</span>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <FiDollarSign size={16} className="text-blue-500" style={{ color: primaryColor }} />
                <span className="text-sm font-extrabold">{currency} 120 / Hour</span>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SettingsDashboard;
