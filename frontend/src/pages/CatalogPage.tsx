import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import ProductCard, { type Product } from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import CatalogFilters from '../components/CatalogFilters';
import CatalogPagination from '../components/CatalogPagination';
import CatalogEmptyState from '../components/CatalogEmptyState';
import { toast } from '../utils/toast';

interface PaginatedResponse {
  content: Product[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchProducts = useCallback(async (page: number, searchTerm: string, categoryFilter: string) => {
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, string | number> = { page, size: 12 };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;

      const response = await apiService.get<PaginatedResponse>('/api/products', { params });
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch {
      setError(true);
      toast.error('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, search, category);
  }, [currentPage, search, category, fetchProducts]);

  const handleAddToCart = async (product: Product) => {
    try {
      const cartModule = await import('../stores/cartStore');
      cartModule.useCartStore.getState().addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
      });
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.info('Cart functionality coming soon');
    }
  };

  const handleSearchChange = (newSearch: string) => { setSearch(newSearch); setCurrentPage(0); };
  const handleCategoryChange = (newCategory: string) => { setCategory(newCategory); setCurrentPage(0); };
  const handleClearFilters = () => { setSearch(''); setCategory(''); setCurrentPage(0); };

  const isEmpty = !loading && !error && products.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Catalog</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Browse our collection of products</p>
      </header>

      <div className="mb-6" data-testid="search-filter-area">
        <CatalogFilters onSearchChange={handleSearchChange} onCategoryChange={handleCategoryChange} />
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="skeleton-grid">
          {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}

      {isEmpty && <CatalogEmptyState hasFilters={!!(search || category)} onClearFilters={handleClearFilters} />}

      {error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="error-state">
          <svg className="h-24 w-24 text-red-300 dark:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">We couldn't load the products. Please try again.</p>
          <button
            onClick={() => fetchProducts(currentPage, search, category)}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition duration-200 ease-in-out
              hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && (
        <CatalogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={() => setCurrentPage((p) => Math.max(0, p - 1))}
          onNextPage={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
        />
      )}
    </div>
  );
}

export type { PaginatedResponse };
