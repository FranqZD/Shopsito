import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

export default function CartBadge() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <Link
      to="/cart"
      aria-label={`Shopping cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}
      className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-gray-600 transition duration-200
        hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-offset-gray-900"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
