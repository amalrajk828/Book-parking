import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { fetchSettings } from './features/settingsSlice';

// Common Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import PrivateRoute from './components/common/PrivateRoute';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import AreasList from './pages/public/AreasList';
import AreaDetails from './pages/public/AreaDetails';
import NotFound from './pages/public/NotFound';
import Maintenance from './pages/public/Maintenance';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import MyBookings from './pages/user/MyBookings';
import BookingDetails from './pages/user/BookingDetails';
import Profile from './pages/user/Profile';

// Guide Pages
import GuideDashboard from './pages/guide/GuideDashboard';
import QRScannerPage from './pages/guide/QRScannerPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAreas from './pages/admin/ManageAreas';
import ManageSlots from './pages/admin/ManageSlots';
import ManageUsers from './pages/admin/ManageUsers';
import ManageGuides from './pages/admin/ManageGuides';
import ManageBookings from './pages/admin/ManageBookings';
import Logs from './pages/admin/Logs';
import SettingsDashboard from './pages/admin/SettingsDashboard';

const AppContent = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { settings, initialized } = useSelector((state) => state.settings);
  const { setThemeMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch settings on application startup
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Dynamic Browser Document Title Management
  useEffect(() => {
    const siteName = settings?.websiteName || 'Smart Parking';
    const path = location.pathname;

    let pageTitle = 'Smart Parking';
    if (path === '/') pageTitle = 'Home';
    else if (path === '/login') pageTitle = 'Login';
    else if (path === '/register') pageTitle = 'Register';
    else if (path === '/forgot-password') pageTitle = 'Forgot Password';
    else if (path === '/reset-password') pageTitle = 'Reset Password';
    else if (path === '/about') pageTitle = 'About Us';
    else if (path === '/contact') pageTitle = 'Customer Support';
    else if (path === '/explore') pageTitle = 'Explore Structures';
    else if (path.startsWith('/explore/')) pageTitle = 'Structure Details';
    else if (path === '/dashboard') pageTitle = 'Driver Dashboard';
    else if (path === '/my-bookings') pageTitle = 'My Bookings';
    else if (path.startsWith('/bookings/')) pageTitle = 'Ticket Details';
    else if (path === '/profile') pageTitle = 'Profile Settings';
    else if (path === '/guide' || path === '/guide/') pageTitle = 'Guide Dashboard';
    else if (path === '/guide/scanner') pageTitle = 'Live Ticket Scanner';
    else if (path === '/admin' || path === '/admin/') pageTitle = 'Admin Dashboard';
    else if (path === '/admin/areas') pageTitle = 'Manage Areas';
    else if (path === '/admin/slots') pageTitle = 'Manage Slots';
    else if (path === '/admin/users') pageTitle = 'Manage Users';
    else if (path === '/admin/guides') pageTitle = 'Manage Guides';
    else if (path === '/admin/bookings') pageTitle = 'Manage Bookings';
    else if (path === '/admin/logs') pageTitle = 'System Audit Logs';
    else if (path === '/admin/settings') pageTitle = 'Website Configuration';

    document.title = `${pageTitle} | ${siteName}`;
  }, [location, settings?.websiteName]);

  // Synchronize dynamic theme mode configuration
  useEffect(() => {
    if (settings?.themeMode) {
      setThemeMode(settings.themeMode);
    }
  }, [settings?.themeMode, setThemeMode]);

  // Inject Primary Color Theme Dynamically
  useEffect(() => {
    if (settings?.primaryColor) {
      const rootColor = settings.primaryColor;
      document.documentElement.style.setProperty('--primary-color', rootColor);
      
      let styleTag = document.getElementById('dynamic-theme-style');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-theme-style';
        document.head.appendChild(styleTag);
      }
      
      styleTag.innerHTML = `
        :root {
          --color-primary: ${rootColor};
        }
        .bg-gradient-to-br.from-blue-500.to-indigo-600,
        .bg-gradient-to-br.from-indigo-500.to-blue-500,
        .bg-gradient-to-r.from-blue-600.to-indigo-600,
        .bg-gradient-to-br.from-blue-500.to-indigo-500,
        .bg-gradient-to-br.from-indigo-600.to-blue-500,
        .bg-gradient-to-r.from-blue-500.to-indigo-600 {
          background: linear-gradient(135deg, ${rootColor} 0%, ${rootColor}dd 100%) !important;
        }
        .btn-primary {
          background: linear-gradient(135deg, ${rootColor} 0%, ${rootColor}dd 100%) !important;
        }
        .btn-primary:hover {
          opacity: 0.95 !important;
          box-shadow: 0 10px 15px -3px ${rootColor}33 !important;
        }
        .hover\\:from-blue-700:hover, .hover\\:to-indigo-700:hover {
          background: ${rootColor}ee !important;
        }
        .text-blue-600,
        .text-blue-500,
        .text-blue-400 {
          color: ${rootColor} !important;
        }
        .dark .text-blue-400 {
          color: ${rootColor}ee !important;
        }
        .border-blue-500\\/10 {
          border-color: ${rootColor}1a !important;
        }
        .bg-blue-600\\/10 {
          background-color: ${rootColor}1a !important;
        }
        .hover\\:bg-blue-600\\/20:hover {
          background-color: ${rootColor}33 !important;
        }
        .focus\\:border-blue-500:focus {
          border-color: ${rootColor} !important;
        }
        .focus\\:ring-blue-500\\/20:focus {
          box-shadow: 0 0 0 4px ${rootColor}33 !important;
        }
        .premium-card:hover {
          border-color: ${rootColor}4d !important;
        }
        .dark .premium-card:hover {
          border-color: ${rootColor}26 !important;
        }
      `;
    }
  }, [settings]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Application initialization loading gate
  if (!initialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Premium pulsing and spinning loading ring */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-zinc-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Initializing Platform</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Syncing configurations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Maintenance Mode Gate Interceptor
  const isMaintenanceActive = settings?.maintenanceMode && user?.role !== 'admin';

  if (isMaintenanceActive) {
    return (
      <div className="min-h-screen transition-colors duration-300 dark:bg-zinc-950">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Maintenance />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 dark:bg-zinc-950">
      <Navbar toggleSidebar={toggleSidebar} />
        
        <div className="flex flex-1 relative">
          {/* Main Sidebar (only visible when logged in) */}
          {isAuthenticated && (
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          )}

          <main className="flex-1 w-full relative overflow-y-auto">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/explore" element={<AreasList />} />
              <Route path="/explore/:id" element={<AreaDetails />} />

              {/* Protected User Routes */}
              <Route element={<PrivateRoute allowedRoles={['user', 'admin']} />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/bookings/:id" element={<BookingDetails />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Protected Parking Guide Routes */}
              <Route element={<PrivateRoute allowedRoles={['guide', 'admin']} />}>
                <Route path="/guide" element={<GuideDashboard />} />
                <Route path="/guide/scanner" element={<QRScannerPage />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/areas" element={<ManageAreas />} />
                <Route path="/admin/slots" element={<ManageSlots />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/guides" element={<ManageGuides />} />
                <Route path="/admin/bookings" element={<ManageBookings />} />
                <Route path="/admin/logs" element={<Logs />} />
                <Route path="/admin/settings" element={<SettingsDashboard />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
  );
};

// ErrorBoundary class component for runtime stability
import React from 'react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 text-center font-sans">
          <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-200/40 dark:border-zinc-800/40 shadow-2xl bg-white dark:bg-zinc-950 flex flex-col items-center gap-4">
            <div className="p-4 bg-red-500/10 rounded-full text-red-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight text-center">Application Lock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-center font-bold">
              A runtime rendering collision has occurred. Please refresh the page or return home.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary mt-2 py-2.5 px-6 text-xs uppercase tracking-wider font-extrabold shadow-md mx-auto"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
