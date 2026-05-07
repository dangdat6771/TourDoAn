export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  avatar?: string;
  token?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  revenueData: { name: string; revenue: number }[];
  recentOrders: unknown[];
}
