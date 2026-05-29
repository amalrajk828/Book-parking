/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiSettings, FiGlobe, FiLayers, FiPhone, FiInfo, 
  FiAlertTriangle, FiCheck, FiRefreshCw, FiDollarSign, FiShare2 
} from 'react-icons/fi';
import { updateSettings, clearSettingsError } from '../../features/settingsSlice';

const SettingsDashboard = () => {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.settings);

  // Local form states mapping precisely to the WebsiteConfig schema
  const [websiteName, setWebsiteName] = useState('');
  const [websiteLogo, setWebsiteLogo] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [supportAddress, setSupportAddress] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [themeMode, setThemeModeState] = useState('system');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [footerText, setFooterText] = useState('');
  
  // Nested social links
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('branding');

  // Predefined harmonious color presets
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
      setWebsiteLogo(settings.websiteLogo || '');
      setContactEmail(settings.contactEmail || '');
      setContactPhone(settings.contactPhone || '');
      setSupportAddress(settings.supportAddress || '');
      setCurrency(settings.currency || 'INR');
      setCurrencySymbol(settings.currencySymbol || '₹');
      setThemeModeState(settings.themeMode || 'system');
      setPrimaryColor(settings.primaryColor || '#3b82f6');
      setMaintenanceMode(settings.maintenanceMode || false);
      setMaintenanceMessage(settings.maintenanceMessage || 'System under maintenance. We will be back shortly.');
      setFooterText(settings.footerText || '');
      
      if (settings.socialLinks) {
        setFacebook(settings.socialLinks.facebook || '');
        setInstagram(settings.socialLinks.instagram || '');
        setTwitter(settings.socialLinks.twitter || '');
        setLinkedin(settings.socialLinks.linkedin || '');
      }
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    dispatch(clearSettingsError());

    const result = await dispatch(updateSettings({
      websiteName,
      websiteLogo,
      contactEmail,
      contactPhone,
      supportAddress,
      currency,
      currencySymbol,
      themeMode,
      primaryColor,
      maintenanceMode,
      maintenanceMessage,
      footerText,
      socialLinks: {
        facebook,
        instagram,
        twitter,
        linkedin
      }
    }));

    if (updateSettings.fulfilled.match(result)) {
      showToast('Website configuration updated successfully!', 'success');
    } else {
      showToast(result.payload || 'Failed to update configuration', 'error');
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/15 text-blue-500">
              <FiSettings size={22} className="animate-glow" />
            </span>
            System Configuration
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2">
            Configure system branding, color schemes, themes, currencies, support info, and maintenance mode.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2.5 overflow-x-auto pb-4 mb-6 border-b border-slate-200/40 dark:border-zinc-900/50">
        {[
          { id: 'branding', label: 'Branding & Identity', icon: <FiGlobe size={14} /> },
          { id: 'appearance', label: 'Theme & Accent', icon: <FiLayers size={14} /> },
          { id: 'contacts', label: 'Support & Contacts', icon: <FiPhone size={14} /> },
          { id: 'socials', label: 'Social Networks', icon: <FiShare2 size={14} /> },
          { id: 'system', label: 'System Controls', icon: <FiInfo size={14} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
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

      {/* Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* TAB 1: Branding */}
          {activeTab === 'branding' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 sm:p-8 bg-white dark:bg-zinc-950 flex flex-col gap-6"
            >
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <FiGlobe className="text-blue-500" />
                Branding Settings
              </h2>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Website Name</label>
                <input
                  type="text"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  required
                  className="glass-input text-xs"
                  placeholder="Enter website name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Website Logo URL</label>
                <input
                  type="url"
                  value={websiteLogo}
                  onChange={(e) => setWebsiteLogo(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="https://example.com/logo.png"
                />
                <span className="text-[10px] text-slate-400 mt-1">Provide a fully qualified URL for your custom website logo image.</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Footer Tagline</label>
                <textarea
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="glass-input text-xs min-h-[80px]"
                  placeholder="Enter footer tagline"
                />
              </div>
            </motion.div>
          )}

          {/* TAB 2: Appearance & Theme */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 sm:p-8 bg-white dark:bg-zinc-950 flex flex-col gap-6"
            >
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <FiLayers className="text-blue-500" />
                Theme & Accent Configuration
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Global Theme Mode</label>
                  <select
                    value={themeMode}
                    onChange={(e) => setThemeModeState(e.target.value)}
                    className="glass-input text-xs dark:bg-zinc-950"
                  >
                    <option value="light">Light Theme Mode</option>
                    <option value="dark">Dark Theme Mode</option>
                    <option value="system">Auto System Preference</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Custom Accent Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-14 p-0 rounded-xl cursor-pointer bg-transparent border-0"
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
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Standard Accent Presets</label>
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
                      <span className="h-4 w-4 rounded-md shrink-0 border border-black/5" style={{ backgroundColor: preset.hex }} />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Support & Contacts */}
          {activeTab === 'contacts' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 sm:p-8 bg-white dark:bg-zinc-950 flex flex-col gap-6"
            >
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <FiPhone className="text-blue-500" />
                Contact & Support Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Support Email Address</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="support@company.com"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Support Phone Number</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Headquarters Support Address</label>
                <textarea
                  value={supportAddress}
                  onChange={(e) => setSupportAddress(e.target.value)}
                  className="glass-input text-xs min-h-[80px]"
                  placeholder="Enter support address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5 border-t border-slate-200/10 dark:border-zinc-800 pt-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Currency Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="₹"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Currency Code</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="INR"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Social Media Links */}
          {activeTab === 'socials' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 sm:p-8 bg-white dark:bg-zinc-950 flex flex-col gap-6"
            >
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <FiShare2 className="text-blue-500" />
                Social Media Links
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Facebook URL</label>
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="https://facebook.com/yourbrand"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Instagram URL</label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="https://instagram.com/yourbrand"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">Twitter URL</label>
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="https://twitter.com/yourbrand"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="https://linkedin.com/company/yourbrand"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: System & Maintenance Toggles */}
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-6 sm:p-8 bg-white dark:bg-zinc-950 flex flex-col gap-6"
            >
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white border-b border-slate-200/10 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <FiInfo className="text-blue-500" />
                Maintenance Mode Controls
              </h2>

              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4.5">
                <div className="flex gap-3">
                  <FiAlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wide">Maintenance Mode Gate</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                      When enabled, all public routing is blocked with a custom warning card. Logged-in Admins retain full access to staff areas.
                    </p>
                  </div>
                </div>

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

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Custom Maintenance Message</label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="glass-input text-xs min-h-[90px]"
                  placeholder="System undergoing scheduled database optimization..."
                />
              </div>
            </motion.div>
          )}

          {/* Save Button */}
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
                'Save Website Configuration'
              )}
            </button>
          </div>

        </div>

        {/* Right Preview Column */}
        <div className="flex flex-col gap-6">
          <div className="premium-card p-6 bg-gradient-to-b from-white to-slate-50/50 dark:from-zinc-950 dark:to-zinc-950/80 sticky top-24 flex flex-col gap-6.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/10 dark:border-zinc-800 pb-2">
              Identity Preview
            </h3>

            {/* Logo Preview */}
            <div className="p-4 bg-slate-100/30 dark:bg-zinc-900/15 border border-slate-200/20 dark:border-zinc-900/40 rounded-2xl flex flex-col gap-3.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Navbar Header Preview</span>
              <div className="flex items-center gap-2">
                {websiteLogo ? (
                  <img src={websiteLogo} alt="Logo" className="h-6 object-contain" />
                ) : (
                  <div className="h-7.5 w-7.5 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-blue-500/10" style={{ backgroundColor: primaryColor }}>
                    {websiteName ? websiteName.substring(0, 1).toUpperCase() : 'P'}
                  </div>
                )}
                <span className="font-black text-sm tracking-wider uppercase dark:text-white font-sans">
                  {websiteName || 'Smart Parking'}
                </span>
              </div>
            </div>

            {/* Accent Theme */}
            <div className="p-4 bg-slate-100/30 dark:bg-zinc-900/15 border border-slate-200/20 dark:border-zinc-900/40 rounded-2xl flex flex-col gap-2.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Active Accent Theme</span>
              <div className="flex items-center gap-3">
                <span className="h-6.5 w-6.5 rounded-xl border border-black/5 block shadow-sm shrink-0" style={{ backgroundColor: primaryColor }} />
                <div>
                  <span className="text-xs font-extrabold dark:text-white uppercase tracking-wider block">{primaryColor}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Primary Accent Color</span>
                </div>
              </div>
            </div>

            {/* Pricing representation */}
            <div className="p-4 bg-slate-100/30 dark:bg-zinc-900/15 border border-slate-200/20 dark:border-zinc-900/40 rounded-2xl flex flex-col gap-2.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Pricing Format</span>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <FiDollarSign size={16} className="text-blue-500" style={{ color: primaryColor }} />
                <span className="text-sm font-extrabold">{currencySymbol} 120 ({currency}) / Hr</span>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SettingsDashboard;
