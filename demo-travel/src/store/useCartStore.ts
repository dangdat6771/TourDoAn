import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: CartItem['quantity']) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const existingItem = get().items.find((item) => item.cartKey === newItem.cartKey);
        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.cartKey === newItem.cartKey
                ? {
                    ...item,
                    quantity: {
                      adults: item.quantity.adults + newItem.quantity.adults,
                      children: item.quantity.children + newItem.quantity.children,
                      infants: item.quantity.infants + newItem.quantity.infants,
                    },
                    totalPrice: item.totalPrice + newItem.totalPrice,
                  }
                : item
            ),
          });
        } else {
          set({ items: [...get().items, newItem] });
        }
      },
      removeItem: (cartKey) => set({ items: get().items.filter((item) => item.cartKey !== cartKey) }),
      updateQuantity: (cartKey, quantity) => {
        set({
          items: get().items.map((item) => {
            if (item.cartKey === cartKey) {
              const adultPrice = item.price;
              const childPrice = item.childPrice ?? 0;
              const infantPrice = item.infantPrice ?? 0;
              const newTotalPrice =
                quantity.adults * adultPrice +
                quantity.children * childPrice +
                quantity.infants * infantPrice;

              return { ...item, quantity, totalPrice: newTotalPrice };
            }
            return item;
          }),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () =>
        get().items.reduce(
          (total, item) => total + item.quantity.adults + item.quantity.children + item.quantity.infants,
          0,
        ),
      totalPrice: () => get().items.reduce((acc, item) => acc + item.totalPrice, 0),
    }),
    {
      name: 'cart-storage',
      version: 2,
      migrate: (persistedState: any) => ({
        ...persistedState,
        items: Array.isArray(persistedState?.items)
          ? persistedState.items.map((item: any) => ({
              ...item,
              cartKey: item.cartKey || `${item.id}-${item.selectedScheduleId || 'default'}`,
            }))
          : [],
      }),
    }
  )
);
