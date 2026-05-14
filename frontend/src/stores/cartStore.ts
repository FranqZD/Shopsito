import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from '../utils/toast';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const existing = get().items.find((i) => i.productId === product.productId);
        if (existing) {
          const newQty = Math.min(existing.quantity + 1, product.stock);
          if (newQty === existing.quantity) {
            toast.warning('Maximum stock reached for this product.');
            return;
          }
          set({
            items: get().items.map((i) =>
              i.productId === product.productId ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        const item = get().items.find((i) => i.productId === productId);
        if (!item) return;
        const clamped = Math.max(1, Math.min(quantity, item.stock));
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: clamped } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => {
          const lineTotal = Math.round(i.price * i.quantity * 100) / 100;
          return sum + lineTotal;
        }, 0),
    }),
    {
      name: 'shopbuilder-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
