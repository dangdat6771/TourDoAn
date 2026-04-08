import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Category {
  id: string;
  name: string;
  image: string;
  position: number;
  status: 'active' | 'inactive';
  parentId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updatedCategory: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

const initialCategories: Category[] = [
  { id: '1', name: 'Miền Bắc', image: 'https://picsum.photos/seed/north/100/100', position: 1, status: 'active', createdAt: '16:20 20/10/2024', updatedAt: '16:20 20/10/2024' },
  { id: '2', name: 'Miền Trung', image: 'https://picsum.photos/seed/central/100/100', position: 2, status: 'active', createdAt: '16:20 20/10/2024', updatedAt: '16:20 20/10/2024' },
  { id: '3', name: 'Miền Nam', image: 'https://picsum.photos/seed/south/100/100', position: 3, status: 'inactive', createdAt: '16:20 20/10/2024', updatedAt: '16:20 20/10/2024' },
  { id: '4', name: 'Châu Á', image: 'https://picsum.photos/seed/asia/100/100', position: 4, status: 'active', createdAt: '16:20 20/10/2024', updatedAt: '16:20 20/10/2024' },
  { id: '5', name: 'Châu Âu', image: 'https://picsum.photos/seed/europe/100/100', position: 5, status: 'active', createdAt: '16:20 20/10/2024', updatedAt: '16:20 20/10/2024' },
];

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: initialCategories,
      addCategory: (category) => set({ categories: [...get().categories, category] }),
      updateCategory: (id, updatedCategory) => set({
        categories: get().categories.map((cat) => cat.id === id ? { ...cat, ...updatedCategory } : cat)
      }),
      deleteCategory: (id) => set({ categories: get().categories.filter((cat) => cat.id !== id) }),
    }),
    {
      name: 'category-storage',
    }
  )
);
