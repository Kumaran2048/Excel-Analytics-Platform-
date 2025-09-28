import { useState, useEffect } from 'react';
import { Eye, EyeOff, Upload, X, User, Camera, Palette, Shield } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../redux/authSlice';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Avatar must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setAvatarPreview(imageDataUrl);
        setProfileData(prev => ({
          ...prev,
          avatar: imageDataUrl
        }));
        
        // Auto-save the avatar when selected
        dispatch(updateProfile({ avatar: imageDataUrl }));
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => setIsUploading(false), 500);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
      setIsUploading(false);
      clearInterval(progressInterval);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setProfileData(prev => ({
      ...prev,
      avatar: ''
    }));
    dispatch(updateProfile({ avatar: '' }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(profileData));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    dispatch(updateProfile({
      password: passwordData.newPassword
    }));

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Password', icon: Shield },
    { id: 'preferences', name: 'Appearance', icon: Palette },
  ];

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'US';
  };

  const predefinedAvatars = [
    '😊', '😎', '🤩', '😍', '🥳', '🤗', '😇', '🥰', '😋', '🤠',
    '🐶', '🐱', '🐼', '🐯', '🦁', '🐰', '🐻', '🐨', '🐵', '🦊'
  ];

  const selectPredefinedAvatar = (avatar) => {
    setAvatarPreview(avatar);
    setProfileData(prev => ({
      ...prev,
      avatar: avatar
    }));
    dispatch(updateProfile({ avatar: avatar }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Settings Navigation
            </h2>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                  Profile Information
                </h2>
                
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    {avatarPreview ? (
                      avatarPreview.includes('data:image/') || avatarPreview.startsWith('http') ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg text-4xl bg-blue-100 dark:bg-blue-900">
                          {avatarPreview}
                        </div>
                      )
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                        <span className="text-4xl text-white font-bold">
                          {getInitials(user?.name)}
                        </span>
                      </div>
                    )}
                    
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 mb-4">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Photo
                      </span>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarChange}
                        disabled={isUploading}
                      />
                    </label>
                    
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </button>
                    )}
                  </div>

                  {isUploading && (
                    <div className="w-full max-w-xs">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Predefined Avatars */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Choose an emoji avatar
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {predefinedAvatars.map((avatar, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectPredefinedAvatar(avatar)}
                        className="w-12 h-12 text-2xl rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 flex items-center justify-center transition-colors"
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                  Change Password
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                  Appearance Settings
                </h2>
                
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose how Excel Analytics looks to you
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => dispatch(updateProfile({ theme: 'light' }))}
                      className={`px-4 py-2 rounded-md border ${
                        user?.theme === 'light'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => dispatch(updateProfile({ theme: 'dark' }))}
                      className={`px-4 py-2 rounded-md border ${
                        user?.theme === 'dark'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Language</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose your preferred language
                    </p>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>

              {user?.role === 'admin' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                    Admin Preferences
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">User Management</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enable advanced user management features
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Analytics Dashboard</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Show advanced analytics dashboard
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;