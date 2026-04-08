import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Phone, Mail, MapPin, ChevronDown, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

type NavLinkItem = {
  name: string;
  path: string;
  dropdown?: string[];
};

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

const navLinks: NavLinkItem[] = [
  { name: 'Trang Chu', path: '/' },
  {
    name: 'Tour Trong Nuoc',
    path: '/tour-trong-nuoc',
    dropdown: ['Mien Bac', 'Mien Trung', 'Mien Nam', 'Xuyen Viet', 'Bien Dao', 'Tay Nguyen'],
  },
  {
    name: 'Tour Nuoc Ngoai',
    path: '/tour-nuoc-ngoai',
    dropdown: ['Chau A', 'Chau Au', 'Chau My', 'Chau Uc', 'Dong Nam A', 'Trung Dong'],
  },
  { name: 'Tin Tuc', path: '/tin-tuc' },
  { name: 'Lien He', path: '/lien-he' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="bg-primary text-white py-2 text-sm hidden md:block">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>0123.456.789</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>contact@28travel.com</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>So 123, duong ABC, thanh pho XYZ</span>
          </div>
        </div>
      </div>

      <div className="container py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-secondary to-primary rounded-full overflow-hidden">
            <span className="text-white font-bold text-xl">28</span>
          </div>
          <span className="text-2xl font-bold tracking-tighter">
            <span className="text-primary">28.</span>
            <span className="text-secondary">TRAVEL</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <div key={link.name} className="group relative">
              <Link to={link.path} className="flex items-center gap-1 font-medium hover:text-primary transition-colors py-2">
                {link.name}
                {link.dropdown && <ChevronDown size={14} />}
              </Link>

              {link.dropdown && (
                <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border-t-2 border-primary">
                  {link.dropdown.map((item) => (
                    <Link
                      key={item}
                      to={`${link.path}/${slugify(item)}`}
                      className="block px-4 py-2 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ShoppingCart className="text-primary" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t py-4 px-4 absolute w-full shadow-xl">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <div key={link.name}>
                <Link
                  to={link.path}
                  className="font-medium block py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
                {link.dropdown && (
                  <div className="pl-4 mt-2 flex flex-col gap-2 border-l-2 border-gray-100">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item}
                        to={`${link.path}/${slugify(item)}`}
                        className="text-gray-600 text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
