import { Link } from 'react-router-dom';
import type { Product } from '../../components/ProductCard';

interface Props {
  product: Product;
  onDelete: (product: Product) => void;
}

export default function ProductTableRow({ product, onDelete }: Props) {
  const formattedPrice = `$${product.price.toFixed(2)}`;

  return (
    <tr className="border-b border-gray-100 transition duration-150 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
        {product.name}
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
        {formattedPrice}
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
        {product.stock}
      </td>
      <td className="px-4 py-3">
        <span className="inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          {product.category}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Link
            to={`/dashboard/products/${product.id}/edit`}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition duration-200 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(product)}
            className="inline-flex items-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition duration-200 ease-in-out hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:focus:ring-offset-gray-800"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
