const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    required: true
  },
  chartType: {
    type: String,
    required: true
  },
  xAxis: {
    type: String,
    required: true
  },
  yAxis: {
    type: String,
    required: true
  },
  zAxis: {
    type: String
  },
  options: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  summary: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analysis', analysisSchema);