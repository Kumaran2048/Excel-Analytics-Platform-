const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create a safe filename: timestamp-randomnumber-originalname
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1E9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${timestamp}-${randomNum}-${originalName}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file extension first (more reliable than MIME types)
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.xls', '.xlsx', '.csv'];
  
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Only Excel files (.xls, .xlsx, .csv) are allowed'), false);
  }

  // Also check MIME types but be more permissive since browsers report different types
  const allowedMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.template.macroEnabled.12',
    'application/vnd.ms-excel.addin.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    'text/csv',
    'text/plain', // Some browsers report CSV as text/plain
    'application/octet-stream', // Fallback for some Excel files
    'application/csv', // Alternative CSV type
    'application/x-csv' // Another alternative CSV type
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // If MIME type doesn't match but extension is valid, still allow it
    // This handles cases where browsers report incorrect MIME types
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload Excel or CSV files only'), false);
    }
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 20 * 1024 * 1024 // 20MB limit
  },
  fileFilter: fileFilter
});

// Error handling middleware for Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 20MB' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Unexpected field' 
      });
    }
  }
  
  if (err.message) {
    return res.status(400).json({ 
      message: err.message 
    });
  }
  
  next(err);
};

module.exports = { upload, handleMulterError };