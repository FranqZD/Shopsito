interface Props {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function CatalogEmptyState({ hasFilters, onClearFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="empty-state">
      <svg className="h-24 w-24 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No products found</h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {hasFilters ? 'No products match your current filters.' : 'There are no products available at the moment.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
            transition duration-200 ease-in-out hover:bg-indigo-500 focus:outline-none focus:ring-2
            focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
