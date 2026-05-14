import type { CartItem } from '../stores/cartStore';

interface Props {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export default function CartLineItem({ item, onUpdateQuantity, onRemove }: Props) {
  const subtotal = Math.round(item.price * item.quantity * 100) / 100;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {/* Product image */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatPrice(item.price)}</p>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center gap-2">
          <label htmlFor={`qty-${item.productId}`} className="sr-only">
            Quantity for {item.name}
          </label>
          <button
            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label={`Decrease quantity of ${item.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600
              transition duration-200 ease-in-out hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500
              disabled:cursor-not-allowed disabled:opacity-50
              dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            −
          </button>
          <input
            id={`qty-${item.productId}`}
            type="number"
            min={1}
            max={item.stock}
            value={item.quantity}
            onChange={(e) => onUpdateQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
            className="h-8 w-12 rounded-md border border-gray-300 bg-white text-center text-sm
              transition duration-200 ease-in-out
              dark:border-gray-600 dark:bg-gray-700 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            aria-label={`Increase quantity of ${item.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600
              transition duration-200 ease-in-out hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500
              disabled:cursor-not-allowed disabled:opacity-50
              dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            +
          </button>
        </div>

        {/* Subtotal */}
        <p className="min-w-[5rem] text-right text-sm font-semibold text-gray-900 dark:text-white">
          {formatPrice(subtotal)}
        </p>

        {/* Remove button */}
        <button
          onClick={() => onRemove(item.productId)}
          aria-label={`Remove ${item.name} from cart`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400
            transition duration-200 ease-in-out hover:bg-red-50 hover:text-red-600
            focus:outline-none focus:ring-2 focus:ring-red-500
            dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export { formatPrice };
