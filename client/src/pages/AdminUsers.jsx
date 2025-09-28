import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus, Filter, Download, Upload, Shield, User, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getUsers, 
  updateUser, 
  deleteUser, 
  reactivateUser,
  createUser, 
  clearError, 
  clearSuccess,
  bulkDeleteUsers,
  bulkReactivateUsers,
  setFilters,
  clearFilters
} from '../redux/adminSlice';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showInactive, setShowInactive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  
  const { users, isLoading, isOperationLoading, pagination, error, success, filters } = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  const roleFilter = filters.role || '';

  useEffect(() => {
    dispatch(getUsers({ 
      page: currentPage, 
      search: searchTerm, 
      role: roleFilter,
      includeInactive: showInactive 
    }));
  }, [currentPage, searchTerm, roleFilter, showInactive, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
  }, [error, success, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(getUsers({ 
      page: 1, 
      search: searchTerm, 
      role: roleFilter,
      includeInactive: showInactive 
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    dispatch(clearFilters());
    setCurrentPage(1);
    dispatch(getUsers({ page: 1, includeInactive: showInactive }));
  };

  const handleRoleFilterChange = (role) => {
    dispatch(setFilters({ role }));
    setCurrentPage(1);
    dispatch(getUsers({ 
      page: 1, 
      search: searchTerm, 
      role: role,
      includeInactive: showInactive 
    }));
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      dispatch(updateUser({
        id: editingUser._id,
        userData: {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role
        }
      }));
      setIsEditModalOpen(false);
      setEditingUser(null);
    }
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    dispatch(createUser(newUser));
    setIsAddModalOpen(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setShowPassword(false); // Reset password visibility
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      dispatch(deleteUser(userId));
    }
  };

  const handleReactivateUser = (userId) => {
    if (window.confirm('Are you sure you want to reactivate this user?')) {
      dispatch(reactivateUser(userId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) {
      toast.error('Please select users to deactivate');
      return;
    }
    
    if (window.confirm(`Are you sure you want to deactivate ${selectedUsers.size} users?`)) {
      dispatch(bulkDeleteUsers(Array.from(selectedUsers)));
      setSelectedUsers(new Set());
    }
  };

  const handleBulkReactivate = () => {
    if (selectedUsers.size === 0) {
      toast.error('Please select users to reactivate');
      return;
    }
    
    if (window.confirm(`Are you sure you want to reactivate ${selectedUsers.size} users?`)) {
      dispatch(bulkReactivateUsers(Array.from(selectedUsers)));
      setSelectedUsers(new Set());
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allUserIds = new Set(users.map(user => user._id));
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleExportUsers = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined Date'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => 
        `"${user.name}","${user.email}","${user.role}","${user.isActive ? 'Active' : 'Inactive'}","${new Date(user.createdAt).toLocaleDateString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const activeUsers = users.filter(user => user.isActive);
  const inactiveUsers = users.filter(user => !user.isActive);
  const displayedUsers = showInactive ? users : activeUsers;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage system users and their permissions. Add new users manually and modify roles as needed.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </form>
          
          <div className="flex items-center space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Inactive</span>
            </label>
            
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-200">
              {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              {showInactive ? (
                <button
                  onClick={handleBulkReactivate}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reactivate Selected
                </button>
              ) : (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deactivate Selected
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Summary */}
      {showInactive && inactiveUsers.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <EyeOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <span className="text-yellow-800 dark:text-yellow-200">
              Showing {inactiveUsers.length} deactivated user{inactiveUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Users ({pagination.totalUsers})
            {showInactive && ` (${inactiveUsers.length} inactive)`}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportUsers}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isOperationLoading}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading users...</p>
            </div>
          ) : displayedUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayedUsers.map((user) => (
                    <tr key={user._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${!user.isActive ? 'opacity-70' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                              {!user.isActive && (
                                <span className="ml-2 text-xs text-gray-500">(Inactive)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user.role === 'admin' ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Edit User"
                            disabled={isOperationLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {user.isActive ? (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Deactivate User"
                              disabled={isOperationLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivateUser(user._id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                              title="Reactivate User"
                              disabled={isOperationLoading}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No users found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {searchTerm || roleFilter ? 'Try adjusting your search filters' : 'Get started by adding your first user'}
              </p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pagination.limit, pagination.totalUsers)}
              </span> of{' '}
              <span className="font-medium">{pagination.totalUsers}</span> users
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            
            <div className="hidden sm:flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {pagination.totalPages > 5 && (
                <span className="px-2 py-2 text-gray-500">...</span>
              )}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages || isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        {editingUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name *</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email *</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Role *</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isOperationLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                disabled={isOperationLoading}
              >
                {isOperationLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewUser({
            name: '',
            email: '',
            password: '',
            role: 'user'
          });
          setShowPassword(false); 
        }}
        title="Add New User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name *</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email *</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Set a password (min. 6 characters)"
                minLength={6}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Role *</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setShowPassword(false); // Reset password visibility when canceling
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isOperationLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              disabled={isOperationLoading}
            >
              {isOperationLoading ? 'Creating...' : 'Add User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;