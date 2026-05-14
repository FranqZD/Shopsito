function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700">
      <td className="px-4 py-3">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </td>
    </tr>
  );
}

export default function ProductTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Price</th>
            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Stock</th>
            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Category</th>
            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
