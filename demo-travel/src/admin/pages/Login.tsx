import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAdminStore } from '../store/useAdminStore';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { loginAdmin } from '../../services/travelApi';

const loginSchema = z.object({
  email: z.string().email('Email khong hop le'),
  password: z.string().min(3, 'Mat khau phai co it nhat 3 ky tu'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAdminStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
      email: 'admin@travelapi.vn',
      password: 'admin123',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');

    try {
      const user = await loginAdmin(data.email, data.password);
      if (user.role === 'user') {
        setError('Tai khoan nay khong co quyen truy cap khu vuc quan tri.');
        return;
      }
      login(user);
      navigate('/admin');
    } catch {
      setError('Dang nhap that bai. Hay kiem tra lai email va mat khau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">28</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dang nhap admin</h2>
          <p className="text-gray-500">Su dung tai khoan backend that de truy cap khu vuc quan tri</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input {...register('email')} type="email" placeholder="Vi du: admin@travelapi.vn" className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mat khau</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Nhap mat khau" className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('rememberMe')} type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
            <span className="text-sm text-gray-600">Ghi nho phien dang nhap</span>
          </label>

          <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Dang Nhap'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Tai khoan mau: <span className="font-semibold text-gray-700">admin@travelapi.vn / admin123</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
