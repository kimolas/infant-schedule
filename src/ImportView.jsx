import React, { useState } from 'react';
import Papa from 'papaparse';

const ImportView = ({ onImport, onCancel }) => {
  const [file, setFile] = useState(null);
  const [daysToConsider, setDaysToConsider] = useState(7);
  const [numNaps, setNumNaps] = useState(3);
  const [overnightStart, setOvernightStart] = useState('19:00');
  const [overnightEnd, setOvernightEnd] = useState('07:00');
  const [napMergeThreshold, setNapMergeThreshold] = useState(30);


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          onImport(results.data, { daysToConsider, numNaps, overnightStart, overnightEnd, napMergeThreshold });
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Import Huckleberry CSV</h3>
          <div className="mt-2 px-7 py-3">
            <input type="file" accept=".csv" onChange={handleFileChange} className="text-sm text-grey-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="daysToConsider" className="block text-sm font-medium text-gray-700">
              Days to Consider for Typical Day
            </label>
            <input
              type="number"
              name="daysToConsider"
              id="daysToConsider"
              value={daysToConsider}
              onChange={(e) => setDaysToConsider(parseInt(e.target.value, 10))}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="numNaps" className="block text-sm font-medium text-gray-700">
              Number of Naps
            </label>
            <input
              type="number"
              name="numNaps"
              id="numNaps"
              value={numNaps}
              onChange={(e) => setNumNaps(parseInt(e.target.value, 10))}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="overnightStart" className="block text-sm font-medium text-gray-700">
              Overnight Start
            </label>
            <input
              type="time"
              name="overnightStart"
              id="overnightStart"
              value={overnightStart}
              onChange={(e) => setOvernightStart(e.target.value)}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="overnightEnd" className="block text-sm font-medium text-gray-700">
              Overnight End
            </label>
            <input
              type="time"
              name="overnightEnd"
              id="overnightEnd"
              value={overnightEnd}
              onChange={(e) => setOvernightEnd(e.target.value)}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="napMergeThreshold" className="block text-sm font-medium text-gray-700">
              Nap Merge Threshold (minutes)
            </label>
            <input
              type="number"
              name="napMergeThreshold"
              id="napMergeThreshold"
              value={napMergeThreshold}
              onChange={(e) => setNapMergeThreshold(parseInt(e.target.value, 10))}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Import
            </button>
            <button
              onClick={onCancel}
              className="mt-3 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportView;
