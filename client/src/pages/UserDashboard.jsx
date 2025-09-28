import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, BarChart3, History, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserUploads } from '../redux/excelSlice';

const UserDashboard = () => {
  const { uploads, isLoading } = useSelector((state) => state.excel);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserUploads({ page: 1, limit: 5 }));
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Uploads',
      value: uploads.length,
      icon: Upload,
      color: 'bg-blue-500',
    },
    {
      title: 'Recent Analyses',
      value: '0',
      icon: BarChart3,
      color: 'bg-green-500',
    },
    {
      title: 'Data Points',
      value: uploads.reduce((sum, upload) => sum + (upload.rowCount || 0), 0),
      icon: History,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analyze your Excel data and create beautiful visualizations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/upload"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Upload New File
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload an Excel file to start analyzing your data
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/history"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <History className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                View History
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse your previous uploads and analyses
              </p>
            </div>
          </div>
        </Link>
      </div>

     
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Uploads
          </h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : uploads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rows × Columns
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {uploads.map((upload) => (
                    <tr key={upload._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {upload.originalName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {(upload.fileSize / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {upload.rowCount} × {upload.columnCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No uploads yet.{' '}
                <Link
                  to="/upload"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Upload your first file
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;