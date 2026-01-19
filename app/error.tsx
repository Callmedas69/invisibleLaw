'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
