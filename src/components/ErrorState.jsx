import { Link } from 'react-router-dom';

/**
 * Error State Component
 * Displays user-friendly error messages with recovery options
 */
export const ErrorState = ({ 
  error = 'Something went wrong', 
  onRetry = null,
  showGoBack = true,
  showGoHome = true,
  title = 'Error'
}) => {
  // Extract error message from various error formats
  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mb-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            )}

            {showGoBack && (
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Go Back
              </button>
            )}

            {showGoHome && (
              <Link
                to="/"
                className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-center"
              >
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Inline Error Component
 * Smaller error display for use within pages
 */
export const InlineError = ({ 
  error = 'Something went wrong',
  onDismiss = null,
  onRetry = null 
}) => {
  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Error Content */}
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="ml-3 flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Empty State Component
 * Displays when no data is found
 */
export const EmptyState = ({ 
  title = 'No items found',
  message = 'There are no items to display',
  icon = 'inbox',
  action = null
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'search':
        return (
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'inbox':
      default:
        return (
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
    }
  };

  return (
    <div className="text-center py-12">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {message}
      </p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default ErrorState;
