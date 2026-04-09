import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import TourList from './pages/TourList';
import TourDetail from './pages/TourDetail';
import Cart from './pages/Cart';
import NewsPage from './pages/News';
import NewsDetailPage from './pages/NewsDetail';
import ContactPage from './pages/Contact';
import AccountAuth from './pages/AccountAuth';
import MyOrders from './pages/MyOrders';

// Admin Pages
import AdminLogin from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import CategoryManagement from './admin/pages/CategoryManagement';
import TourManagement from './admin/pages/TourManagement';
import TourForm from './admin/pages/TourForm';
import OrderManagement from './admin/pages/OrderManagement';
import UserManagement from './admin/pages/UserManagement';
import Settings from './admin/pages/Settings';
import { AdminLayout } from './admin/layouts/AdminLayout';
import { ProtectedRoute } from './admin/components/ProtectedRoute';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><AdminLayout><CategoryManagement /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/tours" element={<ProtectedRoute><AdminLayout><TourManagement /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/tours/create" element={<ProtectedRoute><AdminLayout><TourForm /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/tours/edit/:id" element={<ProtectedRoute><AdminLayout><TourForm /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/tours/trash" element={<ProtectedRoute><AdminLayout><TourManagement isTrash /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminLayout><OrderManagement /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
        {/* Add more admin routes as needed */}
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tour-trong-nuoc" element={<TourList />} />
          <Route path="/tour-trong-nuoc/:regionSlug" element={<TourList />} />
          <Route path="/tour-nuoc-ngoai" element={<TourList />} />
          <Route path="/tour-nuoc-ngoai/:regionSlug" element={<TourList />} />
          <Route path="/tour/:slugOrId" element={<TourDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/tin-tuc/:slug" element={<NewsDetailPage />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/tai-khoan" element={<AccountAuth />} />
          <Route path="/don-hang-cua-toi" element={<MyOrders />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
