const Upload = require('../models/Upload');
const Analysis = require('../models/Analysis');
const { parseExcel } = require('../utils/excelParser');
const fs = require('fs');
const path = require('path');

// @desc    Upload Excel file
// @route   POST /api/excel/upload
// @access  Private
const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Check if file exists and is accessible
    if (!fs.existsSync(req.file.path)) {
      return res.status(400).json({ message: 'Uploaded file not found' });
    }

    // Parse the Excel file
    const fileBuffer = fs.readFileSync(req.file.path);
    const parsedData = await parseExcel(fileBuffer, req.file.originalname);

    // Create upload record
    const upload = await Upload.create({
      userId: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      columns: parsedData.columns,
      data: parsedData.data,
      rowCount: parsedData.rowCount,
      columnCount: parsedData.columnCount
    });

    // Clean up uploaded file
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupError) {
      console.warn('Could not delete temporary file:', cleanupError.message);
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      upload: {
        id: upload._id,
        filename: upload.originalName,
        columns: upload.columns,
        data: upload.data.slice(0, 10), // Return first 10 rows for preview
        rowCount: upload.rowCount,
        columnCount: upload.columnCount
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Could not delete temporary file after error:', cleanupError.message);
      }
    }
    
    res.status(500).json({ 
      message: error.message || 'File upload failed. Please check the file format and try again.' 
    });
  }
};

// @desc    Get user uploads
// @route   GET /api/excel/uploads
// @access  Private
const getUserUploads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    
    if (search) {
      query.originalName = { $regex: search, $options: 'i' };
    }

    const uploads = await Upload.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-data'); // Exclude large data field

    const total = await Upload.countDocuments(query);

    res.json({
      uploads,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUploads: total
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get upload by ID
// @route   GET /api/excel/uploads/:id
// @access  Private
const getUploadById = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Check if user owns this upload or is admin
    if (upload.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(upload);
  } catch (error) {
    console.error('Get upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Save analysis
// @route   POST /api/excel/analyze
// @access  Private
const saveAnalysis = async (req, res) => {
  try {
    const { uploadId, chartType, xAxis, yAxis, zAxis, options, summary } = req.body;

    // Verify the upload belongs to the user
    const upload = await Upload.findById(uploadId);
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    if (upload.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const analysis = await Analysis.create({
      userId: req.user._id,
      uploadId,
      chartType,
      xAxis,
      yAxis,
      zAxis,
      options,
      summary
    });

    // Populate upload details for response
    await analysis.populate('uploadId', 'originalName createdAt');

    res.status(201).json({
      message: 'Analysis saved successfully',
      analysis
    });
  } catch (error) {
    console.error('Save analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user analyses
// @route   GET /api/excel/analyses
// @access  Private
const getUserAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .populate('uploadId', 'originalName createdAt')
      .sort({ createdAt: -1 });

    res.json(analyses);
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete upload and associated analyses
// @route   DELETE /api/excel/uploads/:id
// @access  Private
const deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Check if user owns this upload
    if (upload.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated analyses
    await Analysis.deleteMany({ uploadId: upload._id });

    // Delete the upload
    await Upload.findByIdAndDelete(req.params.id);

    res.json({ message: 'Upload and associated analyses deleted successfully' });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete analysis
// @route   DELETE /api/excel/analyses/:id
// @access  Private
const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Check if user owns this analysis
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Analysis.findByIdAndDelete(req.params.id);

    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get analysis by ID
// @route   GET /api/excel/analyses/:id
// @access  Private
const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('uploadId', 'originalName columns data');
    
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Check if user owns this analysis
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update analysis
// @route   PUT /api/excel/analyses/:id
// @access  Private
const updateAnalysis = async (req, res) => {
  try {
    const { chartType, xAxis, yAxis, zAxis, options, summary } = req.body;

    const analysis = await Analysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Check if user owns this analysis
    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedAnalysis = await Analysis.findByIdAndUpdate(
      req.params.id,
      {
        chartType,
        xAxis,
        yAxis,
        zAxis,
        options,
        summary,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('uploadId', 'originalName createdAt');

    res.json({
      message: 'Analysis updated successfully',
      analysis: updatedAnalysis
    });
  } catch (error) {
    console.error('Update analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadExcel,
  getUserUploads,
  getUploadById,
  saveAnalysis,
  getUserAnalyses,
  deleteUpload,
  deleteAnalysis,
  getAnalysisById,
  updateAnalysis
};