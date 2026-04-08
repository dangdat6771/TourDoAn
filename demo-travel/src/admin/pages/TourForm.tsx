import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminTourFormState, FrontendCategory, createAdminTour, fetchAdminTourDetail, fetchCategories, slugify, toAdminTourFormState, toAdminTourPayload, updateAdminTour } from '../../services/travelApi';

const initialForm: AdminTourFormState = {
  title: '',
  categoryId: '',
  position: 1,
  status: 'active',
  price: 0,
  childPrice: 0,
  infantPrice: 0,
  originalPrice: 0,
  remainingSlots: 0,
  childRemainingSlots: 0,
  infantRemainingSlots: 0,
  duration: '',
  startDate: '',
  location: '',
  description: '',
  image: 'https://picsum.photos/seed/tour/800/600',
  slug: '',
  code: '',
  itinerary: [{ day: 1, title: '', content: '' }],
};

const TourForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState<AdminTourFormState>(initialForm);
  const [categories, setCategories] = useState<FrontendCategory[]>([]);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        const categoryData = await fetchCategories(true);
        if (!active) return;
        setCategories(categoryData);

        if (isEdit && id) {
          const detail = await fetchAdminTourDetail(id);
          if (!active) return;
          const matchingCategory = categoryData.find((item) => item.slug === detail.categorySlug || item.name === detail.categoryName);
          setFormData(toAdminTourFormState(detail, matchingCategory?.id ?? ''));
        }
      } catch {
        if (active) setError('Khong the tai du lieu tour.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadPage();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleItineraryChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const itinerary = [...prev.itinerary];
      itinerary[index] = { ...itinerary[index], [field]: value };
      return { ...prev, itinerary };
    });
  };

  const addDay = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: '', content: '' }],
    }));
  };

  const removeDay = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, itemIndex) => itemIndex !== index).map((day, itemIndex) => ({ ...day, day: itemIndex + 1 })),
    }));
  };

  const categoryOptions = useMemo(() => categories.filter((item) => item.status === 'active'), [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const payload = toAdminTourPayload({
        ...formData,
        slug: formData.slug || slugify(formData.title),
      });

      if (isEdit && id) {
        await updateAdminTour(id, payload);
      } else {
        await createAdminTour(payload);
      }

      navigate('/admin/tours');
    } catch {
      setError('Khong the luu tour.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-2xl bg-white px-6 py-10 text-center text-gray-500 shadow-sm border border-gray-100">Dang tai du lieu tour...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={24} /></button>
        <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Chinh sua tour' : 'Tao tour'}</h2>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Ten tour" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" required />
          <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
            <option value="">Chon danh muc</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input type="text" name="code" value={formData.code} onChange={handleInputChange} placeholder="Ma tour" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
          <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} placeholder={slugify(formData.title)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Anh dai dien (URL)</label>
          <div className="flex gap-4">
            <div className="relative w-40 h-40 flex-shrink-0">
              <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 overflow-hidden">
                {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400" />}
              </div>
            </div>
            <input type="text" name="image" value={formData.image} onChange={handleInputChange} className="w-full h-fit px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleInputChange} placeholder="Gia goc" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Gia nguoi lon" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" required />
            <input type="number" name="childPrice" value={formData.childPrice} onChange={handleInputChange} placeholder="Gia tre em" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
            <input type="number" name="infantPrice" value={formData.infantPrice} onChange={handleInputChange} placeholder="Gia em be" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
          </div>
          <div className="space-y-3">
            <input type="number" name="remainingSlots" value={formData.remainingSlots} onChange={handleInputChange} placeholder="So cho trong" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Dia diem" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
            <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="Vi du: 3 Ngay 2 Dem" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
            <input type="text" name="startDate" value={formData.startDate} onChange={handleInputChange} placeholder="dd/MM/yyyy" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
          </div>
        </div>

        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
          <option value="active">Hoat dong</option>
          <option value="inactive">Tam dung</option>
        </select>

        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} placeholder="Thong tin tour" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none" />

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Lich trinh tour</h3>
          <div className="space-y-4">
            {formData.itinerary.map((day, index) => (
              <div key={index} className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-grow">
                    <GripVertical className="text-gray-400" size={20} />
                    <input type="text" value={day.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} placeholder={`Ngay ${day.day}`} className="flex-grow bg-transparent font-bold text-gray-800 outline-none" />
                  </div>
                  <button type="button" onClick={() => removeDay(index)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={18} /></button>
                </div>
                <div className="p-4">
                  <textarea rows={4} value={day.content} onChange={(e) => handleItineraryChange(index, 'content', e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none" />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addDay} className="flex items-center gap-2 text-primary font-bold hover:underline"><Plus size={18} />Them lich trinh</button>
        </div>

        <div className="pt-8 border-t flex flex-col items-center gap-4">
          <button type="submit" disabled={isSaving} className="w-full max-w-md bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg disabled:opacity-70">
            {isSaving ? 'Dang luu...' : isEdit ? 'Cap nhat' : 'Tao moi'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="text-primary font-bold hover:underline">Quay lai danh sach</button>
        </div>
      </form>
    </div>
  );
};

export default TourForm;
