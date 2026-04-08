import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Users, Calendar, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'motion/react';

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase()
    .trim();

const inferSearchPath = (keyword: string) => {
  const normalized = normalizeText(keyword);
  const internationalKeywords = [
    'nhat ban',
    'han quoc',
    'singapore',
    'thai lan',
    'campuchia',
    'paris',
    'chau au',
    'chau a',
    'chau my',
    'chau uc',
    'tokyo',
    'seoul',
    'bangkok',
  ];

  return internationalKeywords.some((item) => normalized.includes(item))
    ? '/tour-nuoc-ngoai'
    : '/tour-trong-nuoc';
};

const Hero = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [adultCount, setAdultCount] = useState('2');
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (destination.trim()) {
      params.set('destination', destination.trim());
    }
    if (startDate) {
      params.set('dateFrom', startDate.toISOString().slice(0, 10));
    }
    params.set('adultCount', adultCount);

    const path = inferSearchPath(destination);
    navigate(`${path}?${params.toString()}`);
  };

  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/travel-hero/1920/1080"
          alt="Travel Background"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      </div>

      <div className="container relative z-10 text-center text-white px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
        >
          Du lich trong nuoc va quoc te
          <br />
          <span className="text-secondary">Tim hanh trinh phu hop ngay hom nay</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-12"
        >
          Tim nhanh tour theo diem den, ngay khoi hanh va so luong hanh khach. Ket qua se duoc loc
          truc tiep tu API that cua he thong.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/20 backdrop-blur-md p-6 rounded-3xl max-w-4xl mx-auto shadow-2xl border border-white/30"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="bg-white rounded-2xl p-3 flex items-center gap-3 text-gray-700">
                <MapPin className="text-primary shrink-0" size={20} />
                <div className="flex flex-col items-start w-full">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Diem den</span>
                  <input
                    type="text"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="Ban muon di dau?"
                    className="w-full bg-transparent focus:outline-none text-sm font-medium"
                  />
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-3 flex items-center gap-3 text-gray-700">
                <Users className="text-primary shrink-0" size={20} />
                <div className="flex flex-col items-start w-full">
                  <span className="text-[10px] uppercase font-bold text-gray-400">So luong</span>
                  <select
                    value={adultCount}
                    onChange={(event) => setAdultCount(event.target.value)}
                    className="w-full bg-transparent focus:outline-none text-sm font-medium appearance-none"
                  >
                    <option value="1">1 nguoi lon</option>
                    <option value="2">2 nguoi lon</option>
                    <option value="3">3 nguoi lon</option>
                    <option value="4">4 nguoi lon</option>
                  </select>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="bg-white rounded-2xl p-3 flex items-center gap-3 text-gray-700 flex-1">
                <Calendar className="text-primary shrink-0" size={20} />
                <div className="flex flex-col items-start w-full">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Lich khoi hanh</span>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    className="w-full bg-transparent focus:outline-none text-sm font-medium"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="bg-primary hover:bg-opacity-90 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg shrink-0"
              >
                <Search size={24} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
        {['facebook', 'instagram', 'zalo', 'youtube'].map((social) => (
          <a
            key={social}
            href="#"
            className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-lg hover:bg-secondary transition-all shadow-lg"
          >
            <span className="sr-only">{social}</span>
            <div className="w-5 h-5 bg-white/20 rounded-sm"></div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Hero;
