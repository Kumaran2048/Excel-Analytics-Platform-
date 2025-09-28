import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Upload, 
  History, 
  Settings, 
  User,
  Home,
  X,
  Menu
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // Close sidebar when route changes on mobile
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navItems = [
    { name: 'Home', path: user?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard', icon: Home },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'History', path: '/history', icon: History },
    ...(user?.role === 'admin' ? [
      { name: 'Users', path: '/admin-users', icon: User }
    ] : []),
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && isMobile && !event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="sidebar-toggle fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md md:hidden"
          aria-label="Toggle sidebar"
        >
          {isOpen ? (
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar w-64 bg-white dark:bg-gray-800 shadow-lg h-screen fixed left-0 top-0 pt-16 z-40 transition-transform duration-300 ease-in-out
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`}
      >
        <div className="p-4 h-full overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => {
                  if (isMobile) {
                    setIsOpen(false);
                  }
                }}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer for desktop sidebar */}
      {!isMobile && (
        <div className="w-64 flex-shrink-0"></div>
      )}
    </>
  );
};

export default Sidebar;