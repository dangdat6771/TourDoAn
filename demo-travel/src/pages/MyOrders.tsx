import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, CircleAlert, CreditCard, Eye, MapPinned, RefreshCcw, X, XCircle } from 'lucide-react';
import { cancelMyOrder, confirmOrderParticipationApi, fetchMyOrders, getApiErrorMessage, type AdminOrder } from '../services/travelApi';
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

const paymentOptionLabel: Record<AdminOrder['paymentOption'], string> = {
  full: 'Thanh toan toan bo',
  deposit: 'Dat coc',
};

const participationLabel: Record<AdminOrder['participationStatus'], string> = {
  pending: 'Cho xac nhan tham gia',
  confirmed: 'Da xac nhan tham gia',
};

const checkInLabel: Record<AdminOrder['checkInStatus'], string> = {
  not_started: 'Chua check-in',
  partial: 'Check-in mot phan',
  checked_in: 'Da check-in du',
  no_show: 'Vang mat',
  cancelled: 'Da huy',
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
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<AdminOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [participationNote, setParticipationNote] = useState('');
  const [activeParticipationOrderId, setActiveParticipationOrderId] = useState<string | null>(null);

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
          setSelectedOrder((current) => result.items.find((item) => item.id === current?.id) ?? current);
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

  const handleCancelOrder = async (orderId: string, reason?: string) => {
    if (!user) {
      return;
    }

    setActiveOrderId(orderId);
    setError('');

    try {
      await cancelMyOrder(orderId, user, reason);
      setCancelTargetOrder(null);
      setCancelReason('');
      setReloadToken((current) => current + 1);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Khong the huy don hang nay.'));
    } finally {
      setActiveOrderId(null);
    }
  };

  const handleConfirmParticipation = async (orderId: string) => {
    if (!user) {
      return;
    }

    setActiveParticipationOrderId(orderId);
    setError('');

    try {
      await confirmOrderParticipationApi(orderId, user, { note: participationNote });
      setParticipationNote('');
      setReloadToken((current) => current + 1);
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Khong the xac nhan tham gia luc nay.'));
    } finally {
      setActiveParticipationOrderId(null);
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
                const canConfirmParticipation =
                  order.status !== 'cancelled' &&
                  order.participationStatus !== 'confirmed' &&
                  order.paidAmount >= order.requiredDepositAmount &&
                  order.checkInStatus === 'not_started';

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
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700">
                            {participationLabel[order.participationStatus]}
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
                        <p className="mt-1 text-xs text-gray-500">{paymentOptionLabel[order.paymentOption]}</p>
                        <p className="text-xs text-gray-500">Da thu {order.paidAmount.toLocaleString()}d</p>
                        <p className="text-xs text-gray-500">Con thieu {order.outstandingAmount.toLocaleString()}d</p>
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
                          {item.checkInStatus !== 'not_started' && (
                            <p className="mt-2 text-xs text-gray-500">
                              Check-in: {item.checkedInAdultQuantity + item.checkedInChildQuantity + item.checkedInInfantQuantity} |
                              Vang: {item.noShowAdultQuantity + item.noShowChildQuantity + item.noShowInfantQuantity}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {order.cancellationReason && (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                        Ly do huy: {order.cancellationReason}
                        {order.refundAmount > 0 ? ` | So tien hoan: ${order.refundAmount.toLocaleString()}d` : ''}
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                        <Eye size={14} />
                        Don hang dang dung du lieu that tu backend, khong con doc tu mock store.
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setParticipationNote(order.participationNote || '');
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-white"
                        >
                          <Eye size={16} />
                          Chi tiet don
                        </button>
                        {canConfirmParticipation && (
                          <button
                            type="button"
                            onClick={() => handleConfirmParticipation(order.id)}
                            disabled={activeParticipationOrderId === order.id}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                          >
                            <CheckCircle2 size={16} />
                            {activeParticipationOrderId === order.id ? 'Dang xac nhan...' : 'Xac nhan tham gia'}
                          </button>
                        )}
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelTargetOrder(order);
                              setCancelReason('');
                            }}
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

      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Chi tiet don {selectedOrder.code}</h3>
                <p className="text-sm text-gray-500">{selectedOrder.createdAt}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4 text-sm">
                <h4 className="font-bold text-gray-900 mb-3">Thanh toan</h4>
                <div className="space-y-2 text-gray-600">
                  <p>Hinh thuc: <span className="font-bold text-gray-900">{paymentOptionLabel[selectedOrder.paymentOption]}</span></p>
                  <p>Trang thai thanh toan: <span className="font-bold text-gray-900">{paymentLabel[selectedOrder.paymentStatus]}</span></p>
                  <p>Tong tien: <span className="font-bold text-gray-900">{selectedOrder.finalAmount.toLocaleString()}d</span></p>
                  <p>Da thanh toan: <span className="font-bold text-emerald-700">{selectedOrder.paidAmount.toLocaleString()}d</span></p>
                  <p>Con thieu: <span className="font-bold text-amber-700">{selectedOrder.outstandingAmount.toLocaleString()}d</span></p>
                  <p>Han thanh toan: <span className="font-bold text-gray-900">{selectedOrder.balanceDueDate}</span></p>
                  <p>Tien coc toi thieu: <span className="font-bold text-gray-900">{selectedOrder.requiredDepositAmount.toLocaleString()}d</span></p>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 text-sm">
                <h4 className="font-bold text-gray-900 mb-3">Tham gia tour</h4>
                <div className="space-y-2 text-gray-600">
                  <p>Trang thai xac nhan: <span className="font-bold text-gray-900">{participationLabel[selectedOrder.participationStatus]}</span></p>
                  <p>Trang thai check-in: <span className="font-bold text-gray-900">{checkInLabel[selectedOrder.checkInStatus]}</span></p>
                  {selectedOrder.participationConfirmedAt !== 'Dang cap nhat' && (
                    <p>Da xac nhan luc: <span className="font-bold text-gray-900">{selectedOrder.participationConfirmedAt}</span></p>
                  )}
                  {selectedOrder.participationNote && (
                    <p>Ghi chu tham gia: <span className="font-bold text-gray-900">{selectedOrder.participationNote}</span></p>
                  )}
                  {selectedOrder.cancellationReason && (
                    <p>Ly do huy: <span className="font-bold text-gray-900">{selectedOrder.cancellationReason}</span></p>
                  )}
                  {selectedOrder.refundAmount > 0 && (
                    <p>So tien hoan: <span className="font-bold text-gray-900">{selectedOrder.refundAmount.toLocaleString()}d</span></p>
                  )}
                </div>

                {selectedOrder.participationStatus !== 'confirmed' &&
                  selectedOrder.status !== 'cancelled' &&
                  selectedOrder.paidAmount >= selectedOrder.requiredDepositAmount &&
                  selectedOrder.checkInStatus === 'not_started' && (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
                      <p className="text-sm font-bold text-gray-900">Xac nhan tham gia</p>
                      <textarea
                        rows={3}
                        value={participationNote}
                        onChange={(event) => setParticipationNote(event.target.value)}
                        className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ghi chu them cho dieu hanh (neu co)"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmParticipation(selectedOrder.id)}
                        disabled={activeParticipationOrderId === selectedOrder.id}
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle2 size={16} />
                        {activeParticipationOrderId === selectedOrder.id ? 'Dang xac nhan...' : 'Toi se tham gia tour nay'}
                      </button>
                    </div>
                  )}

                {selectedOrder.participationStatus !== 'confirmed' &&
                  selectedOrder.status !== 'cancelled' &&
                  selectedOrder.paidAmount < selectedOrder.requiredDepositAmount && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm text-amber-700">
                      Ban can thanh toan toi thieu {selectedOrder.requiredDepositAmount.toLocaleString()}d truoc khi xac nhan tham gia tour.
                    </div>
                  )}
              </div>
            </div>

            <div className="px-6 pb-6">
              <h4 className="font-bold text-gray-900 mb-3">Danh sach tour trong don</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
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
                    <p className="mt-2 text-xs text-gray-500">
                      Check-in: {checkInLabel[item.checkInStatus]} | Da den {item.checkedInAdultQuantity + item.checkedInChildQuantity + item.checkedInInfantQuantity} |
                      Vang {item.noShowAdultQuantity + item.noShowChildQuantity + item.noShowInfantQuantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {cancelTargetOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Huy don {cancelTargetOrder.code}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  He thong se ap dung chinh sach hoan tien hien tai. Ban co the de lai ly do de dieu hanh de xu ly nhanh hon.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCancelTargetOrder(null);
                  setCancelReason('');
                }}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              rows={4}
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              className="mt-5 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Ly do huy don, vi du: doi lich, thay doi ke hoach, khong du nguoi..."
            />

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCancelTargetOrder(null);
                  setCancelReason('');
                }}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Dong
              </button>
              <button
                type="button"
                onClick={() => handleCancelOrder(cancelTargetOrder.id, cancelReason)}
                disabled={activeOrderId === cancelTargetOrder.id}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {activeOrderId === cancelTargetOrder.id ? 'Dang huy...' : 'Xac nhan huy don'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
