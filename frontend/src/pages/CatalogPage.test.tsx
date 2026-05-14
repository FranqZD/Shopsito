import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CatalogPage from './CatalogPage';

// Mock the api service
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock toast
vi.mock('../utils/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

import apiService from '../services/api';
import { toast } from '../utils/toast';

const mockCategories = [
  { id: 1, name: 'electronics' },
  { id: 2, name: 'clothing' },
  { id: 3, name: 'home' },
];

const mockProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    description: 'Description 1',
    price: 29.99,
    stock: 10,
    imageUrl: 'https://placehold.co/400x300',
    category: 'electronics',
    categoryId: 1,
    createdBy: 1,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Test Product 2',
    description: 'Description 2',
    price: 49.99,
    stock: 5,
    imageUrl: 'https://placehold.co/400x300',
    category: 'clothing',
    categoryId: 2,
    createdBy: 1,
    createdAt: '2024-01-02T00:00:00Z',
  },
];

function renderCatalogPage() {
  return render(
    <MemoryRouter>
      <CatalogPage />
    </MemoryRouter>
  );
}

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows 12 skeleton loaders while loading', () => {
    vi.mocked(apiService.get).mockImplementation((url: string) => {
      if (url === '/api/categories') return Promise.resolve({ data: mockCategories });
      return new Promise(() => {}); // products never resolves
    });
    renderCatalogPage();
    const skeletonGrid = screen.getByTestId('skeleton-grid');
    expect(skeletonGrid.children).toHaveLength(12);
  });

  it('renders product grid after successful fetch', async () => {
    vi.mocked(apiService.get).mockImplementation((url: string) => {
      if (url === '/api/categories') return Promise.resolve({ data: mockCategories });
      return Promise.resolve({
        data: { content: mockProducts, totalPages: 1, totalElements: 2, currentPage: 0 },
      });
    });

    renderCatalogPage();

    await waitFor(() => {
      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
  });

  it('shows empty state when no products returned', async () => {
    vi.mocked(apiService.get).mockImplementation((url: string) => {
      if (url === '/api/categories') return Promise.resolve({ data: mockCategories });
      return Promise.resolve({
        data: { content: [], totalPages: 0, totalElements: 0, currentPage: 0 },
      });
    });

    renderCatalogPage();

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  it('shows error state and toast on fetch failure', async () => {
    vi.mocked(apiService.get).mockImplementation((url: string) => {
      if (url === '/api/categories') return Promise.resolve({ data: mockCategories });
      return Promise.reject(new Error('Network error'));
    });

    renderCatalogPage();

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to load products. Please try again.');
  });

  it('shows pagination controls when multiple pages exist', async () => {
    vi.mocked(apiService.get).mockImplementation((url: string) => {
      if (url === '/api/categories') return Promise.resolve({ data: mockCategories });
      return Promise.resolve({
        data: { content: mockProducts, totalPages: 3, totalElements: 30, currentPage: 0 },
      });
    });

    renderCatalogPage();

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    expect(screen.getByTestId('page-indicator')).toHaveTextContent('Page 1 of 3');
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).not.toBeDisabled();
  });

  it('navigates to next page when Next button is clicked', async () => {
    const user = userEvent.setup();
    let productCallCount = 0;

    vi.mocked(apiService.get).mockImplementation((url: string) => {
      if (url === '/api/categories') return Promise.resolve({ data: mockCategories });
      productCallCount++;
      if (productCallCount === 1) {
        return Promise.resolve({
          data: { content: mockProducts, totalPages: 3, totalElements: 30, currentPage: 0 },
        });
      }
      return Promise.resolve({
        data: { content: mockProducts, totalPages: 3, totalElements: 30, currentPage: 1 },
      });
    });

    renderCatalogPage();

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Next page'));

    await waitFor(() => {
      expect(screen.getByTestId('page-indicator')).toHaveTextContent('Page 2 of 3');
    });
  });

  it('does not show pagination when only one page', async () => {
    vi.mocked(apiService.get).mockImplementation((url: string) => {
      if (url === '/api/categories') return Promise.resolve({ data: mockCategories });
      return Promise.resolve({
        data: { content: mockProducts, totalPages: 1, totalElements: 2, currentPage: 0 },
      });
    });

    renderCatalogPage();

    await waitFor(() => {
      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('has responsive grid classes (1 col mobile, 2 cols tablet @768px, 3-4 cols desktop @1024px+)', async () => {
    vi.mocked(apiService.get).mockImplementation((url: string) => {
      if (url === '/api/categories') return Promise.resolve({ data: mockCategories });
      return Promise.resolve({
        data: { content: mockProducts, totalPages: 1, totalElements: 2, currentPage: 0 },
      });
    });

    renderCatalogPage();

    await waitFor(() => {
      const grid = screen.getByTestId('product-grid');
      expect(grid.className).toContain('grid-cols-1');
      expect(grid.className).toContain('md:grid-cols-2');
      expect(grid.className).toContain('lg:grid-cols-3');
      expect(grid.className).toContain('xl:grid-cols-4');
    });
  });
});
