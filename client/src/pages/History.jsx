import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  BarChart3, 
  Calendar, 
  Download, 
  Eye, 
  Trash2, 
  BarChart, 
  PieChart, 
  LineChart, 
  ScatterChart,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Image,
  Code
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserUploads, getUserAnalyses, deleteAnalysis, deleteUpload, getAnalysisById } from '../redux/excelSlice';
import Chart2D from '../components/Chart2D';
import Chart3D from '../components/Chart3D';

const History = () => {
  const [activeTab, setActiveTab] = useState('uploads');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  
  const { uploads, analyses, isLoading, pagination, currentAnalysis } = useSelector((state) => state.excel);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'uploads') {
      dispatch(getUserUploads({ page: currentPage, search: searchTerm }));
    } else {
      dispatch(getUserAnalyses());
    }
  }, [activeTab, currentPage, searchTerm, dispatch]);

  useEffect(() => {
    if (currentAnalysis && showAnalysisModal) {
      setSelectedAnalysis(currentAnalysis);
      setIsLoadingAnalysis(false);
    }
  }, [currentAnalysis, showAnalysisModal]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    if (activeTab === 'uploads') {
      dispatch(getUserUploads({ page: 1, search: searchTerm }));
    }
  };

  const handleViewAnalysis = async (analysisId) => {
    setIsLoadingAnalysis(true);
    try {
      await dispatch(getAnalysisById(analysisId)).unwrap();
      setShowAnalysisModal(true);
    } catch (error) {
      console.error('Failed to load analysis:', error);
      alert('Failed to load analysis. Please try again.');
      setIsLoadingAnalysis(false);
    }
  };

  const handleOpenInFullView = (analysisId) => {
    setShowAnalysisModal(false);
    navigate(`/analysis/${analysisId}`);
  };

  // Enhanced download function with PNG/PDF support
  const handleDownloadAnalysis = async (analysis, format = 'png') => {
    try {
      setDownloadingFormat(format);
      
      if (format === 'json') {
        // Download as JSON (existing functionality)
        const dataStr = JSON.stringify(analysis, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        const exportFileDefaultName = `analysis-${analysis._id}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        return;
      }

      // For PNG/PDF, we need to get the chart canvas
      let chartCanvas;
      
      // Try to find canvas in the modal first
      if (showAnalysisModal && selectedAnalysis?._id === analysis._id) {
        chartCanvas = document.querySelector('.analysis-modal canvas, .chart-container canvas, canvas');
      } else {
        // If modal not open, try general canvas search
        chartCanvas = document.querySelector('canvas');
      }

      if (!chartCanvas) {
        // If canvas not found, open the analysis in modal first
        if (!showAnalysisModal || selectedAnalysis?._id !== analysis._id) {
          await handleViewAnalysis(analysis._id);
          // Wait for chart to render
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Try to find canvas again
          chartCanvas = document.querySelector('.analysis-modal canvas, .chart-container canvas, canvas');
        }
      }

      if (chartCanvas) {
        if (format === 'png') {
          downloadChartAsPNG(chartCanvas, analysis);
        } else if (format === 'pdf') {
          await downloadChartAsPDF(chartCanvas, analysis);
        }
      } else {
        alert('Chart not available for download. Please try viewing the analysis first.');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Download as PNG
  const downloadChartAsPNG = (canvas, analysis) => {
    try {
      // Create a temporary canvas for higher quality
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      const scale = 2; // Higher resolution
      
      tempCanvas.width = canvas.width * scale;
      tempCanvas.height = canvas.height * scale;
      
      // Scale and draw the original canvas
      tempCtx.scale(scale, scale);
      tempCtx.drawImage(canvas, 0, 0);
      
      const link = document.createElement('a');
      link.download = `chart-${analysis._id}-${analysis.chartType}.png`;
      link.href = tempCanvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('PNG download failed:', error);
      // Fallback to original canvas
      const link = document.createElement('a');
      link.download = `chart-${analysis._id}-${analysis.chartType}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  // Download as PDF
  const downloadChartAsPDF = async (canvas, analysis) => {
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      
      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to maintain aspect ratio
      const canvasRatio = canvas.height / canvas.width;
      const imgWidth = pdfWidth - 40; // Margin
      const imgHeight = imgWidth * canvasRatio;
      
      // Center the image with some top margin for title
      const x = (pdfWidth - imgWidth) / 2;
      const y = 30;
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(`Analysis: ${analysis.uploadId?.originalName}`, pdfWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Chart Type: ${analysis.chartType.replace('3d-', '3D ')} | Created: ${new Date(analysis.createdAt).toLocaleString()}`, pdfWidth / 2, 22, { align: 'center' });
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`analysis-${analysis._id}-${analysis.chartType}.pdf`);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('PDF download failed. Please try again.');
    }
  };

  const handleDeleteAnalysis = (analysisId) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      dispatch(deleteAnalysis(analysisId));
    }
  };

  const handleDeleteUpload = (uploadId) => {
    if (window.confirm('Are you sure you want to delete this upload? All associated analyses will also be deleted.')) {
      dispatch(deleteUpload(uploadId));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getChartIcon = (chartType) => {
    switch (chartType) {
      case 'bar':
      case '3d-bar':
        return <BarChart className="h-4 w-4" />;
      case 'line':
      case '3d-line':
        return <LineChart className="h-4 w-4" />;
      case 'pie':
      case 'doughnut':
      case '3d-pie':
        return <PieChart className="h-4 w-4" />;
      case 'scatter':
      case '3d-scatter':
        return <ScatterChart className="h-4 w-4" />;
      case 'radar':
        return <BarChart3 className="h-4 w-4" />;
      case 'polarArea':
        return <PieChart className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const renderChartPreview = () => {
    if (!selectedAnalysis || !selectedAnalysis.uploadId?.data) {
      return (
        <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
        </div>
      );
    }

    const is3DChart = selectedAnalysis.chartType.startsWith('3d-');
    const chartData = selectedAnalysis.uploadId.data;

    if (is3DChart) {
      return (
        <div className="chart-3d">
          <Chart3D
            data={chartData}
            xAxis={selectedAnalysis.xAxis}
            yAxis={selectedAnalysis.yAxis}
            zAxis={selectedAnalysis.zAxis}
            chartType={selectedAnalysis.chartType}
          />
        </div>
      );
    } else {
      return (
        <div className="chart-2d">
          <Chart2D
            data={chartData}
            chartType={selectedAnalysis.chartType}
            xAxis={selectedAnalysis.xAxis}
            yAxis={selectedAnalysis.yAxis}
            title={`${selectedAnalysis.yAxis} vs ${selectedAnalysis.xAxis}`}
          />
        </div>
      );
    }
  };

  const renderAnalysisPreview = () => {
    if (!selectedAnalysis) return null;

    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Chart & File Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chart Details</h4>
            <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <p><span className="font-medium">Type:</span> {selectedAnalysis.chartType.replace('3d-', '3D ')}</p>
              <p><span className="font-medium">X-Axis:</span> {selectedAnalysis.xAxis}</p>
              <p><span className="font-medium">Y-Axis:</span> {selectedAnalysis.yAxis}</p>
              {selectedAnalysis.zAxis && (
                <p><span className="font-medium">Z-Axis:</span> {selectedAnalysis.zAxis}</p>
              )}
              <p><span className="font-medium">Created:</span> {new Date(selectedAnalysis.createdAt).toLocaleString()}</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File Information</h4>
            <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <p><span className="font-medium">Filename:</span> {selectedAnalysis.uploadId?.originalName}</p>
              <p><span className="font-medium">Rows:</span> {selectedAnalysis.uploadId?.rowCount}</p>
              <p><span className="font-medium">Columns:</span> {selectedAnalysis.uploadId?.columnCount}</p>
              <p><span className="font-medium">Uploaded:</span> {new Date(selectedAnalysis.uploadId?.createdAt).toLocaleDateString()}</p>
            </div>
          </motion.div>
        </div>

        {/* Summary */}
        {selectedAnalysis.summary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Summary</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              {selectedAnalysis.summary}
            </p>
          </motion.div>
        )}

        {/* Chart Preview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chart Preview</h4>
          <div className="chart-container">
            {renderChartPreview()}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
        >
          
          
          <div className="relative group">
            <button
              onClick={() => handleDownloadAnalysis(selectedAnalysis, 'png')}
              disabled={downloadingFormat}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center disabled:opacity-50"
            >
              {downloadingFormat ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
            
            {/* Download Options Dropdown */}
            <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleDownloadAnalysis(selectedAnalysis, 'png')}
                disabled={downloadingFormat === 'png'}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-50"
              >
                {downloadingFormat === 'png' ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-3"></div>
                ) : (
                  <Image className="h-4 w-4 mr-3" />
                )}
                Download as PNG
              </button>
              <button
                onClick={() => handleDownloadAnalysis(selectedAnalysis, 'pdf')}
                disabled={downloadingFormat === 'pdf'}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-50"
              >
                {downloadingFormat === 'pdf' ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-3"></div>
                ) : (
                  <FileText className="h-4 w-4 mr-3" />
                )}
                Download as PDF
              </button>
              <button
                onClick={() => handleDownloadAnalysis(selectedAnalysis, 'json')}
                disabled={downloadingFormat === 'json'}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-50"
              >
                {downloadingFormat === 'json' ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-3"></div>
                ) : (
                  <Code className="h-4 w-4 mr-3" />
                )}
                Download as JSON
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowAnalysisModal(false)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          History
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View your previous uploads and analyses
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['uploads', 'analyses'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Search */}
      {activeTab === 'uploads' && (
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search uploads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </form>
      )}

      {/* Content */}
      {isLoading ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </motion.div>
      ) : activeTab === 'uploads' ? (
        <>
          {/* Uploads List */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                File Uploads ({pagination.totalUploads})
              </h2>
            </div>
            <div className="p-6">
              {uploads.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {uploads.map((upload) => (
                      <motion.div
                        key={upload._id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {upload.originalName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {upload.rowCount} rows × {upload.columnCount} columns
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(upload.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                            {formatFileSize(upload.fileSize)}
                          </span>
                          <button
                            onClick={() => navigate(`/analyze/${upload._id}`)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center"
                            title="Create new analysis"
                          >
                            <BarChart3 className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Analyze</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUpload(upload._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 flex items-center"
                            title="Delete upload"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No uploads found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    {searchTerm ? 'Try a different search term' : 'Upload your first Excel file to get started'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </>
      ) : (
        
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Saved Analyses ({analyses.length})
            </h2>
          </div>
          <div className="p-6">
            {analyses.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {analyses.map((analysis) => (
                    <motion.div
                      key={analysis._id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          {getChartIcon(analysis.chartType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {analysis.uploadId?.originalName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {analysis.chartType.replace('3d-', '3D ')} chart - {analysis.xAxis} vs {analysis.yAxis}
                            {analysis.zAxis && ` vs ${analysis.zAxis}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </p>
                          {analysis.summary && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                              {analysis.summary}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewAnalysis(analysis._id)}
                          disabled={isLoadingAnalysis}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center disabled:opacity-50"
                          title="View analysis"
                        >
                          {isLoadingAnalysis ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                          ) : (
                            <Eye className="h-4 w-4 mr-1" />
                          )}
                          <span className="hidden sm:inline">View</span>
                        </button>
                        
                        {/* Enhanced Download Button with Dropdown */}
                        <div className="relative group">
                          <button
                            onClick={() => handleDownloadAnalysis(analysis, 'png')}
                            disabled={downloadingFormat}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center disabled:opacity-50"
                            title="Download analysis"
                          >
                            {downloadingFormat ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                            ) : (
                              <Download className="h-4 w-4 mr-1" />
                            )}
                            <span className="hidden sm:inline">Download</span>
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </button>
                          
                          {/* Download Options Dropdown */}
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button
                              onClick={() => handleDownloadAnalysis(analysis, 'png')}
                              disabled={downloadingFormat === 'png'}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-50"
                            >
                              {downloadingFormat === 'png' ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                              ) : (
                                <Image className="h-4 w-4 mr-2" />
                              )}
                              PNG
                            </button>
                            <button
                              onClick={() => handleDownloadAnalysis(analysis, 'pdf')}
                              disabled={downloadingFormat === 'pdf'}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-50"
                            >
                              {downloadingFormat === 'pdf' ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                              ) : (
                                <FileText className="h-4 w-4 mr-2" />
                              )}
                              PDF
                            </button>
                            <button
                              onClick={() => handleDownloadAnalysis(analysis, 'json')}
                              disabled={downloadingFormat === 'json'}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-50"
                            >
                              {downloadingFormat === 'json' ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                              ) : (
                                <Code className="h-4 w-4 mr-2" />
                              )}
                              JSON
                            </button>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteAnalysis(analysis._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 flex items-center"
                          title="Delete analysis"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No analyses found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Create your first analysis from an uploaded file
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Analysis Modal */}
      <AnimatePresence>
        {showAnalysisModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 analysis-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Analysis Preview
                </h2>
                <button
                  onClick={() => {
                    setShowAnalysisModal(false);
                    setSelectedAnalysis(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                {isLoadingAnalysis ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  renderAnalysisPreview()
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;