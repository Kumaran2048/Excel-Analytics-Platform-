const User = require('../models/User');
const Upload = require('../models/Upload');
const Analysis = require('../models/Analysis');

// @desc    Create a new user (admin only)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide name, email, and password' 
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user - let the User model's pre-save middleware handle password hashing
    const user = await User.create({
      name,
      email,
      password, // This will be automatically hashed by the pre-save middleware
      role: role || 'user'
    });

    if (user) {
      res.status(201).json({
        message: 'User created successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          theme: user.theme,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle duplicate key error (email)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users with pagination and search
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    // Add isActive filter to only show active users by default
    if (!req.query.includeInactive) {
      query.isActive = true;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      users,
      currentPage: page,
      totalPages,
      totalUsers: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive && !req.query.includeInactive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's uploads and analyses count
    const uploadsCount = await Upload.countDocuments({ userId: user._id });
    const analysesCount = await Analysis.countDocuments({ userId: user._id });

    // Get user's recent activity
    const recentUploads = await Upload.find({ userId: user._id })
      .select('originalName fileSize createdAt status')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      user: {
        ...user.toObject(),
        uploadsCount,
        analysesCount,
        recentUploads
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, role, avatar, theme, password, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from modifying their own role or status
    if (user._id.toString() === req.user.id) {
      if (role && role !== user.role) {
        return res.status(400).json({ message: 'Cannot change your own role' });
      }
      if (isActive !== undefined && isActive !== user.isActive) {
        return res.status(400).json({ message: 'Cannot change your own status' });
      }
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (avatar !== undefined) user.avatar = avatar;
    if (theme) user.theme = theme;
    if (isActive !== undefined) user.isActive = isActive;

    // Update password if provided - just set it, the pre-save middleware will hash it
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Password must be at least 6 characters long' 
        });
      }
      user.password = password; // Let the pre-save middleware handle hashing
    }

    const updatedUser = await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        theme: updatedUser.theme,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        lastActivity: updatedUser.lastActivity
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle duplicate key error (email)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user (soft delete by setting isActive to false)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reactivate user
// @route   POST /api/admin/users/:id/reactivate
// @access  Private/Admin
const reactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({ 
      message: 'User reactivated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk delete users (soft delete)
// @route   POST /api/admin/users/bulk-delete
// @access  Private/Admin
const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Please provide user IDs to delete' });
    }

    // Prevent admin from deleting themselves
    if (userIds.includes(req.user.id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Soft delete users by setting isActive to false
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isActive: false } }
    );

    res.json({ 
      message: `${result.modifiedCount} users deactivated successfully`,
      deactivatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk delete users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk reactivate users
// @route   POST /api/admin/users/bulk-reactivate
// @access  Private/Admin
const bulkReactivateUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Please provide user IDs to reactivate' });
    }

    // Reactivate users by setting isActive to true
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isActive: true } }
    );

    res.json({ 
      message: `${result.modifiedCount} users reactivated successfully`,
      reactivatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk reactivate users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalInactiveUsers = await User.countDocuments({ isActive: false });
    const totalUploads = await Upload.countDocuments();
    const totalAnalyses = await Analysis.countDocuments();
    
    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true 
    });

    // Get recent active users
    const recentUsers = await User.find({ isActive: true })
      .select('name email role createdAt lastActivity')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recent uploads
    const recentUploads = await Upload.find()
      .populate('userId', 'name email')
      .select('originalName fileSize createdAt status')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get user distribution by role (only active users)
    const userDistribution = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totals: {
        users: totalUsers,
        inactiveUsers: totalInactiveUsers,
        uploads: totalUploads,
        analyses: totalAnalyses,
        newUsers
      },
      recentUsers,
      recentUploads,
      userDistribution
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user activity statistics
// @route   GET /api/admin/users/:id/activity
// @access  Private/Admin
const getUserActivity = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive && !req.query.includeInactive) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uploads = await Upload.find({ userId })
      .select('originalName fileSize createdAt status')
      .sort({ createdAt: -1 })
      .limit(10);

    const analyses = await Analysis.find({ userId })
      .select('chartType dimensions metrics createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const totalUploads = await Upload.countDocuments({ userId });
    const totalAnalyses = await Analysis.countDocuments({ userId });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastActivity: user.lastActivity
      },
      activity: {
        totalUploads,
        totalAnalyses,
        recentUploads: uploads,
        recentAnalyses: analyses
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  reactivateUser,
  bulkDeleteUsers,
  bulkReactivateUsers,
  getDashboardStats,
  getUserActivity
};