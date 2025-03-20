
import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-4 border rounded-md bg-red-50 dark:bg-red-900/10">
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">Something went wrong</h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 dark:bg-red-800 dark:text-red-100"
      >
        Try again
      </button>
    </div>
  );
}
