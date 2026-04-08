import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tour } from '../types';

interface TourState {
  tours: Tour[];
  addTour: (tour: Tour) => void;
  updateTour: (id: string, updatedTour: Partial<Tour>) => void;
  deleteTour: (id: string) => void;
  getTourById: (id: string) => Tour | undefined;
}

// Initial mock data
const initialTours: Tour[] = [
  {
    id: 'D001',
    title: 'Hà Nội - Lào Cai - SaPa 4N3Đ',
    image: 'https://picsum.photos/seed/sapa/800/600',
    price: 2590000,
    childPrice: 1900000,
    infantPrice: 1000000,
    originalPrice: 13650000,
    discount: 30,
    rating: 4.8,
    reviewsCount: 12,
    duration: '4 Ngày 3 Đêm',
    startDate: '22/07/2024',
    remainingSlots: 10,
    childRemainingSlots: 5,
    infantRemainingSlots: 2,
    location: 'SaPa',
    category: 'domestic',
    description: 'Khám phá vẻ đẹp hùng vĩ của SaPa...',
    itinerary: [
      { day: 1, title: 'Hà Nội - SaPa', content: 'Khởi hành từ Hà Nội đi SaPa...' }
    ],
    status: 'active',
    position: 1,
    createdAt: '16:20 20/10/2024',
    updatedAt: '16:20 20/10/2024'
  },
  {
    id: 'D002',
    title: 'Tour 2024 Phú Quốc - Thiên Đường Đảo Ngọc (3N2Đ)',
    image: 'https://picsum.photos/seed/phuquoc2/800/600',
    price: 2590000,
    childPrice: 1900000,
    infantPrice: 1000000,
    originalPrice: 13650000,
    discount: 50,
    rating: 4.9,
    reviewsCount: 8,
    duration: '3 Ngày 2 Đêm',
    startDate: '22/07/2024',
    remainingSlots: 10,
    childRemainingSlots: 5,
    infantRemainingSlots: 2,
    location: 'Phú Quốc',
    category: 'domestic',
    status: 'active',
    position: 2,
    createdAt: '16:20 20/10/2024',
    updatedAt: '16:20 20/10/2024'
  },
  {
    id: 'D003',
    title: 'Combo Đà Nẵng 2024: ĐÀ NẴNG - HỘI AN - BÀ NÀ HILL',
    image: 'https://picsum.photos/seed/danang2/800/600',
    price: 2590000,
    childPrice: 1900000,
    infantPrice: 1000000,
    originalPrice: 13650000,
    discount: 30,
    rating: 4.7,
    reviewsCount: 15,
    duration: '4 Ngày 3 Đêm',
    startDate: '22/07/2024',
    remainingSlots: 10,
    childRemainingSlots: 5,
    infantRemainingSlots: 2,
    location: 'Đà Nẵng',
    category: 'domestic',
    status: 'active',
    position: 3,
    createdAt: '16:20 20/10/2024',
    updatedAt: '16:20 20/10/2024'
  },
  {
    id: 'D004',
    title: 'Hà Nội - Hạ Long - Ninh Bình 3N2Đ',
    image: 'https://picsum.photos/seed/halong/800/600',
    price: 3290000,
    childPrice: 2400000,
    infantPrice: 1500000,
    originalPrice: 4500000,
    discount: 25,
    rating: 4.6,
    reviewsCount: 20,
    duration: '3 Ngày 2 Đêm',
    startDate: '25/07/2024',
    remainingSlots: 5,
    childRemainingSlots: 3,
    infantRemainingSlots: 1,
    location: 'Hạ Long',
    category: 'domestic',
    status: 'active',
    position: 4,
    createdAt: '16:20 20/10/2024',
    updatedAt: '16:20 20/10/2024'
  },
  {
    id: 'I001',
    title: 'Tour Châu Âu: Pháp - Thụy Sĩ - Ý 10N9Đ',
    image: 'https://picsum.photos/seed/europe/800/600',
    price: 59900000,
    childPrice: 45000000,
    infantPrice: 20000000,
    originalPrice: 75000000,
    discount: 20,
    rating: 5.0,
    reviewsCount: 42,
    duration: '10 Ngày 9 Đêm',
    startDate: '15/08/2024',
    remainingSlots: 8,
    childRemainingSlots: 4,
    infantRemainingSlots: 2,
    location: 'Châu Âu',
    category: 'international',
    status: 'active',
    position: 5,
    createdAt: '16:20 20/10/2024',
    updatedAt: '16:20 20/10/2024'
  },
  {
    id: 'I002',
    title: 'Nhật Bản: Tokyo - Kyoto - Osaka 6N5Đ',
    image: 'https://picsum.photos/seed/japan/800/600',
    price: 28900000,
    childPrice: 21000000,
    infantPrice: 10000000,
    originalPrice: 35000000,
    discount: 15,
    rating: 4.9,
    reviewsCount: 35,
    duration: '6 Ngày 5 Đêm',
    startDate: '20/08/2024',
    remainingSlots: 12,
    childRemainingSlots: 6,
    infantRemainingSlots: 3,
    location: 'Nhật Bản',
    category: 'international',
    status: 'active',
    position: 6,
    createdAt: '16:20 20/10/2024',
    updatedAt: '16:20 20/10/2024'
  }
];

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      tours: initialTours,
      addTour: (tour) => set({ tours: [...get().tours, tour] }),
      updateTour: (id, updatedTour) => set({
        tours: get().tours.map((tour) => tour.id === id ? { ...tour, ...updatedTour } : tour)
      }),
      deleteTour: (id) => set({ tours: get().tours.filter((tour) => tour.id !== id) }),
      getTourById: (id) => get().tours.find((tour) => tour.id === id),
    }),
    {
      name: 'tour-storage',
    }
  )
);
