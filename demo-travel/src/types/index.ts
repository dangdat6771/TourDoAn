export interface TourSchedule {
  id: string;
  departureDate: string;
  returnDate: string;
  rawDepartureDate?: string;
  rawReturnDate?: string;
  availableSeats: number;
  bookedSeats: number;
  availableSlots: number;
  status: 'available' | 'full' | 'cancelled';
  note?: string;
}

export interface Tour {
  id: string;
  slug?: string;
  code?: string;
  title: string;
  image: string;
  price: number;
  childPrice?: number;
  infantPrice?: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  duration: string;
  startDate: string;
  remainingSlots: number;
  childRemainingSlots?: number;
  infantRemainingSlots?: number;
  location: string;
  departureLocation?: string;
  category: 'domestic' | 'international';
  categorySlug?: string;
  categoryName?: string;
  description?: string;
  itinerary?: { day: number; title: string; content: string; image?: string }[];
  schedules?: TourSchedule[];
  selectedScheduleId?: string;
  selectedScheduleLabel?: string;
  status: 'active' | 'inactive';
  position: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CartItem extends Tour {
  cartKey: string;
  quantity: {
    adults: number;
    children: number;
    infants: number;
  };
  totalPrice: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  subCategories?: Category[];
}

export interface News {
  id: string;
  slug: string;
  title: string;
  image: string;
  date: string;
  excerpt: string;
  content: string;
  path: string;
  relatedTourSlug?: string;
}
