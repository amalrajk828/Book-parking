import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

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

const AppContent = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
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
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
