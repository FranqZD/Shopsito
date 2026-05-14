import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import CartPage from './CartPage';
import { useCartStore } from '../stores/cartStore';

function renderCartPage() {
  return render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>
  );
}

describe('CartPage', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('shows empty state with CTA link to catalog when cart is empty', () => {
    renderCartPage();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Browse Products' });
    expect(link).toHaveAttribute('href', '/products');
  });

  it('displays cart line items with product info', () => {
    useCartStore.setState({
      items: [
        { productId: 1, name: 'Widget', price: 9.99, imageUrl: 'https://img.test/w.jpg', stock: 10, quantity: 2 },
        { productId: 2, name: 'Gadget', price: 24.5, imageUrl: '', stock: 5, quantity: 1 },
      ],
    });
    renderCartPage();
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('Gadget')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    // $24.50 appears as both unit price and subtotal (qty=1), use getAllByText
    expect(screen.getAllByText('$24.50').length).toBeGreaterThanOrEqual(1);
  });

  it('displays subtotal per line item formatted as $X.XX', () => {
    useCartStore.setState({
      items: [
        { productId: 1, name: 'Widget', price: 9.99, imageUrl: '', stock: 10, quantity: 3 },
        { productId: 2, name: 'Gadget', price: 5.0, imageUrl: '', stock: 5, quantity: 1 },
      ],
    });
    renderCartPage();
    // Widget subtotal = 9.99 * 3 = 29.97 (unique since total is 34.97)
    expect(screen.getByText('$29.97')).toBeInTheDocument();
    // Cart total = 29.97 + 5.00 = 34.97
    expect(screen.getByText('$34.97')).toBeInTheDocument();
  });

  it('displays cart total formatted as $X.XX', () => {
    useCartStore.setState({
      items: [
        { productId: 1, name: 'Widget', price: 10.0, imageUrl: '', stock: 10, quantity: 2 },
        { productId: 2, name: 'Gadget', price: 5.5, imageUrl: '', stock: 5, quantity: 1 },
      ],
    });
    renderCartPage();
    // total = 20.00 + 5.50 = 25.50
    expect(screen.getByText('$25.50')).toBeInTheDocument();
  });

  it('calls removeItem when remove button is clicked', () => {
    useCartStore.setState({
      items: [
        { productId: 1, name: 'Widget', price: 9.99, imageUrl: '', stock: 10, quantity: 1 },
      ],
    });
    renderCartPage();
    const removeBtn = screen.getByRole('button', { name: /remove widget/i });
    fireEvent.click(removeBtn);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calls updateQuantity when quantity buttons are clicked', () => {
    useCartStore.setState({
      items: [
        { productId: 1, name: 'Widget', price: 9.99, imageUrl: '', stock: 10, quantity: 2 },
      ],
    });
    renderCartPage();
    const increaseBtn = screen.getByRole('button', { name: /increase quantity of widget/i });
    fireEvent.click(increaseBtn);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('disables decrease button when quantity is 1', () => {
    useCartStore.setState({
      items: [
        { productId: 1, name: 'Widget', price: 9.99, imageUrl: '', stock: 10, quantity: 1 },
      ],
    });
    renderCartPage();
    const decreaseBtn = screen.getByRole('button', { name: /decrease quantity of widget/i });
    expect(decreaseBtn).toBeDisabled();
  });

  it('disables increase button when quantity equals stock', () => {
    useCartStore.setState({
      items: [
        { productId: 1, name: 'Widget', price: 9.99, imageUrl: '', stock: 3, quantity: 3 },
      ],
    });
    renderCartPage();
    const increaseBtn = screen.getByRole('button', { name: /increase quantity of widget/i });
    expect(increaseBtn).toBeDisabled();
  });
});
