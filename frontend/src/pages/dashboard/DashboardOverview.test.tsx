import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DashboardOverview from './DashboardOverview';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
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

import apiService from '../../services/api';
import { toast } from '../../utils/toast';

describe('DashboardOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton loaders while loading', () => {
    vi.mocked(apiService.get).mockImplementation(() => new Promise(() => {}));
    render(<DashboardOverview />);
    const skeletons = screen.getAllByTestId ? undefined : undefined;
    // Skeleton cards have animate-pulse class
    const container = screen.getByText('Dashboard Overview').closest('div')!.parentElement!;
    const pulsingElements = container.querySelectorAll('.animate-pulse');
    expect(pulsingElements.length).toBe(3);
  });

  it('displays total products from API after loading', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { totalElements: 42, content: [], totalPages: 4, currentPage: 0 },
    });

    render(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Products')).toBeInTheDocument();
  });

  it('displays mock total sales with "Demo data" label', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { totalElements: 10, content: [], totalPages: 1, currentPage: 0 },
    });

    render(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText('Total Sales')).toBeInTheDocument();
    });

    expect(screen.getByText('$12,450')).toBeInTheDocument();
    const demoLabels = screen.getAllByText('Demo data');
    expect(demoLabels.length).toBe(2); // Total Sales + Recent Orders
  });

  it('displays mock recent orders with "Demo data" label', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { totalElements: 10, content: [], totalPages: 1, currentPage: 0 },
    });

    render(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    });

    expect(screen.getByText('38')).toBeInTheDocument();
  });

  it('shows error state and toast when API fails', async () => {
    vi.mocked(apiService.get).mockRejectedValue(new Error('Network error'));

    render(<DashboardOverview />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load dashboard metrics.');
    });

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('total products card does NOT show "Demo data" label', async () => {
    vi.mocked(apiService.get).mockResolvedValue({
      data: { totalElements: 5, content: [], totalPages: 1, currentPage: 0 },
    });

    render(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    // Only 2 "Demo data" labels (sales + orders), not 3
    const demoLabels = screen.getAllByText('Demo data');
    expect(demoLabels.length).toBe(2);
  });
});
