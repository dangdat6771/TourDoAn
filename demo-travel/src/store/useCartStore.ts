import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

export const GUEST_CART_OWNER = 'guest';

export const buildCartOwnerKey = (userId?: string | null) =>
  userId ? `user:${userId}` : GUEST_CART_OWNER;

const normalizeCartKey = (item: Partial<CartItem>) =>
  item.cartKey || `${item.id}-${item.selectedScheduleId || 'default'}`;

const calculateItemTotal = (
  item: Pick<CartItem, 'price' | 'childPrice' | 'infantPrice'>,
  quantity: CartItem['quantity'],
) =>
  quantity.adults * item.price +
  quantity.children * (item.childPrice ?? 0) +
  quantity.infants * (item.infantPrice ?? 0);

const normalizeCartItem = (item: CartItem): CartItem => {
  const quantity = {
    adults: Math.max(1, Number(item.quantity?.adults ?? 1)),
    children: Math.max(0, Number(item.quantity?.children ?? 0)),
    infants: Math.max(0, Number(item.quantity?.infants ?? 0)),
  };

  return {
    ...item,
    cartKey: normalizeCartKey(item),
    quantity,
    totalPrice: calculateItemTotal(item, quantity),
  };
};

const mergeCartItems = (existingItems: CartItem[], incomingItems: CartItem[]) => {
  const merged = new Map(existingItems.map((item) => [item.cartKey, normalizeCartItem(item)]));

  incomingItems.forEach((rawItem) => {
    const item = normalizeCartItem(rawItem);
    const existingItem = merged.get(item.cartKey);

    if (!existingItem) {
      merged.set(item.cartKey, item);
      return;
    }

    const quantity = {
      adults: existingItem.quantity.adults + item.quantity.adults,
      children: existingItem.quantity.children + item.quantity.children,
      infants: existingItem.quantity.infants + item.quantity.infants,
    };

    merged.set(item.cartKey, {
      ...existingItem,
      ...item,
      quantity,
      totalPrice: calculateItemTotal(item, quantity),
    });
  });

  return Array.from(merged.values());
};

const resolveLegacyOwnerKey = () => {
  if (typeof window === 'undefined') {
    return GUEST_CART_OWNER;
  }

  try {
    const persistedUserStore = window.localStorage.getItem('user-storage');
    if (!persistedUserStore) {
      return GUEST_CART_OWNER;
    }

    const parsedStore = JSON.parse(persistedUserStore);
    const userState = parsedStore?.state ?? parsedStore;
    const userId = userState?.user?.id;

    return userState?.isAuthenticated && userId ? buildCartOwnerKey(String(userId)) : GUEST_CART_OWNER;
  } catch {
    return GUEST_CART_OWNER;
  }
};

interface CartState {
  currentOwnerKey: string;
  cartsByOwner: Record<string, CartItem[]>;
  items: CartItem[];
  setCartOwner: (ownerKey: string) => void;
  switchToGuestCart: (options?: { clearGuestCart?: boolean }) => void;
  adoptGuestCart: (ownerKey: string) => void;
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
      currentOwnerKey: GUEST_CART_OWNER,
      cartsByOwner: {},
      items: [],
      setCartOwner: (ownerKey) =>
        set((state) => ({
          currentOwnerKey: ownerKey,
          items: state.cartsByOwner[ownerKey] ?? [],
        })),
      switchToGuestCart: (options) =>
        set((state) => {
          const shouldClearGuestCart = options?.clearGuestCart ?? false;
          const guestItems = shouldClearGuestCart ? [] : state.cartsByOwner[GUEST_CART_OWNER] ?? [];

          return {
            currentOwnerKey: GUEST_CART_OWNER,
            items: guestItems,
            cartsByOwner: {
              ...state.cartsByOwner,
              [GUEST_CART_OWNER]: guestItems,
            },
          };
        }),
      adoptGuestCart: (ownerKey) =>
        set((state) => {
          const guestItems = state.cartsByOwner[GUEST_CART_OWNER] ?? [];
          const ownerItems = state.cartsByOwner[ownerKey] ?? [];
          const mergedItems = mergeCartItems(ownerItems, guestItems);

          return {
            currentOwnerKey: ownerKey,
            items: mergedItems,
            cartsByOwner: {
              ...state.cartsByOwner,
              [GUEST_CART_OWNER]: [],
              [ownerKey]: mergedItems,
            },
          };
        }),
      addItem: (newItem) => {
        const normalizedItem = normalizeCartItem(newItem);

        set((state) => {
          const currentItems = state.items;
          const existingItem = currentItems.find((item) => item.cartKey === normalizedItem.cartKey);
          const nextItems = existingItem
            ? currentItems.map((item) => {
                if (item.cartKey !== normalizedItem.cartKey) {
                  return item;
                }

                const quantity = {
                  adults: item.quantity.adults + normalizedItem.quantity.adults,
                  children: item.quantity.children + normalizedItem.quantity.children,
                  infants: item.quantity.infants + normalizedItem.quantity.infants,
                };

                return {
                  ...item,
                  ...normalizedItem,
                  quantity,
                  totalPrice: calculateItemTotal(normalizedItem, quantity),
                };
              })
            : [...currentItems, normalizedItem];

          return {
            items: nextItems,
            cartsByOwner: {
              ...state.cartsByOwner,
              [state.currentOwnerKey]: nextItems,
            },
          };
        });
      },
      removeItem: (cartKey) =>
        set((state) => {
          const nextItems = state.items.filter((item) => item.cartKey !== cartKey);

          return {
            items: nextItems,
            cartsByOwner: {
              ...state.cartsByOwner,
              [state.currentOwnerKey]: nextItems,
            },
          };
        }),
      updateQuantity: (cartKey, quantity) => {
        set((state) => {
          const nextItems = state.items.map((item) => {
            if (item.cartKey !== cartKey) {
              return item;
            }

            const normalizedQuantity = {
              adults: Math.max(1, quantity.adults),
              children: Math.max(0, quantity.children),
              infants: Math.max(0, quantity.infants),
            };

            return {
              ...item,
              quantity: normalizedQuantity,
              totalPrice: calculateItemTotal(item, normalizedQuantity),
            };
          });

          return {
            items: nextItems,
            cartsByOwner: {
              ...state.cartsByOwner,
              [state.currentOwnerKey]: nextItems,
            },
          };
        });
      },
      clearCart: () =>
        set((state) => ({
          items: [],
          cartsByOwner: {
            ...state.cartsByOwner,
            [state.currentOwnerKey]: [],
          },
        })),
      totalItems: () =>
        get().items.reduce(
          (total, item) => total + item.quantity.adults + item.quantity.children + item.quantity.infants,
          0,
        ),
      totalPrice: () => get().items.reduce((acc, item) => acc + item.totalPrice, 0),
    }),
    {
      name: 'cart-storage',
      version: 3,
      migrate: (persistedState: any) => ({
        ...persistedState,
        currentOwnerKey: persistedState?.currentOwnerKey || resolveLegacyOwnerKey(),
        cartsByOwner: persistedState?.cartsByOwner
          ? Object.fromEntries(
              Object.entries(persistedState.cartsByOwner).map(([ownerKey, items]) => [
                ownerKey,
                Array.isArray(items) ? items.map((item: any) => normalizeCartItem(item)) : [],
              ]),
            )
          : (() => {
              const legacyOwnerKey = resolveLegacyOwnerKey();
              const legacyItems = Array.isArray(persistedState?.items)
                ? persistedState.items.map((item: any) => normalizeCartItem(item))
                : [];

              return legacyItems.length > 0 ? { [legacyOwnerKey]: legacyItems } : {};
            })(),
        items: persistedState?.cartsByOwner
          ? (persistedState.cartsByOwner[persistedState?.currentOwnerKey || resolveLegacyOwnerKey()] ?? []).map((item: any) =>
              normalizeCartItem(item),
            )
          : Array.isArray(persistedState?.items)
            ? persistedState.items.map((item: any) => normalizeCartItem(item))
            : [],
      }),
    }
  )
);
