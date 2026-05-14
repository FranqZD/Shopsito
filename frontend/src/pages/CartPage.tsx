import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import CartLineItem, { formatPrice } from '../components/CartLineItem';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center" data-testid="empty-cart">
          <svg
            className="h-24 w-24 text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Your cart is empty</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Looks like you haven't added any products yet.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white
              transition duration-200 ease-in-out hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              dark:focus:ring-offset-gray-900"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>

      {/* Cart line items */}
      <div className="space-y-4" data-testid="cart-items">
        {items.map((item) => (
          <CartLineItem
            key={item.productId}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      {/* Cart total */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800" data-testid="cart-summary">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center gap-1 rounded text-sm text-indigo-600 transition duration-200 ease-in-out hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
