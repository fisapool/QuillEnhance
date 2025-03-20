import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Processing Your Text'
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
        <div className="animate-spin mb-4 mx-auto">
          <Loader2 className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{message}</h3>
        <p className="text-gray-500 text-sm">Using advanced AI to enhance your writing...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
