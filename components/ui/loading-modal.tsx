import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface LoadingModalProps {
  message?: string;
  status?: 'loading' | 'success' | 'error';
}

const LoadingModal = ({ message = "Cargando...", status = "loading" }: LoadingModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 min-w-[320px]">
        {status === "loading" && (
          <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
        )}
        {status === "success" && (
          <CheckCircle className="h-16 w-16 text-green-500" />
        )}
        {status === "error" && (
          <AlertCircle className="h-16 w-16 text-red-500" />
        )}
        <p className="mt-4 text-lg font-semibold text-gray-700 text-center">{message}</p>
      </div>
    </div>
  );
};

export default LoadingModal;