import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, ClipboardList, CreditCard, RefreshCcw, Search, Users } from 'lucide-react';
import {
  fetchOrders,
  getApiErrorMessage,
  updateOrderItemCheckInApi,
  type AdminOrder,
  type AdminOrderItem,
} from '../../services/travelApi';

const checkInLabel: Record<AdminOrder['checkInStatus'], string> = {
  not_started: 'Chua check-in',
  partial: 'Check-in mot phan',
  checked_in: 'Da check-in du',
  no_show: 'Vang mat',
  cancelled: 'Da huy',
};

const participationLabel: Record<AdminOrder['participationStatus'], string> = {
  pending: 'Chua xac nhan tham gia',
  confirmed: 'Da xac nhan tham gia',
};

const paymentStatusLabel: Record<AdminOrder['paymentStatus'], string> = {
  pending: 'Cho thanh toan',
  paid: 'Da thanh toan',
  cancelled: 'Da huy',
  refunded: 'Da hoan tien',
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

const emptyDraft = {
  checkedInAdultQuantity: '0',
  checkedInChildQuantity: '0',
  checkedInInfantQuantity: '0',
  noShowAdultQuantity: '0',
  noShowChildQuantity: '0',
  noShowInfantQuantity: '0',
  note: '',
};

const OrderCheckIn = () => {
  const { id } = useParams();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminOrder['checkInStatus'] | 'ready' | 'waiting_payment'>('ready');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [checkInDrafts, setCheckInDrafts] = useState<Record<string, typeof emptyDraft>>({});

  const loadOrders = async (selectedOrderId?: string, showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError('');

    try {
      const data = await fetchOrders();
      setOrders(data);

      const preferredId = selectedOrderId ?? id;
      if (preferredId) {
        setSelectedOrder(data.find((order) => order.id === preferredId) ?? data[0] ?? null);
      } else {
        setSelectedOrder((current) => data.find((order) => order.id === current?.id) ?? data[0] ?? null);
      }
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Khong the tai man hinh check-in luc nay.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders(id);
  }, [id]);

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    setCheckInDrafts(
      Object.fromEntries(selectedOrder.items.map((item) => [item.id, buildCheckInDraft(item)])),
    );
  }, [selectedOrder]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        order.code.toLowerCase().includes(keyword) ||
        order.customerName.toLowerCase().includes(keyword) ||
        order.customerPhone.includes(keyword) ||
        order.items.some((item) => item.name.toLowerCase().includes(keyword));

      const hasMetRequiredPayment = order.status !== 'cancelled' && order.paidAmount >= order.requiredDepositAmount;
      const readyForCheckIn = hasMetRequiredPayment;
      const waitingPayment = order.status !== 'cancelled' && !hasMetRequiredPayment;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'ready' && readyForCheckIn) ||
        (statusFilter === 'waiting_payment' && waitingPayment) ||
        order.checkInStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  useEffect(() => {
    if (!selectedOrder && filteredOrders.length > 0) {
      setSelectedOrder(filteredOrders[0]);
      return;
    }

    if (selectedOrder && !filteredOrders.some((order) => order.id === selectedOrder.id)) {
      setSelectedOrder(filteredOrders[0] ?? null);
    }
  }, [filteredOrders, selectedOrder]);

  const handleCheckInDraftChange = (
    itemId: string,
    field: keyof typeof emptyDraft,
    value: string,
  ) => {
    setCheckInDrafts((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] ?? emptyDraft),
        [field]: value,
      },
    }));
  };

  const applyQuickTemplate = (item: AdminOrderItem, mode: 'full' | 'no_show' | 'reset') => {
    if (mode === 'full') {
      setCheckInDrafts((current) => ({
        ...current,
        [item.id]: {
          checkedInAdultQuantity: String(item.adultQuantity),
          checkedInChildQuantity: String(item.childQuantity),
          checkedInInfantQuantity: String(item.infantQuantity),
          noShowAdultQuantity: '0',
          noShowChildQuantity: '0',
          noShowInfantQuantity: '0',
          note: current[item.id]?.note ?? '',
        },
      }));
      return;
    }

    if (mode === 'no_show') {
      setCheckInDrafts((current) => ({
        ...current,
        [item.id]: {
          checkedInAdultQuantity: '0',
          checkedInChildQuantity: '0',
          checkedInInfantQuantity: '0',
          noShowAdultQuantity: String(item.adultQuantity),
          noShowChildQuantity: String(item.childQuantity),
          noShowInfantQuantity: String(item.infantQuantity),
          note: current[item.id]?.note ?? '',
        },
      }));
      return;
    }

    setCheckInDrafts((current) => ({
      ...current,
      [item.id]: {
        ...emptyDraft,
        note: current[item.id]?.note ?? '',
      },
    }));
  };

  const handleSubmitCheckIn = async (item: AdminOrderItem) => {
    if (!selectedOrder) {
      return;
    }

    const draft = checkInDrafts[item.id] ?? emptyDraft;
    setActiveItemId(item.id);
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
      await loadOrders(selectedOrder.id, true);
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Khong the cap nhat check-in cho muc nay.'));
    } finally {
      setActiveItemId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Van Hanh Tour</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">Check-in tour</h2>
          <p className="mt-2 text-sm text-gray-500">
            Staff co the loc don san sang, xem khach da xac nhan tham gia hay chua, va cap nhat check-in theo tung tour trong don.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-white"
          >
            <ClipboardList size={16} />
            Ve quan ly don hang
          </Link>
          <button
            type="button"
            onClick={() => loadOrders(selectedOrder?.id, true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            <RefreshCcw size={16} />
            {isRefreshing ? 'Dang tai lai...' : 'Tai lai du lieu'}
          </button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tim ma don, khach hang, ten tour"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mt-4 grid gap-2">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ready">San sang check-in</option>
                <option value="waiting_payment">Con thieu thanh toan</option>
                <option value="not_started">Chua check-in</option>
                <option value="partial">Check-in mot phan</option>
                <option value="checked_in">Da check-in du</option>
                <option value="no_show">Vang mat</option>
                <option value="cancelled">Da huy</option>
                <option value="all">Tat ca</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
                Dang tai danh sach don can check-in...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
                Chua co don nao phu hop bo loc hien tai.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const totalGuests = order.items.reduce(
                  (sum, item) => sum + item.adultQuantity + item.childQuantity + item.infantQuantity,
                  0,
                );
                const hasMetRequiredPayment = order.paidAmount >= order.requiredDepositAmount;

                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full rounded-3xl border p-4 text-left shadow-sm transition ${
                      selectedOrder?.id === order.id
                        ? 'border-primary bg-primary/[0.04]'
                        : 'border-gray-100 bg-white hover:border-primary/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-900">{order.code}</p>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase text-gray-600">
                        {checkInLabel[order.checkInStatus]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-800">{order.customerName}</p>
                    <p className="mt-1 text-xs text-gray-500">{order.items[0]?.name || 'Tour dang cap nhat'}</p>
                    <div className="mt-3 grid gap-2 text-xs text-gray-500">
                      <p className="inline-flex items-center gap-2">
                        <Users size={14} className="text-primary" />
                        {totalGuests} khach
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        {participationLabel[order.participationStatus]}
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <CreditCard size={14} className="text-amber-600" />
                        {hasMetRequiredPayment
                          ? `Da du dieu kien check-in${order.outstandingAmount > 0 ? `, con thieu ${order.outstandingAmount.toLocaleString()}d` : ''}`
                          : `Can thu them ${Math.max(order.requiredDepositAmount - order.paidAmount, 0).toLocaleString()}d de check-in`}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          {!selectedOrder ? (
            <div className="rounded-3xl border border-dashed border-gray-200 px-6 py-16 text-center text-sm text-gray-500">
              Chon mot don o cot ben trai de xem va cap nhat check-in.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedOrder.code}</h3>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                      {checkInLabel[selectedOrder.checkInStatus]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{selectedOrder.customerName} • {selectedOrder.customerPhone}</p>
                  <p className="mt-1 text-sm text-gray-500">{selectedOrder.customerEmail}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Tham gia</p>
                    <p className="mt-2 font-bold text-gray-900">{participationLabel[selectedOrder.participationStatus]}</p>
                    {selectedOrder.participationConfirmedAt !== 'Dang cap nhat' && (
                      <p className="mt-1 text-xs text-gray-500">{selectedOrder.participationConfirmedAt}</p>
                    )}
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Thanh toan</p>
                    <p className="mt-2 font-bold text-gray-900">{paymentStatusLabel[selectedOrder.paymentStatus]}</p>
                    <p className="mt-1 text-xs text-gray-500">Da thu {selectedOrder.paidAmount.toLocaleString()}d</p>
                    <p className="mt-1 text-xs text-gray-500">Moc toi thieu {selectedOrder.requiredDepositAmount.toLocaleString()}d</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Con thieu</p>
                    <p className={`mt-2 font-bold ${selectedOrder.outstandingAmount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {selectedOrder.outstandingAmount.toLocaleString()}d
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Han: {selectedOrder.balanceDueDate}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.participationNote && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Ghi chu khach hang: {selectedOrder.participationNote}
                </div>
              )}

              <div className="space-y-4">
                {selectedOrder.items.map((item) => {
                  const draft = checkInDrafts[item.id] ?? emptyDraft;
                  const totalBooked = item.adultQuantity + item.childQuantity + item.infantQuantity;
                  const totalCheckedIn =
                    Number(draft.checkedInAdultQuantity) +
                    Number(draft.checkedInChildQuantity) +
                    Number(draft.checkedInInfantQuantity);
                  const totalNoShow =
                    Number(draft.noShowAdultQuantity) +
                    Number(draft.noShowChildQuantity) +
                    Number(draft.noShowInfantQuantity);

                  return (
                    <div key={item.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{item.name}</p>
                          <p className="mt-1 inline-flex items-center gap-2 text-sm text-gray-500">
                            <CalendarDays size={15} className="text-primary" />
                            {item.departureDate} - {item.returnDate}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            Dat {totalBooked} khach | Da den {item.checkedInAdultQuantity + item.checkedInChildQuantity + item.checkedInInfantQuantity} |
                            Vang {item.noShowAdultQuantity + item.noShowChildQuantity + item.noShowInfantQuantity}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => applyQuickTemplate(item, 'full')}
                            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
                          >
                            Du khach
                          </button>
                          <button
                            type="button"
                            onClick={() => applyQuickTemplate(item, 'no_show')}
                            className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600"
                          >
                            Vang toan bo
                          </button>
                          <button
                            type="button"
                            onClick={() => applyQuickTemplate(item, 'reset')}
                            className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-600"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <label className="text-xs font-medium text-gray-600">
                          Da den nguoi lon
                          <input
                            type="number"
                            min="0"
                            max={item.adultQuantity}
                            value={draft.checkedInAdultQuantity}
                            onChange={(event) => handleCheckInDraftChange(item.id, 'checkedInAdultQuantity', event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </label>
                        <label className="text-xs font-medium text-gray-600">
                          Da den tre em
                          <input
                            type="number"
                            min="0"
                            max={item.childQuantity}
                            value={draft.checkedInChildQuantity}
                            onChange={(event) => handleCheckInDraftChange(item.id, 'checkedInChildQuantity', event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </label>
                        <label className="text-xs font-medium text-gray-600">
                          Da den em be
                          <input
                            type="number"
                            min="0"
                            max={item.infantQuantity}
                            value={draft.checkedInInfantQuantity}
                            onChange={(event) => handleCheckInDraftChange(item.id, 'checkedInInfantQuantity', event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </label>
                        <label className="text-xs font-medium text-gray-600">
                          Vang nguoi lon
                          <input
                            type="number"
                            min="0"
                            max={item.adultQuantity}
                            value={draft.noShowAdultQuantity}
                            onChange={(event) => handleCheckInDraftChange(item.id, 'noShowAdultQuantity', event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </label>
                        <label className="text-xs font-medium text-gray-600">
                          Vang tre em
                          <input
                            type="number"
                            min="0"
                            max={item.childQuantity}
                            value={draft.noShowChildQuantity}
                            onChange={(event) => handleCheckInDraftChange(item.id, 'noShowChildQuantity', event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </label>
                        <label className="text-xs font-medium text-gray-600">
                          Vang em be
                          <input
                            type="number"
                            min="0"
                            max={item.infantQuantity}
                            value={draft.noShowInfantQuantity}
                            onChange={(event) => handleCheckInDraftChange(item.id, 'noShowInfantQuantity', event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </label>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div>
                          <label className="text-xs font-medium text-gray-600">
                            Ghi chu dieu hanh
                            <textarea
                              rows={3}
                              value={draft.note}
                              onChange={(event) => handleCheckInDraftChange(item.id, 'note', event.target.value)}
                              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                              placeholder="Vi du: 1 khach den tre 10 phut, 1 khach doi diem don..."
                            />
                          </label>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-600">
                          <p>Tam tinh: da den {totalCheckedIn} / {totalBooked}</p>
                          <p>Tam tinh: vang {totalNoShow} / {totalBooked}</p>
                          <button
                            type="button"
                            onClick={() => handleSubmitCheckIn(item)}
                            disabled={activeItemId === item.id || selectedOrder.status === 'cancelled'}
                            className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-white transition hover:bg-secondary/90 disabled:opacity-60"
                          >
                            <CheckCircle2 size={16} />
                            {activeItemId === item.id ? 'Dang luu...' : 'Luu check-in'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCheckIn;
