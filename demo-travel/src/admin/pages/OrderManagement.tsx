import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  RefreshCcw,
  X,
} from 'lucide-react';
import {
  fetchOrders,
  updateOrderPaymentStatusApi,
  updateOrderStatusApi,
  type AdminOrder,
} from '../../services/travelApi';

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch {
      setError('Khong the tai danh sach don hang.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

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
      await loadOrders();
    } catch {
      setError('Khong the cap nhat trang thai don hang.');
    }
  };

  const handlePaymentStatusChange = async (id: string, status: AdminOrder['paymentStatus']) => {
    try {
      await updateOrderPaymentStatusApi(id, status);
      await loadOrders();
    } catch {
      setError('Khong the cap nhat trang thai thanh toan.');
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
                      <button type="button" onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Chi tiet don hang {selectedOrder.code}</h3>
                <p className="text-sm text-gray-500">{selectedOrder.createdAt}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4 text-sm">
                <h4 className="font-bold text-gray-900 mb-3">Thong tin khach</h4>
                <p>{selectedOrder.customerName}</p>
                <p>{selectedOrder.customerPhone}</p>
                <p>{selectedOrder.customerEmail}</p>
                <p>{selectedOrder.customerAddress || 'Chua cap nhat dia chi'}</p>
                {selectedOrder.customerNote && <p className="mt-3 text-gray-500">Ghi chu: {selectedOrder.customerNote}</p>}
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 text-sm">
                <h4 className="font-bold text-gray-900 mb-3">Thanh toan</h4>
                <p>Phuong thuc: {selectedOrder.paymentMethod}</p>
                <p>Trang thai: {selectedOrder.paymentStatus}</p>
                <p>Tong tien: {selectedOrder.totalAmount.toLocaleString()}d</p>
                <p>Giam gia: {selectedOrder.discountAmount.toLocaleString()}d</p>
                <p className="font-bold text-primary mt-2">Thanh tien: {selectedOrder.finalAmount.toLocaleString()}d</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <h4 className="font-bold text-gray-900 mb-3">Danh sach tour</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-gray-200 p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-gray-500">{item.departureDate} - {item.returnDate}</p>
                      </div>
                      <p className="font-bold text-primary">{item.subtotal.toLocaleString()}d</p>
                    </div>
                    <p className="mt-2 text-gray-500">
                      Nguoi lon: {item.adultQuantity} | Tre em: {item.childQuantity} | Em be: {item.infantQuantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
