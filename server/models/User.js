const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true, // ✅ unique index handled here
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  loginHistory: [{
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true, // ✅ include virtuals
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpire;
      delete ret.loginHistory;
      delete ret.__v; // ✅ cleaner output
      return ret;
    }
  }
});

// Indexes for queries
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  delete userObject.loginHistory;
  delete userObject.__v;
  return userObject;
};

// Static method to find active users
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

// Virtual for user's full profile URL
userSchema.virtual('profileUrl').get(function () {
  return `/users/${this._id}/profile`;
});

// Virtual for user's initials
userSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
});

module.exports = mongoose.model('User', userSchema);
