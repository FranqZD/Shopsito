import type { ProductFormData } from './useProductForm';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateField(field: keyof ProductFormData, value: string | File | null): string | undefined {
  switch (field) {
    case 'name':
      if (!value || (value as string).trim().length === 0) return 'Name is required';
      if ((value as string).length > 150) return 'Name must be 150 characters or less';
      return undefined;
    case 'description':
      if (!value || (value as string).trim().length === 0) return 'Description is required';
      if ((value as string).length > 2000) return 'Description must be 2000 characters or less';
      return undefined;
    case 'price': {
      const num = parseFloat(value as string);
      if (!value || isNaN(num)) return 'Price is required';
      if (num < 0.01) return 'Price must be at least 0.01';
      if (num > 999999999.99) return 'Price must be at most 999,999,999.99';
      return undefined;
    }
    case 'stock': {
      const num = parseInt(value as string, 10);
      if (value === '' || value === null || value === undefined) return 'Stock is required';
      if (isNaN(num) || !Number.isInteger(num)) return 'Stock must be a whole number';
      if (num < 0) return 'Stock must be at least 0';
      if (num > 999999) return 'Stock must be at most 999,999';
      return undefined;
    }
    case 'categoryId':
      if (!value) return 'Category is required';
      return undefined;
    case 'imageFile': {
      if (!value) return undefined;
      const file = value as File;
      if (!ACCEPTED_TYPES.includes(file.type)) return 'Image must be JPEG, PNG, or WebP';
      if (file.size > MAX_FILE_SIZE) return 'Image must be 5MB or less';
      return undefined;
    }
    default:
      return undefined;
  }
}
