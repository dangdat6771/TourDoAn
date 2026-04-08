import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight, X, RefreshCcw, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FrontendCategory, createCategory, deleteCategoryApi, fetchCategories, slugify, updateCategoryApi } from '../../services/travelApi';

const emptyForm: Partial<FrontendCategory> = {
  name: '',
  image: 'https://picsum.photos/seed/cat/100/100',
  position: 1,
  status: 'active',
  description: '',
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState<FrontendCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FrontendCategory | null>(null);
  const [formData, setFormData] = useState<Partial<FrontendCategory>>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchCategories(false);
      setCategories(data);
    } catch {
      setError('Khong the tai danh sach danh muc.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [categories, searchTerm],
  );

  const handleOpenModal = (cat?: FrontendCategory) => {
    setEditingCategory(cat ?? null);
    setFormData(cat ?? emptyForm);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        slug: formData.slug || slugify(formData.name || ''),
      };

      if (editingCategory) {
        await updateCategoryApi(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }

      setIsModalOpen(false);
      await loadCategories();
    } catch {
      setError('Khong the luu danh muc.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ban co chac chan muon xoa danh muc nay?')) {
      return;
    }

    try {
      await deleteCategoryApi(id);
      await loadCategories();
    } catch {
      setError('Khong the xoa danh muc.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quan ly danh muc</h2>
        <button onClick={() => handleOpenModal()} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg">
          <Plus size={20} />
          <span>Tao moi</span>
        </button>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
            <Filter size={16} />
            <span>Bo loc</span>
          </div>
          <button onClick={loadCategories} className="text-red-500 text-sm font-bold flex items-center gap-1 hover:underline">
            <RefreshCcw size={14} />
            Tai lai
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Ten danh muc</th>
                <th className="px-6 py-4">Anh dai dien</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Vi tri</th>
                <th className="px-6 py-4">Trang thai</th>
                <th className="px-6 py-4 text-right">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">Dang tai danh muc...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">Khong co danh muc nao.</td></tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{cat.name}</td>
                    <td className="px-6 py-4"><div className="w-12 h-12 rounded-lg overflow-hidden border"><img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /></div></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cat.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cat.position}</td>
                    <td className="px-6 py-4">
                      <span className={cn('px-3 py-1 rounded-full text-[10px] font-bold uppercase', cat.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')}>
                        {cat.status === 'active' ? 'Hoat dong' : 'Tam dung'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(cat)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-500">Hien thi {filteredCategories.length} danh muc</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border rounded-lg text-gray-400" disabled><ChevronLeft size={18} /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">1</button>
            <button className="p-2 border rounded-lg text-gray-400" disabled><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">{editingCategory ? 'Chinh sua danh muc' : 'Tao danh muc'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Ten danh muc</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Slug</label>
                  <input type="text" name="slug" value={formData.slug ?? slugify(formData.name || '')} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Vi tri</label>
                  <input type="number" name="position" value={formData.position} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Trang thai</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="active">Hoat dong</option>
                    <option value="inactive">Tam dung</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Anh dai dien (URL)</label>
                <div className="flex gap-4 items-center">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 overflow-hidden">
                    {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400" />}
                  </div>
                  <input type="text" name="image" value={formData.image} onChange={handleInputChange} className="flex-grow px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Mo ta</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none" />
              </div>
            </div>
            <div className="p-6 border-t flex items-center justify-end gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Huy</button>
              <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg disabled:opacity-70">
                {isSaving ? 'Dang luu...' : editingCategory ? 'Cap nhat' : 'Tao moi'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
