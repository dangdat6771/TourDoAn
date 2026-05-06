import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Map,
  ShoppingCart,
  CheckCircle2,
  Users,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  Plus,
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

const navigation = [
  { name: 'Tong quan', path: '/admin', icon: LayoutDashboard },
  { name: 'Quan ly danh muc', path: '/admin/categories', icon: Layers },
  { name: 'Quan ly tour', path: '/admin/tours', icon: Map },
  { name: 'Tao tour moi', path: '/admin/tours/create', icon: Plus },
  { name: 'Quan ly don hang', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Check-in tour', path: '/admin/orders/check-in', icon: CheckCircle2 },
  { name: 'Quan ly nguoi dung', path: '/admin/users', icon: Users },
  { name: 'Cai dat chung', path: '/admin/settings', icon: Settings },
];

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => {
  const location = useLocation();
  const logout = useAdminStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">28</span>
            </div>
            <span className="text-xl font-bold text-primary">28Admin</span>
          </Link>
          <button onClick={toggle} className="lg:hidden text-gray-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/admin/orders/check-in' && location.pathname.startsWith('/admin/orders/check-in/'));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Dang xuat</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

const AdminHeader = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const user = useAdminStore((state) => state.user);

  return (
    <header className="h-16 bg-white border-b sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 hidden md:block">
          Chao mung tro lai, {user?.name || 'Admin'}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500 uppercase">{user?.role || 'admin'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-primary/20">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-gray-400" />
            )}
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-grow p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
