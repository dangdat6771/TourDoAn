import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createCheckoutOrder } from '../services/travelApi';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Ho ten phai it nhat 2 ky tu'),
  phone: z.string().min(10, 'So dien thoai khong hop le'),
  email: z.string().email('Email khong hop le'),
  address: z.string().min(5, 'Dia chi phai it nhat 5 ky tu'),
  paymentMethod: z.enum(['cash', 'momo', 'bank']),
  note: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'bank',
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const orderId = await createCheckoutOrder({
        customer: {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          note: data.note,
        },
        paymentMethod: data.paymentMethod,
        items: items.map((item) => {
          if (!item.selectedScheduleId) {
            throw new Error(`Tour ${item.title} chua co lich khoi hanh.`);
          }

          return {
            tourId: Number(item.id),
            scheduleId: Number(item.selectedScheduleId),
            adultQuantity: item.quantity.adults,
            childQuantity: item.quantity.children,
            infantQuantity: item.quantity.infants,
          };
        }),
      });

      setLastOrderId(String(orderId));
      clearCart();
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Khong the dat tour luc nay.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center">
        <div className="max-w-md mx-auto flex flex-col gap-6 items-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <Trash2 size={48} />
          </div>
          <h2 className="text-2xl font-bold">
            {lastOrderId ? `Don hang #${lastOrderId} da duoc tao` : 'Gio hang cua ban dang trong'}
          </h2>
          <p className="text-gray-500">
            {lastOrderId
              ? 'Thong tin dat tour da duoc gui len he thong. Nhan vien se lien he voi ban trong thoi gian som nhat.'
              : 'Hay kham pha them cac tour du lich hap dan va chon cho minh hanh trinh ung y nhat.'}
          </p>
          <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all">
            Quay lai Trang Chu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft size={16} />
            Quay lai mua hang
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-primary p-4 text-white font-bold">Gio Hang ({items.length})</div>
              <div className="p-6 flex flex-col gap-6">
                {items.map((item) => (
                  <div key={item.cartKey} className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <img src={item.image} alt={item.title} className="w-full sm:w-32 h-32 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-bold text-gray-900 leading-tight">{item.title}</h3>
                        <button type="button" onClick={() => removeItem(item.cartKey)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Ma Tour: {item.code || item.id}</span>
                        <span>Khoi hanh: {item.startDate}</span>
                        <span>Noi khoi hanh: {item.departureLocation || 'Dang cap nhat'}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Nguoi lon</span>
                            <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border">
                              <button type="button" onClick={() => updateQuantity(item.cartKey, { ...item.quantity, adults: Math.max(1, item.quantity.adults - 1) })} className="text-primary"><Minus size={12} /></button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity.adults}</span>
                              <button type="button" onClick={() => updateQuantity(item.cartKey, { ...item.quantity, adults: item.quantity.adults + 1 })} className="text-primary"><Plus size={12} /></button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Tre em</span>
                            <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border">
                              <button type="button" onClick={() => updateQuantity(item.cartKey, { ...item.quantity, children: Math.max(0, item.quantity.children - 1) })} className="text-primary"><Minus size={12} /></button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity.children}</span>
                              <button type="button" onClick={() => updateQuantity(item.cartKey, { ...item.quantity, children: item.quantity.children + 1 })} className="text-primary"><Plus size={12} /></button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Em be</span>
                            <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border">
                              <button type="button" onClick={() => updateQuantity(item.cartKey, { ...item.quantity, infants: Math.max(0, item.quantity.infants - 1) })} className="text-primary"><Minus size={12} /></button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity.infants}</span>
                              <button type="button" onClick={() => updateQuantity(item.cartKey, { ...item.quantity, infants: item.quantity.infants + 1 })} className="text-primary"><Plus size={12} /></button>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-primary">{item.totalPrice.toLocaleString()}d</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-primary p-4 text-white font-bold">Thong Tin Khach Hang</div>
              <div className="p-8">
                <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Ho va ten *</label>
                    <input {...register('fullName')} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Nhap ho ten..." />
                    {errors.fullName && <span className="text-xs text-red-500">{errors.fullName.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">So dien thoai *</label>
                    <input {...register('phone')} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Nhap so dien thoai..." />
                    {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Email *</label>
                    <input {...register('email')} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Nhap email..." />
                    {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Dia chi *</label>
                    <input {...register('address')} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Nhap dia chi..." />
                    {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">Ghi chu</label>
                    <textarea {...register('note')} rows={3} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Yeu cau dac biet..."></textarea>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col gap-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-primary p-4 text-white font-bold">Phuong Thuc Thanh Toan</div>
              <div className="p-6 flex flex-col gap-4">
                <label className="flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
                  <input type="radio" value="cash" {...register('paymentMethod')} className="w-4 h-4 text-primary" />
                  <Banknote className="text-gray-400" />
                  <span className="text-sm font-medium">Thanh toan tien mat</span>
                </label>
                <label className="flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
                  <input type="radio" value="momo" {...register('paymentMethod')} className="w-4 h-4 text-primary" />
                  <Wallet className="text-gray-400" />
                  <span className="text-sm font-medium">Vi MoMo</span>
                </label>
                <label className="flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
                  <input type="radio" value="bank" {...register('paymentMethod')} className="w-4 h-4 text-primary" />
                  <CreditCard className="text-gray-400" />
                  <span className="text-sm font-medium">Chuyen khoan ngan hang</span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8 flex flex-col gap-6">
                {submissionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{submissionError}</div>}

                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tong tien:</span>
                    <span className="font-bold text-gray-900">{totalPrice().toLocaleString()}d</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Giam gia:</span>
                    <span className="font-bold text-green-500">-0d</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-end">
                    <span className="font-bold text-gray-900">Thanh tien:</span>
                    <span className="text-3xl font-black text-primary">{totalPrice().toLocaleString()}d</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full bg-secondary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg text-lg uppercase tracking-wider disabled:opacity-70"
                >
                  {isSubmitting ? 'Dang gui don...' : 'Dat Tour Ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
