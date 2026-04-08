import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCcw, Trash } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { AdminTourRow, deleteAdminTour, fetchAdminTours } from '../../services/travelApi';

const TourManagement = ({ isTrash = false }: { isTrash?: boolean }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tours, setTours] = useState<AdminTourRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTours = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchAdminTours();
      setTours(data);
    } catch {
      setError('Khong the tai danh sach tour.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isTrash) {
      setIsLoading(false);
      return;
    }
    loadTours();
  }, [isTrash]);

  const filteredTours = useMemo(
    () => tours.filter((tour) => tour.title.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, tours],
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ban co chac chan muon xoa tour nay?')) {
      return;
    }

    try {
      await deleteAdminTour(id);
      await loadTours();
    } catch {
      setError('Khong the xoa tour.');
    }
  };

  if (isTrash) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">Backend hien chua ho tro thung rac tour. Route nay duoc giu lai de tranh vo giao dien cu.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quan ly tour</h2>
        <div className="flex items-center gap-3">
          <Link to="/admin/tours/create" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg">
            <Plus size={20} />
            <span>Tao moi</span>
          </Link>
          <Link to="/admin/tours/trash" className="bg-red-50 text-red-500 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all border border-red-200">
            <Trash size={20} />
            <span>Thung rac</span>
          </Link>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
            <Filter size={16} />
            <span>Bo loc</span>
          </div>
          <button onClick={loadTours} className="text-red-500 text-sm font-bold flex items-center gap-1 hover:underline">
            <RefreshCcw size={14} />
            Tai lai
          </button>
        </div>

        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input type="text" placeholder="Tim kiem..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all outline-none text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Ten tour</th>
                <th className="px-6 py-4">Ma / Slug</th>
                <th className="px-6 py-4">Gia</th>
                <th className="px-6 py-4">Lich con trong</th>
                <th className="px-6 py-4">Diem den</th>
                <th className="px-6 py-4">Trang thai</th>
                <th className="px-6 py-4">Nguoi tao</th>
                <th className="px-6 py-4 text-right">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">Dang tai danh sach tour...</td></tr>
              ) : filteredTours.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">Khong co tour nao.</td></tr>
              ) : (
                filteredTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{tour.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600"><p>{tour.code || '-'}</p><p className="text-xs text-gray-400">{tour.slug || '-'}</p></td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{tour.price.toLocaleString()}d</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tour.remainingSlots}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tour.location}</td>
                    <td className="px-6 py-4">
                      <span className={cn('px-3 py-1 rounded-full text-[10px] font-bold uppercase', tour.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')}>
                        {tour.status === 'active' ? 'Hoat dong' : 'Tam dung'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tour.createdByName}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/tours/edit/${tour.id}`} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Edit size={18} /></Link>
                        <button onClick={() => handleDelete(tour.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-500">Hien thi {filteredTours.length} tour</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border rounded-lg text-gray-400" disabled><ChevronLeft size={18} /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">1</button>
            <button className="p-2 border rounded-lg text-gray-400" disabled><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourManagement;
