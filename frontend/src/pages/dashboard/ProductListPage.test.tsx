import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProductListPage from './ProductListPage';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock('../../utils/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn((selector) =>
    selector({
      token: 'fake-token',
      user: { id: 1, name: 'Test Seller', email: 'test@test.com', role: 'SELLER' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    })
  ),
}));

import apiService from '../../services/api';
import { toast } from '../../utils/toast';

const mockProducts = [
  { id: 1, name: 'Widget A', description: 'Desc', price: 19.99, stock: 50, imageUrl: '', category: 'electronics', categoryId: 1, createdBy: 1, createdAt: '2024-01-01' },
  { id: 2, name: 'Widget B', description: 'Desc', price: 29.5, stock: 10, imageUrl: '', category: 'clothing', categoryId: 2, createdBy: 1, createdAt: '2024-01-02' },
  { id: 3, name: 'Other Seller Product', description: 'Desc', price: 9.99, stock: 5, imageUrl: '', category: 'home', categoryId: 3, createdBy: 99, createdAt: '2024-01-03' },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductListPage />
    </MemoryRouter>
  );
}

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton loaders while loading', () => {
    vi.mocked(apiService.get).mockImplementation(() => new Promise(() => {}));
    renderPage();
    const pulsingElements = document.querySelectorAll('.animate-pulse');
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  it('displays only products belonging to the authenticated seller', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { content: mockProducts, totalPages: 1, totalElements: 3, currentPage: 0 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    expect(screen.getByText('Widget B')).toBeInTheDocument();
    expect(screen.queryByText('Other Seller Product')).not.toBeInTheDocument();
  });

  it('formats prices with currency symbol and 2 decimal places', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { content: mockProducts, totalPages: 1, totalElements: 3, currentPage: 0 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('$19.99')).toBeInTheDocument();
    });
    expect(screen.getByText('$29.50')).toBeInTheDocument();
  });

  it('shows empty state with CTA when seller has no products', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { content: [], totalPages: 0, totalElements: 0, currentPage: 0 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('No products yet')).toBeInTheDocument();
    });
    expect(screen.getByText('Create Product')).toBeInTheDocument();
  });

  it('shows delete confirmation modal when delete is clicked', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { content: mockProducts, totalPages: 1, totalElements: 3, currentPage: 0 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete Product')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('dismisses modal without deleting when cancel is clicked', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { content: mockProducts, totalPages: 1, totalElements: 3, currentPage: 0 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByText('Delete Product')).not.toBeInTheDocument();
    expect(screen.getByText('Widget A')).toBeInTheDocument();
    expect(apiService.delete).not.toHaveBeenCalled();
  });

  it('removes product and shows success toast on successful deletion', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { content: mockProducts, totalPages: 1, totalElements: 3, currentPage: 0 },
    });
    vi.mocked(apiService.delete).mockResolvedValue({ data: null });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion in modal
    const confirmButton = screen.getAllByText('Delete').find(
      (el) => el.closest('[role="dialog"]')
    )!;
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('Widget A')).not.toBeInTheDocument();
    });

    expect(toast.success).toHaveBeenCalledWith('"Widget A" deleted successfully.');
  });

  it('retains product and shows error toast on failed deletion', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { content: mockProducts, totalPages: 1, totalElements: 3, currentPage: 0 },
    });
    vi.mocked(apiService.delete).mockRejectedValue(new Error('Server error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getAllByText('Delete').find(
      (el) => el.closest('[role="dialog"]')
    )!;
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete product. Please try again.');
    });

    // Product should still be in the table
    const allWidgetA = screen.getAllByText('Widget A');
    expect(allWidgetA.length).toBeGreaterThanOrEqual(1);
  });

  it('shows error toast when fetching products fails', async () => {
    vi.mocked(apiService.get).mockRejectedValue(new Error('Network error'));

    renderPage();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load products.');
    });
  });
});
