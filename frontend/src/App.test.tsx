import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the catalog page on /products', () => {
    render(
      <MemoryRouter initialEntries={['/products']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Product Catalog')).toBeInTheDocument();
  });

  it('redirects / to /products', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Product Catalog')).toBeInTheDocument();
  });

  it('renders the login page on /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders the register page on /register', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Create an account')).toBeInTheDocument();
  });

  it('renders the cart page on /cart', () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('renders the product detail page on /products/:id', () => {
    render(
      <MemoryRouter initialEntries={['/products/1']}>
        <App />
      </MemoryRouter>
    );
    // The page shows a skeleton loader while fetching product data
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
