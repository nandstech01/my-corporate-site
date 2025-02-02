'use client';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        エラーが発生しました
      </h2>
      <p className="text-gray-600 mb-6">
        {error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
      >
        再試行
      </button>
    </div>
  );
} 