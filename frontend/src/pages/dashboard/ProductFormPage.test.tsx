import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductFormPage from './ProductFormPage';
import { validateField } from './productFormValidation';

// Mock API service
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('../../utils/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

import apiService from '../../services/api';

function renderForm(route = '/dashboard/products/new') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/dashboard/products/new" element={<ProductFormPage />} />
        <Route path="/dashboard/products/:id/edit" element={<ProductFormPage />} />
        <Route path="/dashboard/products" element={<div>Product List</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProductFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiService.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [{ id: 1, name: 'electronics' }, { id: 2, name: 'clothing' }],
    });
  });

  it('renders create form with correct heading', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create Product' })).toBeInTheDocument();
    });
  });

  it('renders edit form with correct heading when id param present', async () => {
    (apiService.get as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'electronics' }] })
      .mockResolvedValueOnce({
        data: { name: 'Test', description: 'Desc', price: 10, stock: 5, categoryId: 1, imageUrl: '' },
      });
    renderForm('/dashboard/products/1/edit');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Edit Product' })).toBeInTheDocument();
    });
  });

  it('shows validation errors on blur for empty fields', async () => {
    renderForm();
    await waitFor(() => expect(screen.getByLabelText('Product Name')).toBeInTheDocument());

    const nameInput = screen.getByLabelText('Product Name');
    fireEvent.blur(nameInput);
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('shows category dropdown with fetched categories', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByText('electronics')).toBeInTheDocument();
      expect(screen.getByText('clothing')).toBeInTheDocument();
    });
  });
});

describe('validateField', () => {
  describe('name', () => {
    it('returns error for empty name', () => {
      expect(validateField('name', '')).toBe('Name is required');
    });
    it('returns error for name over 150 chars', () => {
      expect(validateField('name', 'a'.repeat(151))).toBe('Name must be 150 characters or less');
    });
    it('returns undefined for valid name', () => {
      expect(validateField('name', 'Valid Product')).toBeUndefined();
    });
  });

  describe('description', () => {
    it('returns error for empty description', () => {
      expect(validateField('description', '')).toBe('Description is required');
    });
    it('returns error for description over 2000 chars', () => {
      expect(validateField('description', 'a'.repeat(2001))).toBe('Description must be 2000 characters or less');
    });
    it('returns undefined for valid description', () => {
      expect(validateField('description', 'A good product')).toBeUndefined();
    });
  });

  describe('price', () => {
    it('returns error for empty price', () => {
      expect(validateField('price', '')).toBe('Price is required');
    });
    it('returns error for price below 0.01', () => {
      expect(validateField('price', '0')).toBe('Price must be at least 0.01');
    });
    it('returns error for price above max', () => {
      expect(validateField('price', '9999999999')).toBe('Price must be at most 999,999,999.99');
    });
    it('returns undefined for valid price', () => {
      expect(validateField('price', '29.99')).toBeUndefined();
    });
  });

  describe('stock', () => {
    it('returns error for empty stock', () => {
      expect(validateField('stock', '')).toBe('Stock is required');
    });
    it('returns error for negative stock', () => {
      expect(validateField('stock', '-1')).toBe('Stock must be at least 0');
    });
    it('returns error for stock above max', () => {
      expect(validateField('stock', '1000000')).toBe('Stock must be at most 999,999');
    });
    it('returns undefined for valid stock', () => {
      expect(validateField('stock', '100')).toBeUndefined();
    });
    it('returns undefined for zero stock', () => {
      expect(validateField('stock', '0')).toBeUndefined();
    });
  });

  describe('categoryId', () => {
    it('returns error for empty category', () => {
      expect(validateField('categoryId', '')).toBe('Category is required');
    });
    it('returns undefined for valid category', () => {
      expect(validateField('categoryId', '1')).toBeUndefined();
    });
  });

  describe('imageFile', () => {
    it('returns undefined for null (no file)', () => {
      expect(validateField('imageFile', null)).toBeUndefined();
    });
    it('returns error for unsupported file type', () => {
      const file = new File(['data'], 'test.gif', { type: 'image/gif' });
      expect(validateField('imageFile', file)).toBe('Image must be JPEG, PNG, or WebP');
    });
    it('returns error for file over 5MB', () => {
      const file = new File([new ArrayBuffer(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
      expect(validateField('imageFile', file)).toBe('Image must be 5MB or less');
    });
    it('returns undefined for valid JPEG file', () => {
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
      expect(validateField('imageFile', file)).toBeUndefined();
    });
    it('returns undefined for valid PNG file', () => {
      const file = new File(['data'], 'photo.png', { type: 'image/png' });
      expect(validateField('imageFile', file)).toBeUndefined();
    });
    it('returns undefined for valid WebP file', () => {
      const file = new File(['data'], 'photo.webp', { type: 'image/webp' });
      expect(validateField('imageFile', file)).toBeUndefined();
    });
  });
});
