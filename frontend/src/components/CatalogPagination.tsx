interface Props {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export default function CatalogPagination({ currentPage, totalPages, onPrevPage, onNextPage }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-4"
      aria-label="Pagination"
      data-testid="pagination"
    >
      <button
        onClick={onPrevPage}
        disabled={currentPage === 0}
        aria-label="Previous page"
        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2
          text-sm font-medium text-gray-700 transition duration-200 ease-in-out hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <span className="text-sm text-gray-700 dark:text-gray-300" data-testid="page-indicator">
        Page {currentPage + 1} of {totalPages}
      </span>

      <button
        onClick={onNextPage}
        disabled={currentPage >= totalPages - 1}
        aria-label="Next page"
        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2
          text-sm font-medium text-gray-700 transition duration-200 ease-in-out hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
      >
        Next
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
