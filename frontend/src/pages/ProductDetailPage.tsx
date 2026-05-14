import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../services/api';
import { useCartStore } from '../stores/cartStore';
import { toast } from '../utils/toast';
import type { Product } from '../components/ProductCard';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';
import ProductNotFound from '../components/ProductNotFound';
import ProductDetailError from '../components/ProductDetailError';

type LoadingState = 'loading' | 'success' | 'not-found' | 'error';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [state, setState] = useState<LoadingState>('loading');
  const addItem = useCartStore((s) => s.addItem);

  const fetchProduct = async () => {
    setState('loading');
    try {
      const response = await apiService.get<Product>(`/api/products/${id}`);
      setProduct(response.data);
      setState('success');
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        setState('not-found');
      } else {
        setState('error');
        toast.error('Failed to load product. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart`);
  };
  if (state === 'loading') return <ProductDetailSkeleton />;
  if (state === 'not-found') return <ProductNotFound />;
  if (state === 'error') return <ProductDetailError onRetry={fetchProduct} />;
  if (!product) return null;
  const formattedPrice = `$${product.price.toFixed(2)}`;
  const isOutOfStock = product.stock === 0;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link to="/products" className="rounded transition duration-200 ease-in-out hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:text-indigo-400">
              Catalog
            </Link>
          </li>
          <li aria-hidden="true">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li className="font-medium text-gray-900 dark:text-white" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product image */}
        <div className="overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center text-gray-400 dark:text-gray-500">
              <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <span className="mb-3 inline-block self-start rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {product.category}
          </span>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {product.name}
          </h1>

          <p className="mt-3 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {formattedPrice}
          </p>

          <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-300">
            {product.description}
          </p>

          {/* Stock info */}
          <div className="mt-6 flex items-center gap-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                Out of stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                {product.stock} in stock
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white
              transition duration-200 ease-in-out hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500
              dark:disabled:bg-gray-700 dark:disabled:text-gray-400 dark:focus:ring-offset-gray-900"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
