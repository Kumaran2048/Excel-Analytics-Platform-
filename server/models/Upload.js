const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name: String,
  type: String
});

const uploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  columns: [columnSchema],
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  rowCount: {
    type: Number,
    required: true
  },
  columnCount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Upload', uploadSchema);