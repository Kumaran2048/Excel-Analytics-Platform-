import React from 'react'

export function ExcelBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Excel header */}
      <div className="w-full h-12 bg-green-700 flex items-center px-4">
        <div className="text-white font-semibold">Excel Analytics Platform</div>
      </div>
      {/* Toolbar */}
      <div className="w-full h-10 bg-gray-100 border-b border-gray-300 flex items-center px-2">
        <div className="flex space-x-2">
          {[
            'File',
            'Home',
            'Insert',
            'Page Layout',
            'Formulas',
            'Data',
            'Review',
            'View',
          ].map((item) => (
            <div key={item} className="px-2 py-1 text-xs text-gray-700">
              {item}
            </div>
          ))}
        </div>
      </div>
      {/* Formula bar */}
      <div className="w-full h-8 bg-white border-b border-gray-300 flex items-center px-2">
        <div className="w-8 h-6 border border-gray-300 flex items-center justify-center text-xs mr-2">
          fx
        </div>
        <div className="flex-1 h-6 border border-gray-300"></div>
      </div>
      {/* Column headers */}
      <div className="flex">
        <div className="w-10 h-6 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center"></div>
        {Array.from({
          length: 20,
        }).map((_, i) => (
          <div
            key={i}
            className="w-20 h-6 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center text-xs text-gray-600"
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      {/* Spreadsheet rows */}
      {Array.from({
        length: 100,
      }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex">
          <div className="w-10 h-6 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center text-xs text-gray-600">
            {rowIndex + 1}
          </div>
          {Array.from({
            length: 20,
          }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="w-20 h-6 bg-white border-r border-b border-gray-300"
            ></div>
          ))}
        </div>
      ))}
    </div>
  )
}
export default ExcelBackground;