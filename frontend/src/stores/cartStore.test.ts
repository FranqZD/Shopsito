/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from './cartStore';

// Mock the toast utility
vi.mock('../utils/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

import { toast } from '../utils/toast';

const mockProduct = {
  productId: 1,
  name: 'Test Product',
  price: 19.99,
  imageUrl: 'https://placehold.co/300x200',
  stock: 5,
};

const mockProduct2 = {
  productId: 2,
  name: 'Another Product',
  price: 9.5,
  imageUrl: 'https://placehold.co/300x200',
  stock: 10,
};

describe('cartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [] });
    vi.clearAllMocks();
  });

  describe('addItem', () => {
    it('should add a new product with quantity 1', () => {
      useCartStore.getState().addItem(mockProduct);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({ ...mockProduct, quantity: 1 });
    });

    it('should increment quantity when adding an existing product', () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().addItem(mockProduct);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
    });

    it('should cap quantity at stock and show toast warning when stock is reached', () => {
      const lowStockProduct = { ...mockProduct, stock: 2 };
      useCartStore.getState().addItem(lowStockProduct);
      useCartStore.getState().addItem(lowStockProduct);
      // Third add should be capped
      useCartStore.getState().addItem(lowStockProduct);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(2);
      expect(toast.warning).toHaveBeenCalledWith('Maximum stock reached for this product.');
    });
  });

  describe('removeItem', () => {
    it('should remove a product from the cart', () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().addItem(mockProduct2);

      useCartStore.getState().removeItem(mockProduct.productId);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].productId).toBe(mockProduct2.productId);
    });

    it('should do nothing when removing a non-existent product', () => {
      useCartStore.getState().addItem(mockProduct);

      useCartStore.getState().removeItem(999);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity to the specified value', () => {
      useCartStore.getState().addItem(mockProduct);

      useCartStore.getState().updateQuantity(mockProduct.productId, 3);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(3);
    });

    it('should clamp quantity to minimum of 1', () => {
      useCartStore.getState().addItem(mockProduct);

      useCartStore.getState().updateQuantity(mockProduct.productId, 0);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(1);
    });

    it('should clamp quantity to maximum of stock', () => {
      useCartStore.getState().addItem(mockProduct);

      useCartStore.getState().updateQuantity(mockProduct.productId, 100);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(mockProduct.stock);
    });

    it('should do nothing for a non-existent product', () => {
      useCartStore.getState().addItem(mockProduct);

      useCartStore.getState().updateQuantity(999, 3);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from the cart', () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().addItem(mockProduct2);

      useCartStore.getState().clearCart();

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('totalItems', () => {
    it('should return 0 for an empty cart', () => {
      expect(useCartStore.getState().totalItems()).toBe(0);
    });

    it('should return the sum of all quantities', () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().addItem(mockProduct2);
      useCartStore.getState().updateQuantity(mockProduct.productId, 3);

      expect(useCartStore.getState().totalItems()).toBe(4); // 3 + 1
    });
  });

  describe('totalPrice', () => {
    it('should return 0 for an empty cart', () => {
      expect(useCartStore.getState().totalPrice()).toBe(0);
    });

    it('should compute total with line items rounded to 2 decimal places', () => {
      useCartStore.getState().addItem(mockProduct); // 19.99 * 1 = 19.99
      useCartStore.getState().addItem(mockProduct2); // 9.50 * 1 = 9.50

      expect(useCartStore.getState().totalPrice()).toBe(29.49);
    });

    it('should round each line item before summing', () => {
      // Use a price that would cause floating point issues
      const product = { ...mockProduct, price: 1.1, stock: 10 };
      useCartStore.getState().addItem(product);
      useCartStore.getState().updateQuantity(product.productId, 3);

      // 1.1 * 3 = 3.3000000000000003 in floating point, but rounded to 3.3
      expect(useCartStore.getState().totalPrice()).toBe(3.3);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist cart to localStorage under shopbuilder-cart key', () => {
      useCartStore.getState().addItem(mockProduct);

      const stored = localStorage.getItem('shopbuilder-cart');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.items).toHaveLength(1);
      expect(parsed.state.items[0].productId).toBe(mockProduct.productId);
    });
  });
});
