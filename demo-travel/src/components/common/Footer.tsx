import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Send, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-16 pb-8 border-t">
      <div className="container">
        {/* Newsletter Section */}
        <div className="bg-primary rounded-2xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white max-w-md">
            <h3 className="text-2xl font-bold mb-2">Đăng Ký Ngay Để Không Bỏ Lỡ Các Chương Trình Của Chúng Tôi</h3>
            <p className="opacity-80">Nhận thông tin về các tour mới nhất và ưu đãi hấp dẫn hàng tuần.</p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <input 
              type="email" 
              placeholder="Nhập email của bạn..." 
              className="px-6 py-4 rounded-full bg-white w-full md:w-80 focus:outline-none"
            />
            <button className="bg-secondary text-white px-8 py-4 rounded-full font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
              Đăng Ký Ngay
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-secondary to-primary rounded-full overflow-hidden">
                <span className="text-white font-bold text-xl">28</span>
              </div>
              <span className="text-2xl font-bold tracking-tighter">
                <span className="text-primary">28.</span>
                <span className="text-secondary">TRAVEL</span>
              </span>
            </Link>
            <p className="text-gray-600 leading-relaxed">
              28.TRAVEL tự hào là đơn vị cung cấp các tour du lịch chất lượng cao, mang đến trải nghiệm tuyệt vời cho khách hàng trên mọi hành trình.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Liên Kết Nhanh</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/" className="text-gray-600 hover:text-primary transition-colors">Trang Chủ</Link></li>
              <li><Link to="/tour-trong-nuoc" className="text-gray-600 hover:text-primary transition-colors">Tour Trong Nước</Link></li>
              <li><Link to="/tour-nuoc-ngoai" className="text-gray-600 hover:text-primary transition-colors">Tour Nước Ngoài</Link></li>
              <li><Link to="/tin-tuc" className="text-gray-600 hover:text-primary transition-colors">Tin Tức</Link></li>
              <li><Link to="/lien-he" className="text-gray-600 hover:text-primary transition-colors">Liên Hệ</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6">Dịch Vụ</h4>
            <ul className="flex flex-col gap-4">
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Đặt Tour Theo Yêu Cầu</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Dịch Vụ Visa</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Đặt Vé Máy Bay</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Đặt Khách Sạn</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Cho Thuê Xe Du Lịch</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6">Thông Tin Liên Hệ</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex gap-3 text-gray-600">
                <MapPin className="text-primary shrink-0" size={20} />
                <span>Số 123, đường ABC, thành phố XYZ</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <Phone className="text-primary shrink-0" size={20} />
                <span>0123.456.789</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <Mail className="text-primary shrink-0" size={20} />
                <span>contact@28travel.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2024 28Tech. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
