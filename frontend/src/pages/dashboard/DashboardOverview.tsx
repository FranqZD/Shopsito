import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { toast } from '../../utils/toast';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isDemo?: boolean;
  isError?: boolean;
}

function MetricCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="mt-4 h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

function MetricCard({ title, value, icon, isDemo, isError }: MetricCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition duration-200 hover:shadow-md dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        {isError ? (
          <span className="text-sm text-red-500 dark:text-red-400">Unavailable</span>
        ) : (
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        )}
        {isDemo && !isError && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Demo data
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await apiService.get<{ totalElements: number }>('/api/products', {
          params: { page: 0, size: 1 },
        });
        setTotalProducts(response.data.totalElements);
      } catch {
        setError(true);
        toast.error('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Welcome back! Here's a summary of your store.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Products"
              value={totalProducts}
              isError={error}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
            <MetricCard
              title="Total Sales"
              value="$12,450"
              isDemo
              isError={false}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <MetricCard
              title="Recent Orders"
              value={38}
              isDemo
              isError={false}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
