import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  RefreshCcw,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  getApiErrorMessage,
  fetchOrders,
  recordOrderPaymentApi,
  updateOrderItemCheckInApi,
  updateOrderPaymentStatusApi,
  updateOrderStatusApi,
  type AdminOrder,
  type AdminOrderItem,
} from '../../services/travelApi';

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [activeCheckInItemId, setActiveCheckInItemId] = useState<string | null>(null);
  const [paymentDraft, setPaymentDraft] = useState({
    amount: '',
    paymentMethod: 'bank',
    transactionId: '',
    note: '',
  });
  const [checkInDrafts, setCheckInDrafts] = useState<Record<string, {
    checkedInAdultQuantity: string;
    checkedInChildQuantity: string;
    checkedInInfantQuantity: string;
    noShowAdultQuantity: string;
    noShowChildQuantity: string;
    noShowInfantQuantity: string;
    note: string;
  }>>({});

  const checkInLabel: Record<AdminOrder['checkInStatus'], string> = {
    not_started: 'Chua check-in',
    partial: 'Check-in mot phan',
    checked_in: 'Da check-in du',
    no_show: 'Vang mat',
    cancelled: 'Da huy',
  };

  const paymentOptionLabel: Record<AdminOrder['paymentOption'], string> = {
    full: 'Thanh toan toan bo',
    deposit: 'Dat coc',
  };

  const buildCheckInDraft = (item: AdminOrderItem) => ({
    checkedInAdultQuantity: String(item.checkedInAdultQuantity),
    checkedInChildQuantity: String(item.checkedInChildQuantity),
    checkedInInfantQuantity: String(item.checkedInInfantQuantity),
    noShowAdultQuantity: String(item.noShowAdultQuantity),
    noShowChildQuantity: String(item.noShowChildQuantity),
    noShowInfantQuantity: String(item.noShowInfantQuantity),
    note: item.checkInNote,
  });

  const loadOrders = async (selectedOrderId?: string) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchOrders();
      setOrders(data);
      if (selectedOrderId) {
        setSelectedOrder(data.find((order) => order.id === selectedOrderId) ?? null);
      }
    } catch {
      setError('Khong the tai danh sach don hang.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    setPaymentDraft({
      amount: selectedOrder.outstandingAmount > 0 ? String(selectedOrder.outstandingAmount) : '',
      paymentMethod: selectedOrder.paymentMethod || 'bank',
      transactionId: '',
      note: '',
    });
    setCheckInDrafts(
      Object.fromEntries(selectedOrder.items.map((item) => [item.id, buildCheckInDraft(item)])),
    );
  }, [selectedOrder]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesSearch =
          order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerPhone.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
      }),
    [orders, paymentFilter, searchTerm, statusFilter],
  );

  const handleStatusChange = async (id: string, status: AdminOrder['status']) => {
    try {
      await updateOrderStatusApi(id, status);
      await loadOrders(selectedOrder?.id === id ? id : undefined);
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Khong the cap nhat trang thai don hang.'));
    }
  };

  const handlePaymentStatusChange = async (id: string, status: AdminOrder['paymentStatus']) => {
    try {
      await updateOrderPaymentStatusApi(id, status);
      await loadOrders(selectedOrder?.id === id ? id : undefined);
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Khong the cap nhat trang thai thanh toan.'));
    }
  };

  const handleOpenOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setError('');
  };

  const handleRecordPayment = async () => {
    if (!selectedOrder) {
      return;
    }

    setIsRecordingPayment(true);
    setError('');

    try {
      await recordOrderPaymentApi(selectedOrder.id, {
        amount: Number(paymentDraft.amount),
        paymentMethod: paymentDraft.paymentMethod,
        transactionId: paymentDraft.transactionId,
        note: paymentDraft.note,
      });
      await loadOrders(selectedOrder.id);
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Khong the ghi nhan thanh toan.'));
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleCheckInDraftChange = (
    itemId: string,
    field: keyof typeof checkInDrafts[string],
    value: string,
  ) => {
    setCheckInDrafts((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] ?? {
          checkedInAdultQuantity: '0',
          checkedInChildQuantity: '0',
          checkedInInfantQuantity: '0',
          noShowAdultQuantity: '0',
          noShowChildQuantity: '0',
          noShowInfantQuantity: '0',
          note: '',
        }),
        [field]: value,
      },
    }));
  };

  const handleSubmitCheckIn = async (item: AdminOrderItem) => {
    if (!selectedOrder) {
      return;
    }

    const draft = checkInDrafts[item.id];
    if (!draft) {
      return;
    }

    setActiveCheckInItemId(item.id);
    setError('');

    try {
      await updateOrderItemCheckInApi(selectedOrder.id, item.id, {
        checkedInAdultQuantity: Number(draft.checkedInAdultQuantity),
        checkedInChildQuantity: Number(draft.checkedInChildQuantity),
        checkedInInfantQuantity: Number(draft.checkedInInfantQuantity),
        noShowAdultQuantity: Number(draft.noShowAdultQuantity),
        noShowChildQuantity: Number(draft.noShowChildQuantity),
        noShowInfantQuantity: Number(draft.noShowInfantQuantity),
        note: draft.note,
      });
      await loadOrders(selectedOrder.id);
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Khong the cap nhat check-in.'));
    } finally {
      setActiveCheckInItemId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quan ly don hang</h2>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
            <Filter size={16} />
            <span>Bo loc</span>
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
            <option value="all">Tat ca trang thai</option>
            <option value="pending">Cho xac nhan</option>
            <option value="confirmed">Da xac nhan</option>
            <option value="processing">Dang xu ly</option>
            <option value="completed">Hoan thanh</option>
            <option value="cancelled">Da huy</option>
          </select>
          <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
            <option value="all">Tat ca thanh toan</option>
            <option value="pending">Cho thanh toan</option>
            <option value="paid">Da thanh toan</option>
            <option value="cancelled">Da huy</option>
            <option value="refunded">Da hoan tien</option>
          </select>
          <button onClick={() => { setStatusFilter('all'); setPaymentFilter('all'); setSearchTerm(''); }} className="text-red-500 text-sm font-bold flex items-center gap-1 hover:underline">
            <RefreshCcw size={14} />
            Xoa bo loc
          </button>
        </div>

        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Tim kiem..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Ma don</th>
                <th className="px-6 py-4">Khach hang</th>
                <th className="px-6 py-4">Danh sach tour</th>
                <th className="px-6 py-4">Thanh toan</th>
                <th className="px-6 py-4">Trang thai</th>
                <th className="px-6 py-4">Ngay dat</th>
                <th className="px-6 py-4 text-right">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Dang tai don hang...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Khong co don hang nao.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-primary">{order.code}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-0.5">
                        <p className="font-bold text-gray-800">{order.customerName}</p>
                        <p className="text-gray-500">{order.customerPhone}</p>
                        <p className="text-gray-400 text-xs">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((tourItem) => (
                          <div key={tourItem.id} className="text-[11px]">
                            <p className="font-bold text-gray-800">{tourItem.name}</p>
                            <p className="text-gray-500">
                              {tourItem.adultQuantity + tourItem.childQuantity + tourItem.infantQuantity} khach | {tourItem.subtotal.toLocaleString()}d
                            </p>
                          </div>
                        ))}
                        {order.items.length > 2 && <p className="text-[11px] text-gray-400">+{order.items.length - 2} tour khac</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-2">
                        <p className="text-gray-800 font-bold">{order.finalAmount.toLocaleString()}d</p>
                        <p className="text-gray-500">Da thu: {order.paidAmount.toLocaleString()}d</p>
                        <p className="text-gray-500">Con thieu: {order.outstandingAmount.toLocaleString()}d</p>
                        <p className="text-gray-500">PTTT: {order.paymentMethod}</p>
                        <select
                          value={order.paymentStatus}
                          onChange={(event) => handlePaymentStatusChange(order.id, event.target.value as AdminOrder['paymentStatus'])}
                          className="text-[10px] font-bold bg-transparent border-none p-0 outline-none cursor-pointer uppercase"
                        >
                          <option value="pending">Cho thanh toan</option>
                          <option value="paid">Da thanh toan</option>
                          <option value="cancelled">Da huy</option>
                          <option value="refunded">Da hoan tien</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(event) => handleStatusChange(order.id, event.target.value as AdminOrder['status'])}
                        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase outline-none cursor-pointer bg-gray-100"
                      >
                        <option value="pending">Cho xac nhan</option>
                        <option value="confirmed">Da xac nhan</option>
                        <option value="processing">Dang xu ly</option>
                        <option value="completed">Hoan thanh</option>
                        <option value="cancelled">Da huy</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] text-gray-400">{order.createdAt}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/orders/check-in/${order.id}`}
                          className="p-2 hover:bg-emerald-50 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
                          title="Mo man check-in"
                        >
                          <CheckCircle2 size={18} />
                        </Link>
                        <button type="button" onClick={() => handleOpenOrder(order)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 p-3 sm:p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="flex w-full max-w-5xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
            <div className="shrink-0 flex items-center justify-between border-b px-4 py-4 sm:px-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Chi tiet don hang {selectedOrder.code}</h3>
                <p className="text-sm text-gray-500">{selectedOrder.createdAt}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="shrink-0 border-b bg-gray-50 px-4 py-3 sm:px-6">
              <Link
                to={`/admin/orders/check-in/${selectedOrder.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <CheckCircle2 size={16} />
                Mo man check-in rieng
              </Link>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
              <div className="rounded-2xl bg-gray-50 p-4 text-sm min-w-0">
                <h4 className="font-bold text-gray-900 mb-3">Thong tin khach</h4>
                <p>{selectedOrder.customerName}</p>
                <p>{selectedOrder.customerPhone}</p>
                <p>{selectedOrder.customerEmail}</p>
                <p>{selectedOrder.customerAddress || 'Chua cap nhat dia chi'}</p>
                {selectedOrder.customerNote && <p className="mt-3 text-gray-500">Ghi chu: {selectedOrder.customerNote}</p>}
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 text-sm min-w-0">
                <h4 className="font-bold text-gray-900 mb-3">Thanh toan</h4>
                <p>Hinh thuc: {paymentOptionLabel[selectedOrder.paymentOption]}</p>
                <p>Phuong thuc: {selectedOrder.paymentMethod}</p>
                <p>Trang thai: {selectedOrder.paymentStatus}</p>
                <p>Tong tien: {selectedOrder.totalAmount.toLocaleString()}d</p>
                <p>Giam gia: {selectedOrder.discountAmount.toLocaleString()}d</p>
                <p>Tien coc toi thieu: {selectedOrder.requiredDepositAmount.toLocaleString()}d</p>
                <p>Da thu: {selectedOrder.paidAmount.toLocaleString()}d</p>
                <p>Con thieu: {selectedOrder.outstandingAmount.toLocaleString()}d</p>
                <p>Han thanh toan: {selectedOrder.balanceDueDate}</p>
                <p>Check-in tong: {checkInLabel[selectedOrder.checkInStatus]}</p>
                {selectedOrder.refundAmount > 0 && <p>Hoan tien: {selectedOrder.refundAmount.toLocaleString()}d</p>}
                {selectedOrder.cancellationReason && <p>Ly do huy: {selectedOrder.cancellationReason}</p>}
                <p className="font-bold text-primary mt-2">Thanh tien: {selectedOrder.finalAmount.toLocaleString()}d</p>

                {selectedOrder.status !== 'cancelled' && (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                    <h5 className="font-bold text-gray-900">Ghi nhan thanh toan</h5>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentDraft((current) => ({ ...current, amount: String(Math.max(selectedOrder.requiredDepositAmount - selectedOrder.paidAmount, 0)) }))}
                        className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-bold text-secondary"
                      >
                        Thu muc coc
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentDraft((current) => ({ ...current, amount: String(selectedOrder.outstandingAmount) }))}
                        className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary"
                      >
                        Thu so con lai
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={paymentDraft.amount}
                        onChange={(event) => setPaymentDraft((current) => ({ ...current, amount: event.target.value }))}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="So tien thu"
                      />
                      <select
                        value={paymentDraft.paymentMethod}
                        onChange={(event) => setPaymentDraft((current) => ({ ...current, paymentMethod: event.target.value }))}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="bank">Chuyen khoan</option>
                        <option value="cash">Tien mat</option>
                        <option value="momo">MoMo</option>
                      </select>
                      <input
                        value={paymentDraft.transactionId}
                        onChange={(event) => setPaymentDraft((current) => ({ ...current, transactionId: event.target.value }))}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ma giao dich"
                      />
                      <textarea
                        rows={2}
                        value={paymentDraft.note}
                        onChange={(event) => setPaymentDraft((current) => ({ ...current, note: event.target.value }))}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ghi chu noi bo"
                      />
                      <button
                        type="button"
                        onClick={handleRecordPayment}
                        disabled={isRecordingPayment || !paymentDraft.amount}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
                      >
                        {isRecordingPayment ? 'Dang ghi nhan...' : 'Ghi nhan thanh toan'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <h4 className="font-bold text-gray-900 mb-3">Danh sach tour</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-gray-200 p-4 text-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-gray-500">{item.departureDate} - {item.returnDate}</p>
                      </div>
                      <p className="font-bold text-primary">{item.subtotal.toLocaleString()}d</p>
                    </div>
                    <p className="mt-2 text-gray-500">
                      Nguoi lon: {item.adultQuantity} | Tre em: {item.childQuantity} | Em be: {item.infantQuantity}
                    </p>
                    <p className="mt-2 text-gray-500">
                      Check-in: {checkInLabel[item.checkInStatus]} | Da den {item.checkedInAdultQuantity + item.checkedInChildQuantity + item.checkedInInfantQuantity} |
                      Vang {item.noShowAdultQuantity + item.noShowChildQuantity + item.noShowInfantQuantity}
                    </p>
                    {item.checkInNote && <p className="mt-2 text-gray-500">Ghi chu check-in: {item.checkInNote}</p>}

                    {selectedOrder.status !== 'cancelled' && (
                      <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                        <h5 className="font-bold text-gray-900">Cap nhat check-in</h5>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          <label className="text-xs font-medium text-gray-600">
                            Da den nguoi lon
                            <input
                              type="number"
                              min="0"
                              max={item.adultQuantity}
                              value={checkInDrafts[item.id]?.checkedInAdultQuantity ?? '0'}
                              onChange={(event) => handleCheckInDraftChange(item.id, 'checkedInAdultQuantity', event.target.value)}
                              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </label>
                          <label className="text-xs font-medium text-gray-600">
                            Da den tre em
                            <input
                              type="number"
                              min="0"
                              max={item.childQuantity}
                              value={checkInDrafts[item.id]?.checkedInChildQuantity ?? '0'}
                              onChange={(event) => handleCheckInDraftChange(item.id, 'checkedInChildQuantity', event.target.value)}
                              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </label>
                          <label className="text-xs font-medium text-gray-600">
                            Da den em be
                            <input
                              type="number"
                              min="0"
                              max={item.infantQuantity}
                              value={checkInDrafts[item.id]?.checkedInInfantQuantity ?? '0'}
                              onChange={(event) => handleCheckInDraftChange(item.id, 'checkedInInfantQuantity', event.target.value)}
                              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </label>
                          <label className="text-xs font-medium text-gray-600">
                            Vang nguoi lon
                            <input
                              type="number"
                              min="0"
                              max={item.adultQuantity}
                              value={checkInDrafts[item.id]?.noShowAdultQuantity ?? '0'}
                              onChange={(event) => handleCheckInDraftChange(item.id, 'noShowAdultQuantity', event.target.value)}
                              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </label>
                          <label className="text-xs font-medium text-gray-600">
                            Vang tre em
                            <input
                              type="number"
                              min="0"
                              max={item.childQuantity}
                              value={checkInDrafts[item.id]?.noShowChildQuantity ?? '0'}
                              onChange={(event) => handleCheckInDraftChange(item.id, 'noShowChildQuantity', event.target.value)}
                              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </label>
                          <label className="text-xs font-medium text-gray-600">
                            Vang em be
                            <input
                              type="number"
                              min="0"
                              max={item.infantQuantity}
                              value={checkInDrafts[item.id]?.noShowInfantQuantity ?? '0'}
                              onChange={(event) => handleCheckInDraftChange(item.id, 'noShowInfantQuantity', event.target.value)}
                              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </label>
                        </div>
                        <textarea
                          rows={2}
                          value={checkInDrafts[item.id]?.note ?? ''}
                          onChange={(event) => handleCheckInDraftChange(item.id, 'note', event.target.value)}
                          className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Ghi chu check-in"
                        />
                        <button
                          type="button"
                          onClick={() => handleSubmitCheckIn(item)}
                          disabled={activeCheckInItemId === item.id}
                          className="mt-3 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-white transition hover:bg-secondary/90 disabled:opacity-60"
                        >
                          {activeCheckInItemId === item.id ? 'Dang cap nhat...' : 'Luu check-in'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
