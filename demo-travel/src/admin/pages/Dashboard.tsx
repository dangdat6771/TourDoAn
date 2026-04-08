import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  MoreVertical,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';
import { fetchAdminTours, fetchOrders, fetchUsers, type AdminOrder } from '../../services/travelApi';

const StatCard = ({ title, value, icon: Icon, trendText, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      {trendText && (
        <div className="flex items-center gap-1 text-sm font-bold text-green-500">
          <ArrowUpRight size={16} />
          {trendText}
        </div>
      )}
    </div>
    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
  </div>
);

const buildRevenueData = (orders: AdminOrder[]) => {
  const labels = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      name: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    };
  });

  return labels.map((label) => ({
    name: label.name,
    revenue: orders
      .filter((order) => order.rawCreatedAt.slice(0, 10) === label.key)
      .reduce((total, order) => total + order.finalAmount, 0),
  }));
};

const Dashboard = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTours, setTotalTours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [orderData, userData, tourData] = await Promise.all([
          fetchOrders(),
          fetchUsers(),
          fetchAdminTours(),
        ]);

        if (active) {
          setOrders(orderData);
          setTotalUsers(userData.length);
          setTotalTours(tourData.length);
        }
      } catch {
        if (active) {
          setError('Khong the tai du lieu tong quan.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const revenueData = useMemo(() => buildRevenueData(orders), [orders]);
  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.finalAmount, 0), [orders]);
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((left, right) => new Date(right.rawCreatedAt).getTime() - new Date(left.rawCreatedAt).getTime())
        .slice(0, 5),
    [orders],
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Tong quan</h2>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500">
          Tong so tour hien co: <span className="font-bold text-gray-900">{totalTours}</span>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Nguoi dung"
          value={isLoading ? '...' : totalUsers.toLocaleString()}
          icon={Users}
          trendText="Du lieu that"
          color="bg-blue-500"
        />
        <StatCard
          title="Don hang"
          value={isLoading ? '...' : orders.length.toLocaleString()}
          icon={ShoppingCart}
          trendText="Cap nhat live"
          color="bg-orange-500"
        />
        <StatCard
          title="Doanh thu"
          value={isLoading ? '...' : `${totalRevenue.toLocaleString()}d`}
          icon={DollarSign}
          trendText="Tu backend"
          color="bg-green-500"
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Doanh thu 7 ngay gan nhat</h3>
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
            <MoreVertical size={20} />
          </button>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()}d`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0f766e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Don hang moi</h3>
          <Link to="/admin/orders" className="text-primary text-sm font-bold hover:underline">
            Xem tat ca
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Ma don</th>
                <th className="px-6 py-4">Khach hang</th>
                <th className="px-6 py-4">Tour</th>
                <th className="px-6 py-4">Thanh toan</th>
                <th className="px-6 py-4">Trang thai</th>
                <th className="px-6 py-4">Ngay dat</th>
                <th className="px-6 py-4">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Dang tai du lieu...</td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Chua co don hang nao.</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary text-sm">{order.code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items[0]?.name || 'Dang cap nhat'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{order.finalAmount.toLocaleString()}d</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{order.createdAt}</td>
                    <td className="px-6 py-4">
                      <Link to="/admin/orders" className="p-2 inline-flex hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
