import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import TourCard from '../tour/TourCard';
import { Tour } from '../../types';
import SafeImage from '../common/SafeImage';

interface TourSectionProps {
  title: string;
  tours: Tour[];
  viewAllPath: string;
  bannerImage?: string;
}

const TourSection: React.FC<TourSectionProps> = ({ title, tours, viewAllPath, bannerImage }) => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="flex justify-between items-end mb-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-primary relative inline-block">
              {title}
              <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></div>
            </h2>
          </div>
          <Link 
            to={viewAllPath} 
            className="flex items-center gap-1 text-primary font-bold hover:text-secondary transition-colors"
          >
            Xem tất cả
            <ChevronRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tours.map(tour => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        {bannerImage && (
          <div className="mt-16 rounded-3xl overflow-hidden h-48 md:h-64 relative group">
            <SafeImage 
              src={bannerImage} 
              alt="Section Banner" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-8 md:p-16">
               <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Khám phá <br /> hành trình mới
               </h3>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TourSection;
