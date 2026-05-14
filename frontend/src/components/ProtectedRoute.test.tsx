import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../utils/toast';

vi.mock('../utils/toast', () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

function createJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'fake-signature';
  return `${header}.${body}.${signature}`;
}

function renderWithRouter(
  ui: React.ReactElement,
  { initialEntries = ['/dashboard'] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/dashboard" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/products" element={<div>Products Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// Helper component to capture location state
function CaptureLocationState({ onCapture }: { onCapture: (state: unknown) => void }) {
  const location = useLocation();
  onCapture(location.state);
  return <div>Login Page</div>;
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    vi.clearAllMocks();
  });

  it('redirects to /login when not authenticated', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>Dashboard Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated with correct role', () => {
    const validToken = createJwt({
      sub: 'test@example.com',
      userId: 1,
      name: 'Test',
      role: 'SELLER',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    useAuthStore.setState({
      token: validToken,
      user: { id: 1, name: 'Test', email: 'test@example.com', role: 'SELLER' },
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Dashboard Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('redirects to /login and shows toast when token is expired', () => {
    const expiredToken = createJwt({
      sub: 'test@example.com',
      userId: 1,
      name: 'Test',
      role: 'SELLER',
      exp: Math.floor(Date.now() / 1000) - 3600,
    });

    useAuthStore.setState({
      token: expiredToken,
      user: { id: 1, name: 'Test', email: 'test@example.com', role: 'SELLER' },
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Dashboard Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    expect(toast.info).toHaveBeenCalledWith('Session expired. Please log in again.');
  });

  it('redirects to /login when token is malformed', () => {
    useAuthStore.setState({
      token: 'not-a-valid-jwt',
      user: { id: 1, name: 'Test', email: 'test@example.com', role: 'SELLER' },
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Dashboard Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('redirects to /products and shows toast when role does not match', () => {
    const validToken = createJwt({
      sub: 'test@example.com',
      userId: 1,
      name: 'Test',
      role: 'BUYER',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    useAuthStore.setState({
      token: validToken,
      user: { id: 1, name: 'Test', email: 'test@example.com', role: 'BUYER' as unknown as 'SELLER' },
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute requiredRole="SELLER">
        <div>Dashboard Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Products Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Insufficient permissions.');
  });

  it('preserves the originally requested path in location state for post-login redirect', () => {
    let locationState: unknown = null;

    render(
      <MemoryRouter initialEntries={['/dashboard/products/new']}>
        <Routes>
          <Route
            path="/dashboard/products/new"
            element={
              <ProtectedRoute>
                <div>New Product</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <CaptureLocationState onCapture={(state) => { locationState = state; }} />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(locationState).toEqual(
      expect.objectContaining({
        from: expect.objectContaining({
          pathname: '/dashboard/products/new',
        }),
      })
    );
  });
});
