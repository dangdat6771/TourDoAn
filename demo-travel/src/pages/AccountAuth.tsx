import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fetchUserProfile, loginUser, registerUser } from '../services/travelApi';
import { useUserStore } from '../store/useUserStore';

const loginSchema = z.object({
  email: z.string().email('Email khong hop le'),
  password: z.string().min(6, 'Mat khau phai it nhat 6 ky tu'),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Ho ten phai it nhat 2 ky tu'),
    email: z.string().email('Email khong hop le'),
    password: z.string().min(6, 'Mat khau phai it nhat 6 ky tu'),
    confirmPassword: z.string().min(6, 'Vui long nhap lai mat khau'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mat khau nhap lai khong khop',
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AccountAuth = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const redirectAfterLogin = useUserStore((state) => state.redirectAfterLogin);
  const login = useUserStore((state) => state.login);
  const logout = useUserStore((state) => state.logout);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const setRedirectAfterLogin = useUserStore((state) => state.setRedirectAfterLogin);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const destinationAfterAuth = useMemo(() => redirectAfterLogin || '/cart', [redirectAfterLogin]);

  const switchMode = (nextMode: 'login' | 'register') => {
    setAuthError('');
    setSearchParams(nextMode === 'register' ? { mode: 'register' } : {});
  };

  const completeAuth = async (id: string) => {
    try {
      const profile = await fetchUserProfile(id);
      updateProfile(profile);
    } catch {
      // Keep the minimal session if profile hydration fails.
    }

    const target = redirectAfterLogin || '/cart';
    setRedirectAfterLogin(null);
    navigate(target, { replace: true });
  };

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError('');

    try {
      const session = await loginUser(values.email, values.password);
      login(session);
      await completeAuth(session.id);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Dang nhap that bai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    setAuthError('');

    try {
      await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });

      const session = await loginUser(values.email, values.password);
      login(session);
      await completeAuth(session.id);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Dang ky that bai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Tai Khoan</p>
            <h1 className="mt-3 text-3xl font-black text-gray-900">{user.name}</h1>
            <p className="mt-2 text-gray-500">{user.email}</p>
            {user.phone && <p className="mt-1 text-sm text-gray-500">So dien thoai: {user.phone}</p>}
            {user.address && <p className="mt-1 text-sm text-gray-500">Dia chi: {user.address}</p>}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={destinationAfterAuth}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
              >
                Tiep tuc dat tour
              </Link>
              <Link
                to="/don-hang-cua-toi"
                className="rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Don hang cua toi
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Dang xuat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-primary px-8 py-10 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary">28.Travel Account</p>
            <h1 className="mt-4 text-4xl font-black leading-tight">Dang nhap de tiep tuc dat tour va luu thong tin khach hang.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">
              Luong nay duoc them de phu hop task dat tour: neu chua dang nhap, he thong se dua ban vao tai khoan user va quay lai gio hang sau khi xac nhan.
            </p>
            <div className="mt-8 rounded-3xl border border-white/20 bg-white/10 p-5 text-sm text-white/85">
              <p className="font-bold">Tai khoan user seed trong database that</p>
              <p className="mt-2">Email: `linhnt@gmail.com`</p>
              <p>Mat khau: `user123`</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-bold transition ${mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
              >
                Dang nhap
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-bold transition ${mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
              >
                Dang ky
              </button>
            </div>

            {authError && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{authError}</div>}

            {mode === 'login' ? (
              <form className="space-y-5" onSubmit={loginForm.handleSubmit(handleLogin)}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email</label>
                  <input
                    type="email"
                    {...loginForm.register('email')}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="linhnt@gmail.com"
                  />
                  {loginForm.formState.errors.email && <p className="text-xs text-red-500">{loginForm.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Mat khau</label>
                  <input
                    type="password"
                    {...loginForm.register('password')}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Nhap mat khau"
                  />
                  {loginForm.formState.errors.password && <p className="text-xs text-red-500">{loginForm.formState.errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-primary/90 disabled:opacity-70"
                >
                  {isSubmitting ? 'Dang dang nhap...' : 'Dang nhap va tiep tuc'}
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={registerForm.handleSubmit(handleRegister)}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Ho va ten</label>
                  <input
                    type="text"
                    {...registerForm.register('fullName')}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Nhap ho va ten"
                  />
                  {registerForm.formState.errors.fullName && <p className="text-xs text-red-500">{registerForm.formState.errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email</label>
                  <input
                    type="email"
                    {...registerForm.register('email')}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Nhap email"
                  />
                  {registerForm.formState.errors.email && <p className="text-xs text-red-500">{registerForm.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Mat khau</label>
                  <input
                    type="password"
                    {...registerForm.register('password')}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Nhap mat khau"
                  />
                  {registerForm.formState.errors.password && <p className="text-xs text-red-500">{registerForm.formState.errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nhap lai mat khau</label>
                  <input
                    type="password"
                    {...registerForm.register('confirmPassword')}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Nhap lai mat khau"
                  />
                  {registerForm.formState.errors.confirmPassword && <p className="text-xs text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-secondary px-5 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-secondary/90 disabled:opacity-70"
                >
                  {isSubmitting ? 'Dang tao tai khoan...' : 'Dang ky va tiep tuc'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountAuth;
