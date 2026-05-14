import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../../utils/toast';
import type { Product } from '../../components/ProductCard';
import ProductTableSkeleton from './ProductTableSkeleton';
import ProductTableRow from './ProductTableRow';
import DeleteConfirmModal from './DeleteConfirmModal';

interface PaginatedResponse {
  content: Product[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await apiService.get<PaginatedResponse>('/api/products', {
          params: { page: 0, size: 100 },
        });
        const sellerProducts = response.data.content.filter(
          (p) => p.createdBy === user?.id
        );
        setProducts(sellerProducts);
      } catch {
        toast.error('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user?.id]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const handleDeleteCancel = () => {
    setProductToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await apiService.delete(`/api/products/${productToDelete.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success(`"${productToDelete.name}" deleted successfully.`);
      setProductToDelete(null);
    } catch {
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isEmpty = !loading && products.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your product inventory</p>
        </div>
        <Link to="/dashboard/products/new" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition duration-200 ease-in-out hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      <div className="mt-6">
        {loading && <ProductTableSkeleton />}

        {!loading && products.length > 0 && (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Price</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Stock</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Category</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <svg className="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No products yet
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first product.
            </p>
            <Link
              to="/dashboard/products/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition duration-200 ease-in-out hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Product
            </Link>
          </div>
        )}
      </div>

      {productToDelete && (
        <DeleteConfirmModal
          productName={productToDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
