import { useState } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import ChartController from '../components/ChartController';

const DataPreview = ({ uploadData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  if (!uploadData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <p className="text-gray-500">No data to preview</p>
      </div>
    );
  }

  const { columns, data, rowCount } = uploadData;
  const totalPages = Math.ceil(rowCount / rowsPerPage);
  const currentData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const downloadData = () => {
    const csvContent = [
      columns.map(col => col.name).join(','),
      ...data.map(row => columns.map(col => row[col.name]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data_preview.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Data Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Data Preview ({rowCount} rows × {columns.length} columns)
          </h2>
          <button
            onClick={downloadData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.name}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {column.name}
                      <span className="ml-1 text-xs text-gray-400">({column.type})</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentData.map((row, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td
                        key={column.name}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                      >
                        {row[column.name] !== null && row[column.name] !== undefined
                          ? String(row[column.name])
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Controller */}
      <ChartController uploadData={uploadData} uploadId={uploadData.id} />
    </div>
  );
};

export default DataPreview;