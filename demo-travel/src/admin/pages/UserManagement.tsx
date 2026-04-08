import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  RefreshCcw,
  User,
  X,
} from 'lucide-react';
import {
  changeUserStatusApi,
  deleteUserApi,
  fetchUsers,
  updateAdminUser,
  type AdminUserRow,
} from '../../services/travelApi';

const emptyForm: AdminUserRow = {
  id: '',
  name: '',
  email: '',
  passwordHash: '',
  phone: '',
  avatar: '',
  address: '',
  dateOfBirth: '',
  gender: 'MALE',
  status: 'ACTIVE',
  role: 'USER',
  createdAt: '',
  updatedAt: '',
};

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [formData, setFormData] = useState<AdminUserRow>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch {
      setError('Khong the tai danh sach nguoi dung.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [searchTerm, statusFilter, users],
  );

  const handleOpenModal = (user: AdminUserRow) => {
    setEditingUser(user);
    setFormData(user);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await updateAdminUser(editingUser.id, {
        fullName: formData.name,
        email: formData.email,
        passwordHash: formData.passwordHash,
        phone: formData.phone,
        avatarUrl: formData.avatar,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        status: formData.status,
        userType: formData.role,
      });

      setEditingUser(null);
      await loadUsers();
    } catch {
      setError('Khong the cap nhat nguoi dung.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ban co chac chan muon xoa nguoi dung nay?')) {
      return;
    }

    try {
      await deleteUserApi(id);
      await loadUsers();
    } catch {
      setError('Khong the xoa nguoi dung.');
    }
  };

  const handleStatusChange = async (id: string, status: AdminUserRow['status']) => {
    try {
      await changeUserStatusApi(id, status);
      await loadUsers();
    } catch {
      setError('Khong the cap nhat trang thai nguoi dung.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quan ly nguoi dung</h2>
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
            <option value="ACTIVE">Hoat dong</option>
            <option value="INACTIVE">Tam dung</option>
            <option value="BANNED">Da khoa</option>
          </select>
          <button onClick={() => { setStatusFilter('all'); setSearchTerm(''); }} className="text-red-500 text-sm font-bold flex items-center gap-1 hover:underline">
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
                <th className="px-6 py-4">Ho ten</th>
                <th className="px-6 py-4">Avatar</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">So dien thoai</th>
                <th className="px-6 py-4">Vai tro</th>
                <th className="px-6 py-4">Trang thai</th>
                <th className="px-6 py-4 text-right">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Dang tai nguoi dung...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Khong co nguoi dung nao.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{user.name}</td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.role}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.status}
                        onChange={(event) => handleStatusChange(user.id, event.target.value as AdminUserRow['status'])}
                        className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase outline-none"
                      >
                        <option value="ACTIVE">Hoat dong</option>
                        <option value="INACTIVE">Tam dung</option>
                        <option value="BANNED">Da khoa</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => handleOpenModal(user)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit size={18} />
                        </button>
                        <button type="button" onClick={() => handleDelete(user.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 size={18} />
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

      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSave} className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Chinh sua nguoi dung</h3>
                <p className="text-sm text-gray-500">{editingUser.email}</p>
              </div>
              <button type="button" onClick={() => setEditingUser(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Ho ten</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Email</label>
                <input name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">So dien thoai</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Ngay sinh</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Gioi tinh</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none">
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nu</option>
                  <option value="OTHER">Khac</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Vai tro</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none">
                  <option value="ADMIN">ADMIN</option>
                  <option value="STAFF">STAFF</option>
                  <option value="USER">USER</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">Avatar URL</label>
                <input name="avatar" value={formData.avatar} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">Dia chi</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">Mat khau hien tai</label>
                <input name="passwordHash" value={formData.passwordHash} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 border-t px-6 py-4">
              <button type="button" onClick={() => setEditingUser(null)} className="rounded-xl px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100">
                Huy
              </button>
              <button type="submit" disabled={isSaving} className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-70">
                {isSaving ? 'Dang luu...' : 'Luu thay doi'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
