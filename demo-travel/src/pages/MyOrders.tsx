import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, CircleAlert, CreditCard, Eye, MapPinned, RefreshCcw, XCircle } from 'lucide-react';
import { cancelMyOrder, fetchMyOrders, getApiErrorMessage, type AdminOrder } from '../services/travelApi';
import { useUserStore } from '../store/useUserStore';

const statusLabel: Record<AdminOrder['status'], string> = {
  pending: 'Cho xac nhan',
  confirmed: 'Da xac nhan',
  processing: 'Dang xu ly',
  completed: 'Hoan thanh',
  cancelled: 'Da huy',
};

const paymentLabel: Record<AdminOrder['paymentStatus'], string> = {
  pending: 'Cho thanh toan',
  paid: 'Da thanh toan',
  cancelled: 'Da huy',
  refunded: 'Da hoan tien',
};

const MyOrders = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const setRedirectAfterLogin = useUserStore((state) => state.setRedirectAfterLogin);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setRedirectAfterLogin('/don-hang-cua-toi');
      navigate('/tai-khoan', { replace: true });
    }
  }, [isAuthenticated, navigate, setRedirectAfterLogin, user]);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const result = await fetchMyOrders(user, { page, size: 10 });
        if (active) {
          setOrders(result.items);
          setTotalPages(result.totalPages);
        }
      } catch (error) {
        if (active) {
          setError(getApiErrorMessage(error, 'Khong the tai danh sach don hang luc nay.'));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, [page, reloadToken, user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!user) {
      return;
    }

    setActiveOrderId(orderId);
    setError('');

    try {
      await cancelMyOrder(orderId, user);
      setReloadToken((current) => current + 1);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Khong the huy don hang nay.'));
    } finally {
      setActiveOrderId(null);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container max-w-5xl">
        <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Don Hang</p>
              <h1 className="mt-3 text-3xl font-black text-gray-900">Don hang cua toi</h1>
              <p className="mt-2 text-sm text-gray-500">Danh sach nay dang lay truc tiep tu backend theo tai khoan {user.email}.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/cart" className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90">
                Dat them tour
              </Link>
              <button
                type="button"
                onClick={() => setReloadToken((current) => current + 1)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                <RefreshCcw size={16} />
                Tai lai
              </button>
            </div>
          </div>

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          {isLoading ? (
            <div className="rounded-3xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-gray-500">
              Dang tai danh sach don hang...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-gray-500">
              Ban chua co don hang nao. Sau khi dat tour, don se hien tai day.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const firstItem = order.items[0];
                const canCancel = order.status !== 'completed' && order.status !== 'cancelled';

                return (
                  <div key={order.id} className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-black text-gray-900">{order.code}</h2>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                            {statusLabel[order.status]}
                          </span>
                          <span className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-secondary">
                            {paymentLabel[order.paymentStatus]}
                          </span>
                        </div>

                        <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                          <p className="inline-flex items-center gap-2">
                            <CalendarDays size={16} className="text-primary" />
                            {order.createdAt}
                          </p>
                          <p className="inline-flex items-center gap-2">
                            <CreditCard size={16} className="text-primary" />
                            {order.paymentMethod}
                          </p>
                          <p className="inline-flex items-center gap-2 md:col-span-2">
                            <MapPinned size={16} className="text-primary" />
                            {firstItem?.name || 'Tour dang cap nhat'}
                          </p>
                        </div>
                      </div>

                      <div className="md:text-right">
                        <p className="text-sm text-gray-500">Thanh tien</p>
                        <p className="text-2xl font-black text-primary">{order.finalAmount.toLocaleString()}d</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-white bg-white px-4 py-3 text-sm text-gray-600">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                {item.departureDate} - {item.returnDate}
                              </p>
                            </div>
                            <p className="font-bold text-primary">{item.subtotal.toLocaleString()}d</p>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Nguoi lon: {item.adultQuantity} | Tre em: {item.childQuantity} | Em be: {item.infantQuantity}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                        <Eye size={14} />
                        Don hang dang dung du lieu that tu backend, khong con doc tu mock store.
                      </div>

                      {canCancel ? (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={activeOrderId === order.id}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          <XCircle size={16} />
                          {activeOrderId === order.id ? 'Dang huy...' : 'Huy don'}
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
                          <CircleAlert size={14} />
                          Khong the huy
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Trang <span className="font-bold text-gray-900">{page + 1}</span> / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                  disabled={page === 0}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Truoc
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
