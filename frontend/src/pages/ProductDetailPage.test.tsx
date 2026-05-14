import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProductDetailPage from './ProductDetailPage';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock('../utils/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../stores/cartStore', () => ({
  useCartStore: vi.fn((selector) => {
    const state = { addItem: vi.fn() };
    return selector(state);
  }),
}));

import apiService from '../services/api';
import { toast } from '../utils/toast';
import { useCartStore } from '../stores/cartStore';

const mockProduct = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'High-quality wireless headphones with noise cancellation.',
  price: 79.99,
  stock: 15,
  imageUrl: 'https://placehold.co/600x600',
  category: 'electronics',
  categoryId: 1,
  createdBy: 1,
  createdAt: '2024-01-01T00:00:00Z',
};

function renderPage(productId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/products/${productId}`]}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products" element={<div>Catalog Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton loader while loading', () => {
    vi.mocked(apiService.get).mockImplementation(() => new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays product info after successful fetch', async () => {
    vi.mocked(apiService.get).mockResolvedValue({ data: mockProduct });
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Wireless Headphones' })).toBeInTheDocument();
    });

    expect(screen.getByText('$79.99')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('High-quality wireless headphones with noise cancellation.')).toBeInTheDocument();
    expect(screen.getByText('15 in stock')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://placehold.co/600x600');
  });

  it('formats price with $ and 2 decimal places', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { ...mockProduct, price: 10 },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('$10.00')).toBeInTheDocument();
    });
  });

  it('shows out-of-stock indicator and disables add-to-cart when stock is 0', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { ...mockProduct, stock: 0 },
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Out of stock')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /out of stock/i });
    expect(button).toBeDisabled();
  });

  it('shows 404 empty state when product not found', async () => {
    vi.mocked(apiService.get).mockRejectedValue({ response: { status: 404 } });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Product not found')).toBeInTheDocument();
    });

    expect(screen.getByText(/doesn't exist or has been removed/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to catalog/i })).toHaveAttribute('href', '/products');
  });

  it('shows error state with retry on server error', async () => {
    vi.mocked(apiService.get).mockRejectedValue({ response: { status: 500 } });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to load product. Please try again.');
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('retries fetch when retry button is clicked', async () => {
    vi.mocked(apiService.get)
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockResolvedValueOnce({ data: mockProduct });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Wireless Headphones' })).toBeInTheDocument();
    });
  });

  it('shows breadcrumb navigation with link to catalog', async () => {
    vi.mocked(apiService.get).mockResolvedValue({ data: mockProduct });
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    });

    const catalogLink = screen.getByRole('link', { name: 'Catalog' });
    expect(catalogLink).toHaveAttribute('href', '/products');
    expect(screen.getByRole('heading', { name: 'Wireless Headphones' })).toBeInTheDocument();
  });

  it('calls addItem on cart store when add-to-cart is clicked', async () => {
    const mockAddItem = vi.fn();
    vi.mocked(useCartStore).mockImplementation((selector) => selector({ addItem: mockAddItem }));
    vi.mocked(apiService.get).mockResolvedValue({ data: mockProduct });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Wireless Headphones' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(mockAddItem).toHaveBeenCalledWith({
      productId: 1,
      name: 'Wireless Headphones',
      price: 79.99,
      imageUrl: 'https://placehold.co/600x600',
      stock: 15,
    });
    expect(toast.success).toHaveBeenCalledWith('Wireless Headphones added to cart');
  });
});
