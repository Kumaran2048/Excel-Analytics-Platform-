import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getUploadById } from '../redux/excelSlice';
import ChartController from '../components/ChartController';

const ChartControllerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUpload, isLoading } = useSelector((state) => state.excel);

  useEffect(() => {
    if (id) {
      dispatch(getUploadById(id));
    }
  }, [id, dispatch]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!currentUpload) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Upload not found</p>
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
            Create Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {currentUpload.originalName}
          </p>
        </div>

        <div className="w-24"></div> {/* Spacer for alignment */}
      </div>

      {/* Chart Controller */}
      <ChartController uploadData={currentUpload} uploadId={currentUpload._id} />
    </div>
  );
};

export default ChartControllerPage;