import type { ProductFormData, FormErrors, Category } from './useProductForm';

interface Props {
  formData: ProductFormData;
  errors: FormErrors;
  touched: Record<string, boolean>;
  categories: Category[];
  onChange: (field: keyof ProductFormData, value: string | File | null) => void;
  onBlur: (field: keyof ProductFormData) => void;
}

const inputClass = (hasError: boolean) =>
  `mt-1 block w-full rounded-lg border px-4 py-2.5 text-sm transition duration-200 ease-in-out
   focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
     hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
   }`;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>;
}

export default function ProductFormFields({ formData, errors, touched, categories, onChange, onBlur }: Props) {
  const showError = (field: keyof FormErrors) => touched[field] && errors[field];

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Product Name
        </label>
        <input
          id="name" type="text" value={formData.name} maxLength={150}
          onChange={(e) => onChange('name', e.target.value)} onBlur={() => onBlur('name')}
          className={inputClass(!!showError('name'))}
          aria-invalid={!!showError('name')} aria-describedby={showError('name') ? 'name-error' : undefined}
        />
        <FieldError id="name-error" message={showError('name') ? errors.name : undefined} />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description" rows={4} value={formData.description} maxLength={2000}
          onChange={(e) => onChange('description', e.target.value)} onBlur={() => onBlur('description')}
          className={inputClass(!!showError('description'))}
          aria-invalid={!!showError('description')} aria-describedby={showError('description') ? 'desc-error' : undefined}
        />
        <FieldError id="desc-error" message={showError('description') ? errors.description : undefined} />
      </div>

      {/* Price & Stock row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Price ($)
          </label>
          <input
            id="price" type="number" step="0.01" min="0.01" max="999999999.99"
            value={formData.price} onChange={(e) => onChange('price', e.target.value)}
            onBlur={() => onBlur('price')} className={inputClass(!!showError('price'))}
            aria-invalid={!!showError('price')} aria-describedby={showError('price') ? 'price-error' : undefined}
          />
          <FieldError id="price-error" message={showError('price') ? errors.price : undefined} />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Stock
          </label>
          <input
            id="stock" type="number" step="1" min="0" max="999999"
            value={formData.stock} onChange={(e) => onChange('stock', e.target.value)}
            onBlur={() => onBlur('stock')} className={inputClass(!!showError('stock'))}
            aria-invalid={!!showError('stock')} aria-describedby={showError('stock') ? 'stock-error' : undefined}
          />
          <FieldError id="stock-error" message={showError('stock') ? errors.stock : undefined} />
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          id="categoryId" value={formData.categoryId}
          onChange={(e) => onChange('categoryId', e.target.value)} onBlur={() => onBlur('categoryId')}
          className={inputClass(!!showError('categoryId'))}
          aria-invalid={!!showError('categoryId')} aria-describedby={showError('categoryId') ? 'cat-error' : undefined}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <FieldError id="cat-error" message={showError('categoryId') ? errors.categoryId : undefined} />
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Image URL (optional)
        </label>
        <input
          id="imageUrl" type="url" value={formData.imageUrl}
          onChange={(e) => onChange('imageUrl', e.target.value)}
          placeholder="https://example.com/image.jpg"
          className={inputClass(false)}
        />
      </div>

      {/* Image File Upload */}
      <div>
        <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Or upload an image (JPEG, PNG, WebP — max 5MB)
        </label>
        <input
          id="imageFile" type="file" accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onChange('imageFile', e.target.files?.[0] || null)}
          onBlur={() => onBlur('imageFile')}
          className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2
            file:text-sm file:font-semibold file:text-indigo-700 file:transition file:duration-200
            hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
          aria-invalid={!!showError('imageFile')} aria-describedby={showError('imageFile') ? 'img-error' : undefined}
        />
        <FieldError id="img-error" message={showError('imageFile') ? errors.imageFile : undefined} />
        {formData.imageFile && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Selected: {formData.imageFile.name}
          </p>
        )}
      </div>
    </div>
  );
}
