/**
 * Reusable pagination control component
 */
export const PaginationControls = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onGoToPage,
  isLoading = false,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8 mb-8">
      <button
        onClick={onPrevious}
        disabled={currentPage === 1 || isLoading}
        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>

      <div className="flex gap-2 items-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onGoToPage(page)}
            disabled={isLoading}
            className={`px-3 py-2 rounded ${
              currentPage === page
                ? 'bg-blue-700 text-white font-bold'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages || isLoading}
        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>

      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

/**
 * Simple "Load More" button component
 */
export const LoadMoreButton = ({ onClick, isLoading = false, disabled = false }) => {
  return (
    <div className="flex justify-center mt-8 mb-8">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="px-6 py-3 bg-blue-700 text-white rounded font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
};

export default PaginationControls;
