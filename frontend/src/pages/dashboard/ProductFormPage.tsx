import { Link } from 'react-router-dom';
import { useProductForm } from './useProductForm';
import ProductFormFields from './ProductFormFields';

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      {[...Array(6)].map((_, i) => (
        <div key={i}>
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

export default function ProductFormPage() {
  const {
    formData, errors, touched, categories, loading, fetching, isEdit,
    handleChange, handleBlur, handleSubmit,
  } = useProductForm();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          to="/dashboard/products"
          className="text-sm font-medium text-indigo-600 transition duration-200 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back to Products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Product' : 'Create Product'}
        </h1>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
        {fetching ? (
          <FormSkeleton />
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            noValidate
            className="space-y-6"
          >
            <ProductFormFields
              formData={formData} errors={errors} touched={touched}
              categories={categories} onChange={handleChange} onBlur={handleBlur}
            />

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit" disabled={loading}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white
                  transition duration-200 ease-in-out hover:bg-indigo-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-800"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
              <Link
                to="/dashboard/products"
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700
                  transition duration-200 ease-in-out hover:bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
