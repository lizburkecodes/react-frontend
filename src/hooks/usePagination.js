import { useState, useCallback } from 'react';

/**
 * Hook for managing paginated data fetching
 * @param {Function} fetchFunction - Function that takes page and limit params and returns paginated data
 * @param {number} initialLimit - Items per page (default: 20)
 * @returns {Object} Pagination state and methods
 */
export const usePagination = (fetchFunction, initialLimit = 20) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(
    async (page = 1, filters = {}) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchFunction({
          page,
          limit,
          ...filters,
        });

        setData(response.data);
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
        setCurrentPage(response.pagination.page);
      } catch (err) {
        setError(err);
        console.error('Pagination fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFunction, limit]
  );

  const goToPage = useCallback(
    (page) => {
      fetch(page);
    },
    [fetch]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  return {
    data,
    isLoading,
    error,
    currentPage,
    totalPages,
    total,
    limit,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    fetch,
  };
};

export default usePagination;
