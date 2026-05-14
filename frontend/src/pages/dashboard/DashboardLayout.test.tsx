import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DashboardLayout from './DashboardLayout';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    logout: mockLogout,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLayout(initialRoute = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<div>Overview Content</div>} />
          <Route path="products" element={<div>Products Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar with Dashboard and Products nav items', () => {
    renderLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders the Outlet content for nested routes', () => {
    renderLayout();
    expect(screen.getByText('Overview Content')).toBeInTheDocument();
  });

  it('renders a logout button in the sidebar', () => {
    renderLayout();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls logout and navigates to /products when logout is clicked', () => {
    renderLayout();
    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  it('renders mobile menu toggle button', () => {
    renderLayout();
    expect(screen.getByLabelText('Open sidebar menu')).toBeInTheDocument();
  });

  it('opens sidebar when mobile toggle is clicked', () => {
    renderLayout();
    const toggle = screen.getByLabelText('Open sidebar menu');
    fireEvent.click(toggle);
    // Overlay should appear
    const overlay = document.querySelector('[aria-hidden="true"]');
    expect(overlay).toBeInTheDocument();
  });

  it('has accessible navigation landmark', () => {
    renderLayout();
    expect(screen.getByRole('navigation', { name: /dashboard navigation/i })).toBeInTheDocument();
  });

  it('highlights active nav item for Dashboard route', () => {
    renderLayout('/dashboard');
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink?.className).toContain('bg-indigo-50');
  });
});
