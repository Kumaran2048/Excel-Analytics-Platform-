const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Optional: Check for token in cookies (if using cookies for auth)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database and exclude password
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if user account is active
      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Not authorized, account is deactivated' });
      }

      // Update last activity timestamp (optional)
      req.user.lastActivity = new Date();
      await req.user.save();

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Not authorized, invalid token' });
      }
      
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Optional: Middleware to check if user is the owner of the resource or admin
const ownerOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user && (req.user.role === 'admin' || req.user._id.toString() === resourceUserId)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized to access this resource' });
  }
};

module.exports = { protect, admin, ownerOrAdmin };