export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 animate-pulse">
      <div className="w-full bg-gray-200 pb-[75%] dark:bg-gray-700" />
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="h-4 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-700 mt-auto" />
      </div>
    </div>
  );
}
