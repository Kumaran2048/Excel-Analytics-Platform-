import { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadExcel, clearError, clearCurrentUpload } from '../redux/excelSlice';
import DataPreview from './DataPreview';
import { motion, AnimatePresence } from 'framer-motion';

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const { isLoading, error, currentUpload } = useSelector((state) => state.excel);
  const dispatch = useDispatch();

  const handleFileSelect = (selectedFile) => {
    setFileError('');
    if (!selectedFile) return;

    const validExtensions = ['.xls', '.xlsx', '.csv'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setFileError('Please select a valid Excel file (.xls, .xlsx, .csv)');
      return;
    }

    const maxSize = 20 * 1024 * 1024; 
    if (selectedFile.size > maxSize) {
      setFileError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    if (selectedFile.size === 0) {
      setFileError('File is empty');
      return;
    }

    setFile(selectedFile);
    dispatch(clearError());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setFileError('');
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await dispatch(uploadExcel(file)).unwrap();
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      clearInterval(interval);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError('');
    setUploadProgress(0);
    dispatch(clearCurrentUpload());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Excel File
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your Excel file to start analyzing data. Supported formats: .xls, .xlsx, .csv
        </p>
      </motion.div>

      {(error || fileError) && (
        <motion.div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error || fileError}</span>
        </motion.div>
      )}

      {!currentUpload ? (
        <div className="space-y-6">
          <motion.div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragOver
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence>
              {file ? (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center justify-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <FileText className="h-12 w-12 text-blue-600 flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Ready to upload
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      disabled={isLoading}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {uploadProgress > 0 && (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="bg-blue-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadProgress}% uploaded
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpload}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      'Upload File'
                    )}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">or</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBrowseClick}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Browse files
                  </motion.button>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                    className="sr-only"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Maximum file size: 20MB • Supported formats: XLS, XLSX, CSV
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        <DataPreview uploadData={currentUpload} />
      )}
    </div>
  );
};

export default ExcelUpload;
