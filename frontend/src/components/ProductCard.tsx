import { Link } from 'react-router-dom';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  categoryId: number;
  createdBy: number;
  createdAt: string;
}

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const formattedPrice = `$${product.price.toFixed(2)}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200
      transition duration-200 ease-in-out hover:scale-[1.02] hover:shadow-md dark:bg-gray-800 dark:ring-gray-700">
      <Link to={`/products/${product.id}`} className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        {/* Image — 4:3 aspect ratio */}
        <div className="relative w-full overflow-hidden bg-gray-100 pb-[75%] dark:bg-gray-700">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition duration-200 ease-in-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex flex-1 flex-col p-4">
          <span className="mb-1 inline-block self-start rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium
            text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {product.category}
          </span>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{product.name}</h3>
          <p className="mt-auto pt-3 text-base font-bold text-indigo-600 dark:text-indigo-400">{formattedPrice}</p>
        </div>
      </Link>

      {/* Quick-add-to-cart — visible on hover */}
      {onAddToCart && (
        <div className="absolute bottom-4 right-4 opacity-0 transition duration-200 ease-in-out group-hover:opacity-100">
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
            disabled={product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md
              transition duration-200 ease-in-out hover:bg-indigo-500 focus:outline-none focus:ring-2
              focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
              dark:focus:ring-offset-gray-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
