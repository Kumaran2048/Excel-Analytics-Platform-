import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ExcelUpload from './pages/ExcelUpload';
import AnalyticsPage from './pages/AnalyticsPage';
import History from './pages/History';
import Settings from './pages/Settings';
import AdminUsers from './pages/AdminUsers';
import AdminUpload from './pages/AdminUpload';
import ChartControllerPage from './pages/ChartControllerPage';
import Chart3DPage from './pages/Chart3DPage';
import { ExcelBackground } from './components/ExcelBackground';

function AppContent() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  
  const showExcelBackground = !user && (location.pathname === '/login' || location.pathname === '/register');
  
  
  const showNavbarAndSidebar = user && !['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    
    if (user?.theme) {
      document.documentElement.classList.toggle('dark', user.theme === 'dark');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {showExcelBackground && <ExcelBackground />}
      
    
      {showNavbarAndSidebar && <Navbar />}
      
   
      {showNavbarAndSidebar && <Sidebar />}
      
      <div className={showNavbarAndSidebar ? 'ml-64' : ''}>
        <main className={showNavbarAndSidebar ? 'pt-16' : ''}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
              </ProtectedRoute>
            } />
            
            <Route path="/user-dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-dashboard" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/upload" element={
              <ProtectedRoute>
                <ExcelUpload />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics/:id" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />

            <Route path="/analyze/:id" element={
              <ProtectedRoute>
                <ChartControllerPage />
              </ProtectedRoute>
            } />

            <Route path="/analysis/:id" element={
              <ProtectedRoute>
                <Chart3DPage />
              </ProtectedRoute>
            } />
            
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-users" element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-upload" element={
              <ProtectedRoute adminOnly>
                <AdminUpload />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;