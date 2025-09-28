import { useEffect } from 'react';
import { Users, Upload, BarChart3, TrendingUp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardStats } from '../redux/adminSlice';

const AdminDashboard = () => {
  const { dashboardStats, isLoading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Users',
      value: dashboardStats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Uploads',
      value: dashboardStats?.totalUploads || 0,
      icon: Upload,
      color: 'bg-green-500',
    },
    {
      title: 'Total Analyses',
      value: dashboardStats?.totalAnalyses || 0,
      icon: BarChart3,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Users',
      value: dashboardStats?.recentUsers?.length || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 md:py-6 lg:py-8">
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
          Welcome back, {user?.name}. Here's an overview of the system.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-4 md:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6"
          >
            <div className="flex items-center">
              <div className={`p-2 sm:p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-2 sm:ml-3 md:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  {stat.title}
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-white">
              Recent Users
            </h2>
          </div>
          <div className="p-3 sm:p-4 md:p-6">
            {isLoading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : dashboardStats?.recentUsers?.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {dashboardStats.recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-medium">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ml-2 flex-shrink-0">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-xs sm:text-sm md:text-base">
                No users found
              </p>
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-white">
              Recent Uploads
            </h2>
          </div>
          <div className="p-3 sm:p-4 md:p-6">
            {isLoading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : dashboardStats?.recentUploads?.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {dashboardStats.recentUploads.map((upload) => (
                  <div key={upload._id} className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {upload.originalName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          by {upload.userId?.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 ml-2 flex-shrink-0">
                      {(upload.fileSize / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-xs sm:text-sm md:text-base">
                No uploads found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
