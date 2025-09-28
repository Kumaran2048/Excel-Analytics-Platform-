const express = require('express');
const { 
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
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(admin);

// Dashboard routes
router.get('/dashboard', getDashboardStats);

// User management routes
router.route('/users')
  .get(getUsers)          // GET /api/admin/users - Get all users with pagination
  .post(createUser);      // POST /api/admin/users - Create a new user

router.route('/users/bulk-delete')
  .post(bulkDeleteUsers); // POST /api/admin/users/bulk-delete - Delete multiple users

router.route('/users/bulk-reactivate')
  .post(bulkReactivateUsers); // POST /api/admin/users/bulk-reactivate - Reactivate multiple users

router.route('/users/:id')
  .get(getUserById)       // GET /api/admin/users/:id - Get user by ID
  .put(updateUser)        // PUT /api/admin/users/:id - Update user
  .delete(deleteUser);    // DELETE /api/admin/users/:id - Delete user (soft delete)

router.route('/users/:id/reactivate')
  .post(reactivateUser);  // POST /api/admin/users/:id/reactivate - Reactivate user

router.route('/users/:id/activity')
  .get(getUserActivity);  // GET /api/admin/users/:id/activity - Get user activity

module.exports = router;