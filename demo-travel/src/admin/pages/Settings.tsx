import React from 'react';
import { 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube, 
  Save,
  Image as ImageIcon,
  Plus
} from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt chung</h2>
        <button className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg">
          <Save size={20} />
          <span>Lưu thay đổi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Website Info */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-4">Thông tin website</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Tên website</label>
              <input type="text" defaultValue="28.TRAVEL" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Slogan</label>
              <input type="text" defaultValue="Khám phá thế giới cùng 28.TRAVEL" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Logo</label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <ImageIcon className="text-gray-400" />
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Kích thước khuyến nghị: 200x80px</p>
                <p>Định dạng: PNG, SVG</p>
                <button className="text-primary font-bold hover:underline">Thay đổi logo</button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-4">Thông tin liên hệ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                Email
              </label>
              <input type="email" defaultValue="contact@28travel.vn" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                Số điện thoại
              </label>
              <input type="text" defaultValue="0123 456 789" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                Địa chỉ
              </label>
              <input type="text" defaultValue="Số 123, Đường ABC, Quận XYZ, TP.HCM" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-4">Mạng xã hội</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Facebook size={20} />
              </div>
              <input type="text" placeholder="Facebook URL" className="flex-grow px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center">
                <Instagram size={20} />
              </div>
              <input type="text" placeholder="Instagram URL" className="flex-grow px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <Youtube size={20} />
              </div>
              <input type="text" placeholder="Youtube URL" className="flex-grow px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
