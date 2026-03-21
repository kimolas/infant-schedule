import React from 'react';

const ConfirmImportView = ({ typicalDay, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Import</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Does this look like a typical day?
            </p>
            <ul className="mt-3 text-left">
              {typicalDay.map(event => (
                <li key={event.id} className="text-sm text-gray-700">
                  <strong>{event.title}</strong>: {event.start.toLocaleTimeString()} - {event.end.toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Confirm
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

export default ConfirmImportView;
