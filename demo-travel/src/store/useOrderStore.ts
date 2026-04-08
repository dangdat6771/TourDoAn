import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    note?: string;
  };
  tours: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  payment: {
    total: number;
    discount: number;
    code?: string;
    final: number;
    method: string;
    status: 'pending' | 'paid' | 'cancelled';
  };
  status: 'initial' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updatePaymentStatus: (id: string, status: Order['payment']['status']) => void;
}

const initialOrders: Order[] = [
  { 
    id: 'OD0000001', 
    customer: { name: 'Lê Văn A', phone: '0123456789', note: 'Ghi chú: Test...' }, 
    tours: [
      { id: 'D001', name: 'Tour Hạ Long', price: 1900000, quantity: 3, total: 5700000 },
    ],
    payment: { total: 10000000, discount: 400000, code: 'TOURMUAHE2024', final: 9600000, method: 'Ví Momo', status: 'paid' },
    status: 'initial', 
    createdAt: '16:20 01/01/2024' 
  },
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: initialOrders,
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      updateOrderStatus: (id, status) => set({
        orders: get().orders.map((order) => order.id === id ? { ...order, status } : order)
      }),
      updatePaymentStatus: (id, status) => set({
        orders: get().orders.map((order) => order.id === id ? { ...order, payment: { ...order.payment, status } } : order)
      }),
    }),
    {
      name: 'order-storage',
    }
  )
);
