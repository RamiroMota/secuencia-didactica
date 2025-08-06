import React from 'react';

const LoadingModal = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">Cargando...</p>
      </div>
    </div>
  );
};

export default LoadingModal;