export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image skeleton */}
        <div className="aspect-square w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />

        {/* Info skeleton */}
        <div className="flex flex-col gap-4">
          <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
