import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Save, BarChart3, PieChart, LineChart, ScatterChart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { saveAnalysis } from '../redux/excelSlice';
import Chart2D from './Chart2D';
import Chart3D from './Chart3D';
import { motion, AnimatePresence } from 'framer-motion';

const ChartController = ({ uploadData, uploadId }) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [zAxis, setZAxis] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!uploadData || !uploadData.columns) {
    return (
      <motion.div 
        className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-gray-500 text-sm md:text-base">No data available for charting</p>
      </motion.div>
    );
  }

  const columns = uploadData.columns;
  const data = uploadData.data;

  const handleSaveAnalysis = async () => {
    if (!xAxis || !yAxis) {
      alert('Please select X and Y axes');
      return;
    }

    setIsSaving(true);
    
    const analysisData = {
      uploadId,
      chartType,
      xAxis,
      yAxis,
      zAxis: zAxis || undefined,
      options: { title },
      summary: `Analysis of ${yAxis} vs ${xAxis} using ${chartType} chart`
    };

    try {
      const result = await dispatch(saveAnalysis(analysisData)).unwrap();
      setIsSaving(false);
      
      if (chartType.startsWith('3d-')) {
        navigate(`/analysis/${result.analysis._id}`);
      } else {
        alert('Analysis saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save analysis:', error);
      setIsSaving(false);
      alert('Failed to save analysis. Please try again.');
    }
  };

  const downloadChart = () => {
    alert('Chart download functionality would be implemented here');
  };

  const getChartIcon = (type) => {
    switch (type) {
      case 'bar':
      case '3d-bar':
        return <BarChart3 className="h-4 w-4 mr-2" />;
      case 'line':
      case '3d-line':
        return <LineChart className="h-4 w-4 mr-2" />;
      case 'pie':
      case 'doughnut':
      case '3d-pie':
        return <PieChart className="h-4 w-4 mr-2" />;
      case 'scatter':
      case '3d-scatter':
        return <ScatterChart className="h-4 w-4 mr-2" />;
      default:
        return <BarChart3 className="h-4 w-4 mr-2" />;
    }
  };

  const is3DChart = chartType.startsWith('3d-');

  return (
    <motion.div 
      className="space-y-4 md:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4 flex items-center">
          {getChartIcon(chartType)}
          Chart Controls
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Chart Type</label>
            <motion.select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <optgroup label="2D Charts">
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
                <option value="scatter">Scatter Plot</option>
                <option value="radar">Radar Chart</option>
                <option value="polarArea">Polar Area Chart</option>
              </optgroup>
              <optgroup label="3D Charts">
                <option value="3d-bar">3D Bar Chart</option>
                <option value="3d-line">3D Line Chart</option>
                <option value="3d-scatter">3D Scatter Plot</option>
                <option value="3d-pie">3D Pie Chart</option>
              </optgroup>
            </motion.select>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">X Axis</label>
            <motion.select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <option value="">Select X Axis</option>
              {columns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </option>
              ))}
            </motion.select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Y Axis</label>
            <motion.select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <option value="">Select Y Axis</option>
              {columns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </option>
              ))}
            </motion.select>
          </motion.div>

          <AnimatePresence>
            {(chartType === '3d-scatter' || chartType === '3d-line') && (
              <motion.div 
                className="sm:col-span-2 lg:col-span-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Z Axis (3D)</label>
                <motion.select
                  value={zAxis}
                  onChange={(e) => setZAxis(e.target.value)}
                  className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <option value="">Select Z Axis</option>
                  {columns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name} ({col.type})
                    </option>
                  ))}
                </motion.select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          className="mb-3 md:mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">Chart Title</label>
          <motion.input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chart title"
            className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleSaveAnalysis}
            disabled={isSaving || !xAxis || !yAxis}
            className="flex items-center justify-center px-3 py-2 text-sm md:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {isSaving ? (
              <motion.div 
                className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Analysis'}
          </motion.button>
          <motion.button
            onClick={downloadChart}
            disabled={!xAxis || !yAxis}
            className="flex items-center justify-center px-3 py-2 text-sm md:text-base bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Chart
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div 
        className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Chart Preview</h3>
        
        <AnimatePresence mode="wait">
          {xAxis && yAxis ? (
            <motion.div
              key={`chart-${chartType}-${xAxis}-${yAxis}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              {is3DChart ? (
                <Chart3D
                  data={data}
                  xAxis={xAxis}
                  yAxis={yAxis}
                  zAxis={zAxis}
                  chartType={chartType}
                />
              ) : (
                <Chart2D
                  data={data}
                  chartType={chartType}
                  xAxis={xAxis}
                  yAxis={yAxis}
                  title={title}
                />
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="h-48 md:h-64 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base text-center px-2">
                Please select X and Y axes to generate chart
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {xAxis && yAxis && (
          <motion.div 
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-medium text-blue-800 dark:text-blue-300 text-sm md:text-base mb-1 md:mb-2">
              Chart Information
            </h3>
            <div className="text-xs md:text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <p>• Selected Chart: {chartType.replace('3d-', '3D ')}</p>
              <p>• X Axis: {xAxis}</p>
              <p>• Y Axis: {yAxis}</p>
              {zAxis && <p>• Z Axis: {zAxis}</p>}
              <p>• Data Points: {data.length}</p>
              {is3DChart && (
                <p>• Use {window.innerWidth < 768 ? 'touch' : 'mouse'} to interact with the 3D chart</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChartController;