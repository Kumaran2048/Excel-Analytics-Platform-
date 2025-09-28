import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUploadById } from '../redux/excelSlice';
import ChartController from '../components/ChartController';

const AnalyticsPage = () => {
  const { id } = useParams();
  const { currentUpload, isLoading } = useSelector((state) => state.excel);
  const dispatch = useDispatch();

  useEffect(() => {
    if (id) {
      dispatch(getUploadById(id));
    }
  }, [id, dispatch]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!currentUpload) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Data Analysis: {currentUpload.originalName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create charts and analyze your data
        </p>
      </div>

      <ChartController uploadData={currentUpload} uploadId={currentUpload._id} />
    </div>
  );
};

export default AnalyticsPage;