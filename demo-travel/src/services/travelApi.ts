import axios from 'axios';
import { apiClient } from './api';
import type { News, Tour, TourSchedule } from '../types';
import type { AdminUser } from '../admin/types';

type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

type SpringPage<T> = {
  content?: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
};

type LegacyPage<T> = {
  page?: number;
  pageSize?: number;
  totalPage?: number;
  item?: T;
};

type BackendPaged<T> = {
  page?: number;
  pageSize?: number;
  totalPage?: number;
  totalElements?: number;
  items?: T[];
};

type PublicTourApi = {
  id: number;
  tourName: string;
  slug: string;
  tourCode?: string;
  featuredImage?: string;
  destination?: string;
  departureLocation?: string;
  durationDays?: number;
  durationNights?: number;
  adultPrice?: number;
  priceFrom?: number;
  averageRating?: number;
  totalReviews?: number;
  categoryName?: string;
  categorySlug?: string;
};

type TourDayApi = {
  id?: number;
  dayNumber?: string;
  dayTitle?: string;
  dep?: string;
  description?: string;
  image?: string;
};

type TourScheduleApi = {
  id?: number;
  departureDate?: string | number[];
  returnDate?: string | number[];
  availableSeats?: number;
  bookedSeats?: number;
  availableSlots?: number;
  note?: string;
  status?: string;
};

type TourDetailApi = {
  id: number;
  tourName: string;
  slug: string;
  tourCode?: string;
  shortDescription?: string;
  description?: string;
  featuredImage?: string;
  destination?: string;
  departureLocation?: string;
  durationDays?: number;
  durationNights?: number;
  basePrice?: number;
  adultPrice?: number;
  childPrice?: number;
  infantPrice?: number;
  status?: string;
  averageRating?: number;
  totalReviews?: number;
  categoryName?: string;
  categorySlug?: string;
  itinerary?: TourDayApi[];
  schedules?: TourScheduleApi[];
};

type CategoryApi = {
  id: number;
  categoryName: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AdminTourApi = {
  id: number;
  tourName: string;
  tourCode?: string;
  slug?: string;
  status?: string;
  adultPrice?: number;
  destination?: string;
  categoryName?: string;
  createdByName?: string;
  totalBookings?: number;
  availableSchedulesCount?: number;
};

type LoginResponseApi = {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role?: string;
};

type PriceQuoteApi = {
  adultSubtotal?: number;
  childSubtotal?: number;
  infantSubtotal?: number;
  subtotal?: number;
  finalAmount?: number;
  availableSlots?: number;
  available?: boolean;
  isAvailable?: boolean;
};

type OrderItemApi = {
  id?: number;
  tourId?: number;
  scheduleId?: number;
  tourName?: string;
  departureDate?: string;
  returnDate?: string;
  adultQuantity?: number;
  childQuantity?: number;
  infantQuantity?: number;
  adultPrice?: number;
  childPrice?: number;
  infantPrice?: number;
  subtotal?: number;
  checkInStatus?: string;
  checkedInAdultQuantity?: number;
  checkedInChildQuantity?: number;
  checkedInInfantQuantity?: number;
  noShowAdultQuantity?: number;
  noShowChildQuantity?: number;
  noShowInfantQuantity?: number;
  lastCheckInAt?: string;
  checkInNote?: string;
};

type OrderApi = {
  id: number;
  orderCode?: string;
  userId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNote?: string;
  totalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  paymentOption?: string;
  depositRate?: number;
  requiredDepositAmount?: number;
  paidAmount?: number;
  refundedAmount?: number;
  outstandingAmount?: number;
  balanceDueDate?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  checkInStatus?: string;
  participationStatus?: string;
  refundRate?: number;
  refundAmount?: number;
  cancelledAt?: string;
  cancellationReason?: string;
  participationConfirmedAt?: string;
  participationNote?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItemApi[];
};

type UserApi = {
  id: number;
  fullName: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  status?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FrontendCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  position: number;
  status: 'active' | 'inactive';
  parentId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminTourRow = {
  id: string;
  slug: string;
  title: string;
  code: string;
  image: string;
  price: number;
  childPrice: number;
  infantPrice: number;
  remainingSlots: number;
  childRemainingSlots: number;
  infantRemainingSlots: number;
  position: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  location: string;
  category: string;
  createdByName: string;
};

export type AdminTourFormState = {
  title: string;
  categoryId: string;
  position: number;
  status: 'active' | 'inactive';
  price: number;
  childPrice: number;
  infantPrice: number;
  originalPrice: number;
  remainingSlots: number;
  childRemainingSlots: number;
  infantRemainingSlots: number;
  duration: string;
  startDate: string;
  location: string;
  description: string;
  image: string;
  slug: string;
  code: string;
  itinerary: { day: number; title: string; content: string; image?: string }[];
};

export type TourPriceQuote = {
  adultSubtotal: number;
  childSubtotal: number;
  infantSubtotal: number;
  subtotal: number;
  finalAmount: number;
  availableSlots: number;
  isAvailable: boolean;
};

export type CheckoutPayload = {
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    note?: string;
  };
  items: {
    tourId: number;
    scheduleId: number;
    adultQuantity: number;
    childQuantity: number;
    infantQuantity: number;
  }[];
  paymentMethod: string;
  paymentOption: 'full' | 'deposit';
};

export type AdminOrderItem = {
  id: string;
  tourId?: string;
  scheduleId?: string;
  name: string;
  departureDate: string;
  returnDate: string;
  adultQuantity: number;
  childQuantity: number;
  infantQuantity: number;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  subtotal: number;
  checkInStatus: 'not_started' | 'partial' | 'checked_in' | 'no_show' | 'cancelled';
  checkedInAdultQuantity: number;
  checkedInChildQuantity: number;
  checkedInInfantQuantity: number;
  noShowAdultQuantity: number;
  noShowChildQuantity: number;
  noShowInfantQuantity: number;
  lastCheckInAt: string;
  checkInNote: string;
};

export type AdminOrder = {
  id: string;
  code: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentOption: 'full' | 'deposit';
  depositRate: number;
  requiredDepositAmount: number;
  paidAmount: number;
  refundedAmount: number;
  outstandingAmount: number;
  balanceDueDate: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'cancelled' | 'refunded';
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  checkInStatus: 'not_started' | 'partial' | 'checked_in' | 'no_show' | 'cancelled';
  participationStatus: 'pending' | 'confirmed';
  refundRate: number;
  refundAmount: number;
  cancelledAt: string;
  cancellationReason: string;
  participationConfirmedAt: string;
  participationNote: string;
  createdAt: string;
  updatedAt: string;
  rawCreatedAt: string;
  items: AdminOrderItem[];
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  avatar: string;
  address: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  role: 'ADMIN' | 'USER' | 'STAFF';
  createdAt: string;
  updatedAt: string;
};

export type AdminUserUpdatePayload = {
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string;
  avatarUrl: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  userType: 'ADMIN' | 'USER' | 'STAFF';
};

export type UserSession = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
};

const buildCurrentUserHeaders = (user?: UserSession | null) =>
  user
    ? {
        'X-User-Id': user.id,
        'X-User-Email': user.email,
      }
    : undefined;

const FALLBACK_IMAGE = 'https://picsum.photos/seed/tour-fallback/800/600';
const FALLBACK_AVATAR = 'https://picsum.photos/seed/user-fallback/120/120';

const normalizeText = (value?: string) =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

export const slugify = (value: string) =>
  normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const unwrap = async <T>(promise: Promise<{ data: ApiResponse<T> }>) => {
  const response = await promise;
  return response.data.data;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const parseNumber = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toDateValue = (value?: string | number[] | null) => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    if (!year || !month || !day) {
      return null;
    }
    return new Date(year, month - 1, day, hour, minute, second);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDuration = (days?: number, nights?: number) => {
  if (!days && !nights) {
    return 'Dang cap nhat';
  }
  if (days && nights !== undefined) {
    return `${days} Ngay ${nights} Dem`;
  }
  return `${days ?? 0} Ngay`;
};

const formatDate = (value?: string | number[] | null) => {
  if (!value) {
    return 'Lien he';
  }

  const date = toDateValue(value);
  if (!date) {
    return Array.isArray(value) ? value.join('-') : value;
  }

  return date.toLocaleDateString('vi-VN');
};

const formatDateTime = (value?: string | number[] | null) => {
  if (!value) {
    return 'Dang cap nhat';
  }

  const date = toDateValue(value);
  if (!date) {
    return Array.isArray(value) ? value.join('-') : value;
  }

  return date.toLocaleString('vi-VN');
};

const inferTourCategory = (categoryName?: string, categorySlug?: string): 'domestic' | 'international' => {
  const normalized = normalizeText(`${categoryName ?? ''} ${categorySlug ?? ''}`);
  const matchesCategoryToken = (token: string) =>
    normalized.includes(token) || normalized.includes(token.replace(/-/g, ' '));
  const domesticTokens = [
    'mien-bac',
    'mien-trung',
    'mien-nam',
    'xuyen-viet',
    'trong-nuoc',
    'bien-dao',
    'tay-nguyen',
    'du-lich-mao-hiem',
    'du-lich-sinh-thai',
    'du-lich-tam-linh',
  ];
  const internationalTokens = [
    'chau-a',
    'chau-au',
    'chau-my',
    'chau-uc',
    'dong-nam-a',
    'trung-dong',
    'chau-phi',
    'du-thuyen-quoc-te',
    'nuoc-ngoai',
    'international',
  ];

  if (internationalTokens.some(matchesCategoryToken)) {
    return 'international';
  }

  if (domesticTokens.some(matchesCategoryToken)) {
    return 'domestic';
  }

  if (
    normalized.includes('chau') ||
    normalized.includes('nuoc ngoai') ||
    normalized.includes('international')
  ) {
    return 'international';
  }

  return 'domestic';
};

const normalizeTourStatus = (status?: string): 'active' | 'inactive' =>
  normalizeText(status) === 'published' ? 'active' : 'inactive';

const normalizeScheduleStatus = (status?: string): TourSchedule['status'] => {
  const normalized = normalizeText(status);
  if (normalized === 'full') {
    return 'full';
  }
  if (normalized === 'cancelled') {
    return 'cancelled';
  }
  return 'available';
};

const normalizeOrderStatus = (status?: string): AdminOrder['status'] => {
  const normalized = normalizeText(status);
  if (normalized === 'confirmed') {
    return 'confirmed';
  }
  if (normalized === 'processing') {
    return 'processing';
  }
  if (normalized === 'completed') {
    return 'completed';
  }
  if (normalized === 'cancelled') {
    return 'cancelled';
  }
  return 'pending';
};

const normalizePaymentStatus = (status?: string): AdminOrder['paymentStatus'] => {
  const normalized = normalizeText(status);
  if (normalized === 'paid') {
    return 'paid';
  }
  if (normalized === 'partially_paid') {
    return 'pending';
  }
  if (normalized === 'cancelled') {
    return 'cancelled';
  }
  if (normalized === 'refunded') {
    return 'refunded';
  }
  if (normalized === 'partially_refunded') {
    return 'refunded';
  }
  return 'pending';
};

const normalizePaymentOption = (value?: string): AdminOrder['paymentOption'] =>
  normalizeText(value) === 'deposit' ? 'deposit' : 'full';

const normalizeCheckInStatus = (value?: string): AdminOrder['checkInStatus'] => {
  const normalized = normalizeText(value);
  if (normalized === 'partial') {
    return 'partial';
  }
  if (normalized === 'checked_in') {
    return 'checked_in';
  }
  if (normalized === 'no_show') {
    return 'no_show';
  }
  if (normalized === 'cancelled') {
    return 'cancelled';
  }
  return 'not_started';
};

const normalizeParticipationStatus = (value?: string): AdminOrder['participationStatus'] =>
  normalizeText(value) === 'confirmed' ? 'confirmed' : 'pending';

const normalizeGender = (gender?: string): AdminUserRow['gender'] => {
  const normalized = normalizeText(gender);
  if (normalized === 'female') {
    return 'FEMALE';
  }
  if (normalized === 'other') {
    return 'OTHER';
  }
  return 'MALE';
};

const normalizeUserStatus = (status?: string): AdminUserRow['status'] => {
  const normalized = normalizeText(status);
  if (normalized === 'inactive') {
    return 'INACTIVE';
  }
  if (normalized === 'banned') {
    return 'BANNED';
  }
  return 'ACTIVE';
};

const normalizeUserRole = (role?: string): AdminUserRow['role'] => {
  const normalized = normalizeText(role);
  if (normalized === 'admin') {
    return 'ADMIN';
  }
  if (normalized === 'staff') {
    return 'STAFF';
  }
  return 'USER';
};

const mapSchedule = (schedule: TourScheduleApi): TourSchedule => ({
  id: String(schedule.id ?? ''),
  departureDate: formatDate(schedule.departureDate),
  returnDate: formatDate(schedule.returnDate),
  rawDepartureDate: Array.isArray(schedule.departureDate) ? schedule.departureDate.join('-') : schedule.departureDate,
  rawReturnDate: Array.isArray(schedule.returnDate) ? schedule.returnDate.join('-') : schedule.returnDate,
  availableSeats: parseNumber(schedule.availableSeats),
  bookedSeats: parseNumber(schedule.bookedSeats),
  availableSlots: parseNumber(schedule.availableSlots ?? parseNumber(schedule.availableSeats) - parseNumber(schedule.bookedSeats)),
  status: normalizeScheduleStatus(schedule.status),
  note: schedule.note || '',
});

const mapSummaryToTour = (tour: PublicTourApi): Tour => ({
  id: String(tour.id),
  slug: tour.slug,
  code: tour.tourCode,
  title: tour.tourName,
  image: tour.featuredImage || FALLBACK_IMAGE,
  price: parseNumber(tour.adultPrice ?? tour.priceFrom),
  childPrice: 0,
  infantPrice: 0,
  originalPrice: undefined,
  discount: undefined,
  rating: parseNumber(tour.averageRating),
  reviewsCount: parseNumber(tour.totalReviews),
  duration: formatDuration(tour.durationDays, tour.durationNights),
  startDate: 'Lien he',
  remainingSlots: 0,
  location: tour.destination || tour.departureLocation || 'Dang cap nhat',
  departureLocation: tour.departureLocation || '',
  category: inferTourCategory(tour.categoryName, tour.categorySlug),
  categorySlug: tour.categorySlug,
  categoryName: tour.categoryName,
  status: 'active',
  position: 0,
  createdAt: '',
  updatedAt: '',
});

export const mapDetailToTour = (tour: TourDetailApi): Tour => {
  const schedules = (tour.schedules ?? []).map(mapSchedule);
  const firstSchedule = schedules[0];

  return {
    id: String(tour.id),
    slug: tour.slug,
    code: tour.tourCode,
    title: tour.tourName,
    image: tour.featuredImage || FALLBACK_IMAGE,
    price: parseNumber(tour.adultPrice),
    childPrice: parseNumber(tour.childPrice),
    infantPrice: parseNumber(tour.infantPrice),
    originalPrice: undefined,
    discount: undefined,
    rating: parseNumber(tour.averageRating),
    reviewsCount: parseNumber(tour.totalReviews),
    duration: formatDuration(tour.durationDays, tour.durationNights),
    startDate: firstSchedule?.departureDate || 'Lien he',
    remainingSlots: parseNumber(firstSchedule?.availableSlots),
    location: tour.destination || tour.departureLocation || 'Dang cap nhat',
    departureLocation: tour.departureLocation || '',
    category: inferTourCategory(tour.categoryName, tour.categorySlug),
    categorySlug: tour.categorySlug,
    categoryName: tour.categoryName,
    description: tour.description || tour.shortDescription || '',
    itinerary:
      tour.itinerary?.map((item, index) => ({
        day: parseNumber(item.dayNumber) || index + 1,
        title: item.dayTitle || `Ngay ${index + 1}`,
        content: item.description || '',
        image: item.image,
      })) ?? [],
    schedules,
    selectedScheduleId: firstSchedule?.id,
    selectedScheduleLabel: firstSchedule?.departureDate,
    status: normalizeTourStatus(tour.status),
    position: 0,
    createdAt: '',
    updatedAt: '',
  };
};

const mapCategory = (category: CategoryApi): FrontendCategory => ({
  id: String(category.id),
  name: category.categoryName,
  slug: category.slug,
  image: category.imageUrl || 'https://picsum.photos/seed/category/100/100',
  position: parseNumber(category.displayOrder),
  status: normalizeText(category.status) === 'inactive' ? 'inactive' : 'active',
  description: category.description || '',
  createdAt: category.createdAt || '',
  updatedAt: category.updatedAt || '',
});

const mapAdminTour = (tour: AdminTourApi): AdminTourRow => ({
  id: String(tour.id),
  slug: tour.slug || '',
  title: tour.tourName,
  code: tour.tourCode || '',
  image: FALLBACK_IMAGE,
  price: parseNumber(tour.adultPrice),
  childPrice: 0,
  infantPrice: 0,
  remainingSlots: parseNumber(tour.availableSchedulesCount),
  childRemainingSlots: 0,
  infantRemainingSlots: 0,
  position: 0,
  status: normalizeTourStatus(tour.status),
  createdAt: '',
  updatedAt: '',
  location: tour.destination || 'Dang cap nhat',
  category: tour.categoryName || '',
  createdByName: tour.createdByName || 'Admin',
});

const mapOrderItem = (item: OrderItemApi): AdminOrderItem => ({
  id: String(item.id ?? `${item.tourId ?? 'tour'}-${item.scheduleId ?? 'schedule'}`),
  tourId: item.tourId ? String(item.tourId) : undefined,
  scheduleId: item.scheduleId ? String(item.scheduleId) : undefined,
  name: item.tourName || 'Tour dang cap nhat',
  departureDate: formatDate(item.departureDate),
  returnDate: formatDate(item.returnDate),
  adultQuantity: parseNumber(item.adultQuantity),
  childQuantity: parseNumber(item.childQuantity),
  infantQuantity: parseNumber(item.infantQuantity),
  adultPrice: parseNumber(item.adultPrice),
  childPrice: parseNumber(item.childPrice),
  infantPrice: parseNumber(item.infantPrice),
  subtotal: parseNumber(item.subtotal),
  checkInStatus: normalizeCheckInStatus(item.checkInStatus),
  checkedInAdultQuantity: parseNumber(item.checkedInAdultQuantity),
  checkedInChildQuantity: parseNumber(item.checkedInChildQuantity),
  checkedInInfantQuantity: parseNumber(item.checkedInInfantQuantity),
  noShowAdultQuantity: parseNumber(item.noShowAdultQuantity),
  noShowChildQuantity: parseNumber(item.noShowChildQuantity),
  noShowInfantQuantity: parseNumber(item.noShowInfantQuantity),
  lastCheckInAt: formatDateTime(item.lastCheckInAt),
  checkInNote: item.checkInNote || '',
});

const mapOrder = (order: OrderApi): AdminOrder => ({
  id: String(order.id),
  code: order.orderCode || `OD${order.id}`,
  userId: order.userId ? String(order.userId) : undefined,
  customerName: order.customerName || 'Khach le',
  customerEmail: order.customerEmail || '',
  customerPhone: order.customerPhone || '',
  customerAddress: order.customerAddress || '',
  customerNote: order.customerNote || '',
  totalAmount: parseNumber(order.totalAmount),
  discountAmount: parseNumber(order.discountAmount),
  finalAmount: parseNumber(order.finalAmount),
  paymentOption: normalizePaymentOption(order.paymentOption),
  depositRate: parseNumber(order.depositRate),
  requiredDepositAmount: parseNumber(order.requiredDepositAmount),
  paidAmount: parseNumber(order.paidAmount),
  refundedAmount: parseNumber(order.refundedAmount),
  outstandingAmount: parseNumber(order.outstandingAmount),
  balanceDueDate: formatDate(order.balanceDueDate),
  paymentMethod: order.paymentMethod || 'bank',
  paymentStatus: normalizePaymentStatus(order.paymentStatus),
  status: normalizeOrderStatus(order.orderStatus),
  checkInStatus: normalizeCheckInStatus(order.checkInStatus),
  participationStatus: normalizeParticipationStatus(order.participationStatus),
  refundRate: parseNumber(order.refundRate),
  refundAmount: parseNumber(order.refundAmount),
  cancelledAt: formatDateTime(order.cancelledAt),
  cancellationReason: order.cancellationReason || '',
  participationConfirmedAt: formatDateTime(order.participationConfirmedAt),
  participationNote: order.participationNote || '',
  createdAt: formatDateTime(order.createdAt),
  updatedAt: formatDateTime(order.updatedAt),
  rawCreatedAt: order.createdAt || '',
  items: (order.items ?? []).map(mapOrderItem),
});

const mapAdminUser = (user: UserApi): AdminUserRow => ({
  id: String(user.id),
  name: user.fullName,
  email: user.email,
  passwordHash: user.passwordHash || '',
  phone: user.phone || '',
  avatar: user.avatarUrl || FALLBACK_AVATAR,
  address: user.address || '',
  dateOfBirth: user.dateOfBirth || '',
  gender: normalizeGender(user.gender),
  status: normalizeUserStatus(user.status),
  role: normalizeUserRole(user.role),
  createdAt: user.createdAt || '',
  updatedAt: user.updatedAt || '',
});

const parseDateInput = (value: string) => {
  if (!value) {
    return null;
  }

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIsoDate = (value: string) => {
  const parsed = parseDateInput(value);
  if (!parsed) {
    return '';
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (value: string, days: number) => {
  const parsed = parseDateInput(value);
  if (!parsed) {
    return '';
  }
  parsed.setDate(parsed.getDate() + Math.max(days, 0));
  return toIsoDate(
    `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`,
  );
};

const formatDateForInput = (value?: string | number[] | null) => {
  const parsed = toDateValue(value);
  if (!parsed) {
    return '';
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDuration = (value: string) => {
  const matches = value.match(/\d+/g) ?? [];
  return {
    days: parseNumber(matches[0] ?? 1),
    nights: parseNumber(matches[1] ?? Math.max(parseNumber(matches[0] ?? 1) - 1, 0)),
  };
};

export const toAdminTourPayload = (formData: AdminTourFormState) => {
  const duration = parseDuration(formData.duration);
  const departureDate = toIsoDate(formData.startDate);
  const returnDate = departureDate ? addDays(formData.startDate, Math.max(duration.days - 1, 0)) : '';

  return {
    tourName: formData.title,
    tourCode: formData.code || `TOUR-${Date.now()}`,
    slug: formData.slug || slugify(formData.title),
    categoryId: formData.categoryId ? Number(formData.categoryId) : null,
    shortDescription: formData.description.slice(0, 200),
    description: formData.description,
    featuredImage: formData.image,
    videoUrl: '',
    departureLocation: formData.location,
    destination: formData.location,
    durationDays: duration.days || 1,
    durationNights: duration.nights,
    basePrice: parseNumber(formData.originalPrice || formData.price),
    adultPrice: parseNumber(formData.price),
    childPrice: parseNumber(formData.childPrice),
    infantPrice: parseNumber(formData.infantPrice),
    status: formData.status === 'active' ? 'PUBLISHED' : 'DRAFT',
    itinerary: formData.itinerary.map((item) => ({
      dayNumber: String(item.day),
      dayTitle: item.title,
      dep: formData.location,
      description: item.content,
      image: item.image || formData.image,
    })),
    schedules: departureDate
      ? [
          {
            departureDate,
            returnDate: returnDate || departureDate,
            availableSeats: parseNumber(formData.remainingSlots),
            note: '',
            status: 'AVAILABLE',
          },
        ]
      : [],
  };
};

export const toAdminTourFormState = (tour: TourDetailApi, categoryId = ''): AdminTourFormState => ({
  title: tour.tourName || '',
  categoryId,
  position: 0,
  status: normalizeTourStatus(tour.status),
  price: parseNumber(tour.adultPrice),
  childPrice: parseNumber(tour.childPrice),
  infantPrice: parseNumber(tour.infantPrice),
  originalPrice: parseNumber(tour.basePrice ?? tour.adultPrice),
  remainingSlots: parseNumber(tour.schedules?.[0]?.availableSlots ?? tour.schedules?.[0]?.availableSeats),
  childRemainingSlots: 0,
  infantRemainingSlots: 0,
  duration: formatDuration(tour.durationDays, tour.durationNights),
  startDate: formatDateForInput(tour.schedules?.[0]?.departureDate),
  location: tour.destination || tour.departureLocation || '',
  description: tour.description || '',
  image: tour.featuredImage || FALLBACK_IMAGE,
  slug: tour.slug || '',
  code: tour.tourCode || '',
  itinerary:
    tour.itinerary?.map((item, index) => ({
      day: parseNumber(item.dayNumber) || index + 1,
      title: item.dayTitle || '',
      content: item.description || '',
      image: item.image,
    })) ?? [{ day: 1, title: '', content: '' }],
});

export const fetchPublicToursPage = async (params?: Record<string, unknown>): Promise<PaginatedResult<Tour>> => {
  const page = await unwrap<SpringPage<PublicTourApi>>(
    apiClient.get('/tours', {
      params: {
        page: 0,
        pageSize: 100,
        status: 'PUBLISHED',
        ...params,
      },
    }),
  );

  return {
    items: (page.content ?? []).map(mapSummaryToTour),
    page: parseNumber(page.number),
    pageSize: parseNumber(page.size),
    totalPages: parseNumber(page.totalPages),
    totalElements: parseNumber(page.totalElements),
  };
};

export const fetchPublicTours = async (params?: Record<string, unknown>) => {
  const result = await fetchPublicToursPage(params);
  return result.items;
};

export const fetchTourDetail = async (slug: string) => {
  const response = await unwrap<TourDetailApi>(apiClient.get(`/tours/${encodeURIComponent(slug)}`));
  return mapDetailToTour(response);
};

export const calculateTourPrice = async (payload: {
  tourId?: number;
  slug?: string;
  scheduleId: number;
  adultQty: number;
  childQty: number;
  infantQty: number;
}): Promise<TourPriceQuote> => {
  const response = await unwrap<PriceQuoteApi>(apiClient.post('/tours/calculate-price', payload));
  return {
    adultSubtotal: parseNumber(response.adultSubtotal),
    childSubtotal: parseNumber(response.childSubtotal),
    infantSubtotal: parseNumber(response.infantSubtotal),
    subtotal: parseNumber(response.subtotal),
    finalAmount: parseNumber(response.finalAmount),
    availableSlots: parseNumber(response.availableSlots),
    isAvailable: Boolean(response.isAvailable ?? response.available),
  };
};

export const fetchRelatedTours = async (tourId: string, limit = 4) => {
  const response = await unwrap<PublicTourApi[]>(
    apiClient.get('/tours/related', {
      params: { tourId, limit },
    }),
  );

  return response.map(mapSummaryToTour);
};

export const fetchCategories = async (activeOnly = false) => {
  const response = await unwrap<CategoryApi[] | SpringPage<CategoryApi>>(
    apiClient.get(activeOnly ? '/category/active' : '/category/', {
      params: activeOnly ? undefined : { page: 0, pageSize: 100 },
    }),
  );

  const categories = Array.isArray(response) ? response : response.content ?? [];
  return categories.map(mapCategory);
};

export const createCategory = async (category: Partial<FrontendCategory>) =>
  unwrap<number>(
    apiClient.post('/category/', {
      categoryName: category.name,
      slug: category.slug || slugify(category.name || ''),
      description: category.description || '',
      imageUrl: category.image || '',
      displayOrder: parseNumber(category.position),
      status: category.status === 'inactive' ? 'INACTIVE' : 'ACTIVE',
    }),
  );

export const updateCategoryApi = async (id: string, category: Partial<FrontendCategory>) =>
  unwrap(
    apiClient.put(`/category/${id}`, {
      categoryName: category.name,
      slug: category.slug || slugify(category.name || ''),
      description: category.description || '',
      imageUrl: category.image || '',
      displayOrder: parseNumber(category.position),
      status: category.status === 'inactive' ? 'INACTIVE' : 'ACTIVE',
    }),
  );

export const deleteCategoryApi = async (id: string) => unwrap(apiClient.delete(`/category/${id}`));

export const fetchAdminTours = async (params?: Record<string, unknown>) => {
  const page = await unwrap<SpringPage<AdminTourApi>>(
    apiClient.get('/admin/tours', {
      params: {
        page: 0,
        pageSize: 100,
        ...params,
      },
    }),
  );

  return (page.content ?? []).map(mapAdminTour);
};

export const fetchAdminTourDetail = async (id: string) =>
  unwrap<TourDetailApi>(apiClient.get(`/admin/tours/${id}/preview`));

export const createAdminTour = async (payload: ReturnType<typeof toAdminTourPayload>) =>
  unwrap<number>(apiClient.post('/admin/tours', payload));

export const updateAdminTour = async (id: string, payload: ReturnType<typeof toAdminTourPayload>) =>
  unwrap(apiClient.put(`/admin/tours/${id}`, payload));

export const deleteAdminTour = async (id: string) => unwrap(apiClient.delete(`/admin/tours/${id}`));

export const loginAdmin = async (email: string, password: string): Promise<AdminUser> => {
  const response = await unwrap<LoginResponseApi>(apiClient.post('/user/login', { email, password }));
  const role = normalizeText(response.role);
  return {
    id: String(response.id),
    name: response.fullName,
    email: response.email,
    role: role === 'admin' ? 'admin' : role === 'staff' ? 'staff' : 'user',
    avatar: response.avatarUrl,
  };
};

export const loginUser = async (email: string, password: string): Promise<UserSession> => {
  const response = await unwrap<LoginResponseApi>(apiClient.post('/user/login', { email, password }));
  return {
    id: String(response.id),
    name: response.fullName,
    email: response.email,
    avatar: response.avatarUrl,
  };
};

export const registerUser = async (payload: { fullName: string; email: string; password: string }) =>
  unwrap<number>(
    apiClient.post('/user/register', {
      fullName: payload.fullName,
      email: payload.email,
      passwordHash: payload.password,
    }),
  );

export const createCheckoutOrder = async (payload: CheckoutPayload, user?: UserSession | null) =>
  unwrap<number>(
    apiClient.post(
      '/order/',
      {
        ...payload,
        paymentOption: payload.paymentOption.toUpperCase(),
      },
      { headers: buildCurrentUserHeaders(user) },
    ),
  );

export const fetchOrders = async () => {
  const page = await unwrap<SpringPage<OrderApi>>(
    apiClient.get('/order/', {
      params: { page: 0, pageSize: 100 },
    }),
  );

  return (page.content ?? []).map(mapOrder);
};

export const fetchOrderDetail = async (id: string) => {
  const response = await unwrap<OrderApi>(apiClient.get(`/order/${id}`));
  return mapOrder(response);
};

export const fetchMyOrders = async (
  user: UserSession,
  params?: { page?: number; size?: number },
): Promise<PaginatedResult<AdminOrder>> => {
  const response = await unwrap<BackendPaged<OrderApi>>(
    apiClient.get('/order/my-orders', {
      params: {
        page: 0,
        size: 10,
        ...params,
      },
      headers: buildCurrentUserHeaders(user),
    }),
  );

  return {
    items: (response.items ?? []).map(mapOrder),
    page: parseNumber(response.page),
    pageSize: parseNumber(response.pageSize),
    totalPages: parseNumber(response.totalPage),
    totalElements: parseNumber(response.totalElements),
  };
};

export const cancelMyOrder = async (id: string, user: UserSession, reason?: string) =>
  unwrap(
    apiClient.put(
      `/order/${id}/cancel`,
      reason && reason.trim() ? { reason: reason.trim() } : null,
      { headers: buildCurrentUserHeaders(user) },
    ),
  );

export const confirmOrderParticipationApi = async (
  id: string,
  user: UserSession,
  payload?: { note?: string },
) =>
  unwrap(
    apiClient.patch(
      `/order/${id}/participation`,
      { note: payload?.note || '' },
      { headers: buildCurrentUserHeaders(user) },
    ),
  );

export const updateOrderStatusApi = async (id: string, status: AdminOrder['status']) =>
  unwrap(apiClient.patch(`/order/${id}/status`, null, { params: { status: status.toUpperCase() } }));

export const updateOrderPaymentStatusApi = async (id: string, status: AdminOrder['paymentStatus']) =>
  unwrap(apiClient.patch(`/order/${id}/payment-status`, null, { params: { status: status.toUpperCase() } }));

export const recordOrderPaymentApi = async (
  id: string,
  payload: { amount: number; paymentMethod?: string; transactionId?: string; note?: string },
) =>
  unwrap(
    apiClient.patch(`/order/${id}/payment`, {
      amount: parseNumber(payload.amount),
      paymentMethod: payload.paymentMethod,
      transactionId: payload.transactionId,
      note: payload.note,
    }),
  );

export const updateOrderItemCheckInApi = async (
  orderId: string,
  detailId: string,
  payload: {
    checkedInAdultQuantity: number;
    checkedInChildQuantity: number;
    checkedInInfantQuantity: number;
    noShowAdultQuantity: number;
    noShowChildQuantity: number;
    noShowInfantQuantity: number;
    note?: string;
  },
) =>
  unwrap(
    apiClient.patch(`/order/${orderId}/items/${detailId}/check-in`, {
      checkedInAdultQuantity: parseNumber(payload.checkedInAdultQuantity),
      checkedInChildQuantity: parseNumber(payload.checkedInChildQuantity),
      checkedInInfantQuantity: parseNumber(payload.checkedInInfantQuantity),
      noShowAdultQuantity: parseNumber(payload.noShowAdultQuantity),
      noShowChildQuantity: parseNumber(payload.noShowChildQuantity),
      noShowInfantQuantity: parseNumber(payload.noShowInfantQuantity),
      note: payload.note || '',
    }),
  );

export const fetchUsers = async () => {
  const response = await unwrap<LegacyPage<UserApi[]>>(
    apiClient.get('/user/', {
      params: { page: 0, pageSize: 100 },
    }),
  );

  const items = Array.isArray(response.item) ? response.item : [];
  return items.map(mapAdminUser);
};

export const fetchUserDetail = async (id: string) => {
  const response = await unwrap<UserApi>(apiClient.get(`/user/${id}`));
  return mapAdminUser(response);
};

export const fetchUserProfile = async (id: string): Promise<UserSession> => {
  const response = await unwrap<UserApi>(apiClient.get(`/user/${id}`));
  return {
    id: String(response.id),
    name: response.fullName,
    email: response.email,
    avatar: response.avatarUrl || FALLBACK_AVATAR,
    phone: response.phone || '',
    address: response.address || '',
  };
};

export const updateAdminUser = async (id: string, payload: AdminUserUpdatePayload) =>
  unwrap(apiClient.patch(`/user/update/${id}`, payload));

export const deleteUserApi = async (id: string) => unwrap(apiClient.delete(`/user/delete/${id}`));

export const changeUserStatusApi = async (id: string, status: AdminUserRow['status']) =>
  unwrap(apiClient.put(`/user/${id}/status`, { status }));

const buildNewsContent = (tour: Tour) => {
  const description = tour.description || `Hanh trinh ${tour.title} dang thu hut nhieu du khach trong thoi gian gan day.`;
  return `${description}\n\nTour co thoi gian ${tour.duration.toLowerCase()}, diem den noi bat la ${tour.location}. Neu ban dang tim mot chuyen di can bang giua trai nghiem va chi phi, day la mot lua chon dang can nhac cho ke hoach sap toi.`;
};

export const buildTravelNews = (tours: Tour[]): News[] =>
  tours.slice(0, 6).map((tour, index) => ({
    id: tour.id,
    slug: slugify(`${tour.title}-${tour.id}`),
    title:
      index === 0
        ? `Cam nang len lich cho ${tour.title}`
        : `Goi y hanh trinh ${tour.location}: ${tour.title}`,
    image: tour.image,
    date: tour.startDate !== 'Lien he' ? tour.startDate : formatDate(new Date().toISOString()),
    excerpt:
      tour.description?.slice(0, 140) ||
      `Khong gian, lich trinh va muc gia cua ${tour.title} dang duoc quan tam boi nhieu du khach.`,
    content: buildNewsContent(tour),
    path: `/tin-tuc/${slugify(`${tour.title}-${tour.id}`)}`,
    relatedTourSlug: tour.slug,
  }));

export const fetchTravelNews = async () => {
  const tours = await fetchPublicTours({ pageSize: 6, sort: 'newest' });
  return buildTravelNews(tours);
};
