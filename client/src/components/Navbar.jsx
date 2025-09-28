import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Upload, 
  History, 
  Settings, 
  User, 
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Home,
  Users,
  PieChart
} from 'lucide-react';
import { logout } from '../redux/authSlice';
import { updateProfile } from '../redux/authSlice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsProfileMenuOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = user.theme === 'light' ? 'dark' : 'light';
    dispatch(updateProfile({ theme: newTheme }));
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu-trigger') && 
          !event.target.closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const navItems = [
    { name: 'Dashboard', path: user?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard', icon: Home },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'History', path: '/history', icon: History },
    ...(user?.role === 'admin' ? [
      { name: 'Users', path: '/admin-users', icon: Users },
    
    ] : []),
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'US';
  };

  const renderAvatar = () => {
    if (user?.avatar) {
      if (user.avatar.includes('data:image/') || user.avatar.startsWith('http')) {
        return (
          <img
            src={user.avatar}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-700"
          />
        );
      } else {
        // Emoji avatar
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center border-2 border-white dark:border-gray-700">
            <span className="text-sm font-bold text-white">
              {user.avatar}
            </span>
          </div>
        );
      }
    } else {
      // Default avatar with initials
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-white dark:border-gray-700">
          <span className="text-sm font-bold text-white">
            {getInitials(user?.name)}
          </span>
        </div>
      );
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <BarChart3 className="h-7 w-7 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-lg md:text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                Excel Analytics
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-4 w-4 mr-1" />
                {item.name}
              </Link>
            ))}
            
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {user?.theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <div className="relative profile-menu-trigger">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="User menu"
              >
                {renderAvatar()}
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="profile-menu absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={closeProfileMenu}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button and profile */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md"
              aria-label="Toggle theme"
            >
              {user?.theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={toggleProfileMenu}
              className="profile-menu-trigger p-1"
              aria-label="User menu"
            >
              {renderAvatar()}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-md"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Profile Menu */}
        {isProfileMenuOpen && isMobile && (
          <div className="md:hidden absolute top-16 right-3 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-50 w-48">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        )}

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex items-center px-3 py-2">
                  {renderAvatar()}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  {user?.theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      Dark Mode
                    </>
                  )}
                </button>

                <Link
                  to="/settings"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;