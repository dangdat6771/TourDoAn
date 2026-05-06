import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Calendar, Clock, User, ChevronRight, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import type { Tour } from '../types';
import { calculateTourPrice, fetchTourDetail, type TourPriceQuote } from '../services/travelApi';
import SafeImage from '../components/common/SafeImage';

const fallbackQuote = (tour: Tour | null, quantities: { adults: number; children: number; infants: number }): TourPriceQuote => ({
  adultSubtotal: (tour?.price ?? 0) * quantities.adults,
  childSubtotal: (tour?.childPrice ?? 0) * quantities.children,
  infantSubtotal: (tour?.infantPrice ?? 0) * quantities.infants,
  subtotal:
    (tour?.price ?? 0) * quantities.adults +
    (tour?.childPrice ?? 0) * quantities.children +
    (tour?.infantPrice ?? 0) * quantities.infants,
  finalAmount:
    (tour?.price ?? 0) * quantities.adults +
    (tour?.childPrice ?? 0) * quantities.children +
    (tour?.infantPrice ?? 0) * quantities.infants,
  availableSlots: tour?.remainingSlots ?? 0,
  isAvailable: true,
});

const TourDetail = () => {
  const { slugOrId } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [isPricing, setIsPricing] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [priceQuote, setPriceQuote] = useState<TourPriceQuote | null>(null);
  const [quantities, setQuantities] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      if (!slugOrId) {
        setError('Khong tim thay tour.');
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchTourDetail(decodeURIComponent(slugOrId));
        if (active) {
          setTour(data);
          setSelectedScheduleId(data.selectedScheduleId || data.schedules?.[0]?.id || '');
          setPriceQuote(fallbackQuote(data, quantities));
        }
      } catch {
        if (active) {
          setError('Khong the tai chi tiet tour.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadDetail();
    return () => {
      active = false;
    };
  }, [slugOrId]);

  useEffect(() => {
    let active = true;

    const quotePrice = async () => {
      if (!tour || !selectedScheduleId) {
        setPriceQuote(fallbackQuote(tour, quantities));
        return;
      }

      setIsPricing(true);
      setPriceError('');

      try {
        const quote = await calculateTourPrice({
          tourId: Number(tour.id),
          scheduleId: Number(selectedScheduleId),
          adultQty: quantities.adults,
          childQty: quantities.children,
          infantQty: quantities.infants,
        });

        if (active) {
          setPriceQuote(quote);
        }
      } catch {
        if (active) {
          setPriceError('Khong the tinh gia tu dong. He thong dang hien thi gia tam tinh.');
          setPriceQuote(fallbackQuote(tour, quantities));
        }
      } finally {
        if (active) {
          setIsPricing(false);
        }
      }
    };

    quotePrice();
    return () => {
      active = false;
    };
  }, [tour, selectedScheduleId, quantities]);

  const selectedSchedule = useMemo(
    () => tour?.schedules?.find((schedule) => schedule.id === selectedScheduleId),
    [selectedScheduleId, tour],
  );
  const itineraryFallbackNote = selectedSchedule?.note || tour?.schedules?.find((schedule) => schedule.note)?.note || '';

  const handleQuantityChange = (type: keyof typeof quantities, delta: number) => {
    setMessage('');
    setQuantities((prev) => ({
      ...prev,
      [type]: Math.max(type === 'adults' ? 1 : 0, prev[type] + delta),
    }));
  };

  const totalPassengers = quantities.adults + quantities.children + quantities.infants;
  const totalPrice = priceQuote?.finalAmount ?? 0;
  const availableSlots = priceQuote?.availableSlots ?? selectedSchedule?.availableSlots ?? tour?.remainingSlots ?? 0;
  const isBookable = Boolean(selectedScheduleId) && Boolean(priceQuote?.isAvailable ?? availableSlots >= totalPassengers);

  const handleAddToCart = () => {
    if (!tour || !selectedSchedule) {
      setMessage('Vui long chon lich khoi hanh truoc khi them vao gio hang.');
      return;
    }

    if (!isBookable) {
      setMessage('So luong hanh khach vuot qua so cho con trong.');
      return;
    }

    addItem({
      ...tour,
      cartKey: `${tour.id}-${selectedSchedule.id}`,
      selectedScheduleId: selectedSchedule.id,
      selectedScheduleLabel: selectedSchedule.departureDate,
      startDate: selectedSchedule.departureDate,
      remainingSlots: availableSlots,
      quantity: quantities,
      totalPrice,
    });

    setMessage('Da them tour vao gio hang.');
  };

  if (isLoading) {
    return <div className="container py-20 text-center text-gray-500">Dang tai chi tiet tour...</div>;
  }

  if (error || !tour) {
    return (
      <div className="container py-20">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || 'Khong tim thay tour.'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="relative h-64 md:h-80 flex items-center overflow-hidden">
        <SafeImage
          src={tour.image}
          alt={tour.title}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]"></div>
        <div className="container relative z-10 text-white">
          <h1 className="text-3xl md:text-5xl font-black uppercase mb-4 max-w-4xl">{tour.title}</h1>
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <span>Trang Chu</span>
            <ChevronRight size={16} />
            <span>{tour.category === 'domestic' ? 'Tour Trong Nuoc' : 'Tour Nuoc Ngoai'}</span>
            <ChevronRight size={16} />
            <span className="text-secondary">{tour.title}</span>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
              <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                <SafeImage src={tour.image} alt={tour.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-primary mb-6">Thong Tin Tour</h2>
              <p className="text-gray-600 leading-relaxed">{tour.description || 'Dang cap nhat mo ta tour.'}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-primary mb-6">Lich Khoi Hanh</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {(tour.schedules ?? []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-8 text-center text-sm text-gray-500 md:col-span-2">
                    Tour nay chua co lich khoi hanh de dat cho.
                  </div>
                ) : (
                  (tour.schedules ?? []).map((schedule) => (
                    <button
                      key={schedule.id}
                      type="button"
                      onClick={() => {
                        setSelectedScheduleId(schedule.id);
                        setMessage('');
                      }}
                      className={`rounded-2xl border p-5 text-left transition ${
                        selectedScheduleId === schedule.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-200 bg-gray-50 hover:border-primary/40'
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{schedule.status}</p>
                      <h3 className="mt-2 text-lg font-bold text-gray-900">{schedule.departureDate}</h3>
                      <p className="mt-1 text-sm text-gray-500">Ve ngay {schedule.returnDate}</p>
                      <p className="mt-3 text-sm text-gray-600">Con {schedule.availableSlots} cho trong dot nay.</p>
                      {schedule.note && <p className="mt-3 text-sm leading-6 text-gray-500">{schedule.note}</p>}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-primary mb-8">Lich Trinh Tour</h2>
              <div className="flex flex-col gap-6">
                {(tour.itinerary ?? []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-8 text-center text-sm text-gray-500">
                    <p>Tour nay chua co lich trinh chi tiet theo tung ngay tu backend.</p>
                    {itineraryFallbackNote && (
                      <p className="mt-3 rounded-2xl bg-gray-50 px-4 py-3 text-left leading-6 text-gray-600">
                        Ghi chu dot khoi hanh dang chon: {itineraryFallbackNote}
                      </p>
                    )}
                  </div>
                ) : (
                  (tour.itinerary ?? []).map((item) => (
                    <div key={item.day} className="relative pl-12 pb-8 border-l-2 border-dashed border-primary/30 last:border-0 last:pb-0">
                      <div className="absolute left-[-11px] top-0 w-5 h-5 bg-primary rounded-full border-4 border-white shadow-sm"></div>
                      <div className="bg-primary text-white px-4 py-1 rounded-lg text-xs font-bold inline-block mb-3 uppercase">
                        Ngay {item.day} | {item.title}
                      </div>
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.content}</p>
                        {item.image && (
                          <div className="aspect-video rounded-xl overflow-hidden max-w-md">
                            <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-primary mb-4">Chuyen Di Cua Ban</h3>
                <div className="flex gap-4 mb-4">
                  <SafeImage src={tour.image} alt="Tour" className="w-24 h-24 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-sm line-clamp-2">{tour.title}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} size={12} fill={index < Math.floor(tour.rating) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">{tour.reviewsCount} luot danh gia</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin size={16} className="text-primary" />
                    <span>Ma Tour: <span className="font-bold text-gray-900">{tour.code || tour.id}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock size={16} className="text-primary" />
                    <span>Thoi Gian: <span className="font-bold text-gray-900">{tour.duration}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <User size={16} className="text-primary" />
                    <span>Diem Den: <span className="font-bold text-gray-900">{tour.location}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar size={16} className="text-primary" />
                    <span>Ngay Khoi Hanh: <span className="font-bold text-gray-900">{selectedSchedule?.departureDate || tour.startDate}</span></span>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-bold text-gray-700">Lich khoi hanh</label>
                  <select
                    value={selectedScheduleId}
                    onChange={(event) => {
                      setSelectedScheduleId(event.target.value);
                      setMessage('');
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {(tour.schedules ?? []).map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.departureDate} - con {schedule.availableSlots} cho
                      </option>
                    ))}
                  </select>
                  {selectedSchedule ? (
                    <p className="text-xs text-gray-500">
                      Ve: {selectedSchedule.returnDate} | Trang thai: {selectedSchedule.status}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600">Tour nay chua co lich khoi hanh phu hop.</p>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-sm font-bold text-gray-700">So Luong Hanh Khach</label>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Nguoi lon:</span>
                      <span className="text-[10px] text-gray-400">{tour.price.toLocaleString()}d</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleQuantityChange('adults', -1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><Minus size={14} /></button>
                      <span className="w-4 text-center font-bold">{quantities.adults}</span>
                      <button type="button" onClick={() => handleQuantityChange('adults', 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><Plus size={14} /></button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Tre em:</span>
                      <span className="text-[10px] text-gray-400">{(tour.childPrice ?? 0).toLocaleString()}d</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleQuantityChange('children', -1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><Minus size={14} /></button>
                      <span className="w-4 text-center font-bold">{quantities.children}</span>
                      <button type="button" onClick={() => handleQuantityChange('children', 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><Plus size={14} /></button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Em be:</span>
                      <span className="text-[10px] text-gray-400">{(tour.infantPrice ?? 0).toLocaleString()}d</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleQuantityChange('infants', -1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><Minus size={14} /></button>
                      <span className="w-4 text-center font-bold">{quantities.infants}</span>
                      <button type="button" onClick={() => handleQuantityChange('infants', 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                  <p>Con trong: <span className="font-bold text-gray-900">{availableSlots}</span></p>
                  {isPricing && <p className="mt-1 text-xs text-gray-500">Dang tinh gia theo lich khoi hanh...</p>}
                  {priceError && <p className="mt-1 text-xs text-amber-600">{priceError}</p>}
                </div>

                {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

                <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                  <span className="font-bold text-gray-600">Tong cong:</span>
                  <span className="text-2xl font-black text-primary">{totalPrice.toLocaleString()}d</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isBookable}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg disabled:opacity-60"
                >
                  {isBookable ? 'Them Vao Gio Hang' : 'Khong du cho trong'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
