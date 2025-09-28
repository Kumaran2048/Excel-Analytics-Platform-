import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAnalysisById } from '../redux/excelSlice';
import Chart3D from '../components/Chart3D';

const Chart3DPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAnalysis, isLoading } = useSelector((state) => state.excel);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(getAnalysisById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentAnalysis && currentAnalysis.uploadId) {
      // Prepare data for 3D chart
      const uploadData = currentAnalysis.uploadId;
      setChartData({
        data: uploadData.data,
        xAxis: currentAnalysis.xAxis,
        yAxis: currentAnalysis.yAxis,
        zAxis: currentAnalysis.zAxis,
        chartType: currentAnalysis.chartType
      });
    }
  }, [currentAnalysis]);

  const handleDownload = () => {
    // Implement chart download functionality
    alert('3D chart download functionality would be implemented here');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!currentAnalysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Analysis not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            3D Visualization
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {currentAnalysis.uploadId?.originalName}
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          disabled={!chartData}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Chart
        </button>
      </div>

      {/* Chart Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {chartData ? (
          <Chart3D
            data={chartData.data}
            xAxis={chartData.xAxis}
            yAxis={chartData.yAxis}
            zAxis={chartData.zAxis}
            chartType={chartData.chartType}
          />
        ) : (
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
          </div>
        )}
      </div>

      {/* Analysis Details */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Analysis Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chart Type</p>
            <p className="font-medium text-gray-900 dark:text-white">{currentAnalysis.chartType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">X Axis</p>
            <p className="font-medium text-gray-900 dark:text-white">{currentAnalysis.xAxis}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Y Axis</p>
            <p className="font-medium text-gray-900 dark:text-white">{currentAnalysis.yAxis}</p>
          </div>
          {currentAnalysis.zAxis && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Z Axis</p>
              <p className="font-medium text-gray-900 dark:text-white">{currentAnalysis.zAxis}</p>
            </div>
          )}
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(currentAnalysis.createdAt).toLocaleString()}
            </p>
          </div>
          {currentAnalysis.summary && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Summary</p>
              <p className="font-medium text-gray-900 dark:text-white">{currentAnalysis.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chart3DPage;