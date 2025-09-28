const express = require('express');
const { 
  uploadExcel, 
  getUserUploads, 
  getUploadById, 
  saveAnalysis, 
  getUserAnalyses,
  deleteUpload,
  deleteAnalysis,
  getAnalysisById,
  updateAnalysis
} = require('../controllers/excelController');
const { protect } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const router = express.Router();

// Apply protection to all routes
router.use(protect);

// File upload routes
router.post('/upload', upload.single('file'), handleMulterError, uploadExcel);
router.get('/uploads', getUserUploads);
router.get('/uploads/:id', getUploadById);
router.delete('/uploads/:id', deleteUpload);

// Analysis routes
router.post('/analyze', saveAnalysis);
router.get('/analyses', getUserAnalyses);
router.get('/analyses/:id', getAnalysisById);
router.put('/analyses/:id', updateAnalysis);
router.delete('/analyses/:id', deleteAnalysis);

module.exports = router;