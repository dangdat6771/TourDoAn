import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Clock } from 'lucide-react';
import type { Tour } from '../../types';

interface TourCardProps {
  tour: Tour;
  variant?: 'default' | 'flash-sale';
}

const TourCard: React.FC<TourCardProps> = ({ tour, variant = 'default' }) => {
  const isFlashSale = variant === 'flash-sale';
  const slotsLabel = tour.remainingSlots > 0 ? String(tour.remainingSlots) : 'Lien he';
  const detailPath = `/tour/${encodeURIComponent(tour.slug || tour.id)}`;

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 ${isFlashSale ? 'border-primary/20' : ''}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={tour.image}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {tour.discount && (
            <span className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              GIAM -{tour.discount}%
            </span>
          )}
          {isFlashSale && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Flash Sale
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 shadow-sm">
          <Star size={16} />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
          <Link to={detailPath}>{tour.title}</Link>
        </h3>

        <div className="flex flex-col gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-primary" />
            <span>Ma Tour: {tour.code || tour.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary" />
            <span>Ngay Khoi Hanh: {tour.startDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span>Thoi Gian: {tour.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, index) => (
                <Star key={index} size={12} fill={index < Math.floor(tour.rating) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({tour.reviewsCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400">Cho trong:</span>
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{slotsLabel}</span>
          </div>
        </div>

        <div className="flex items-end justify-between mt-1">
          <div className="flex flex-col">
            {tour.originalPrice ? (
              <span className="text-xs text-gray-400 line-through">{tour.originalPrice.toLocaleString()}d</span>
            ) : null}
            <span className="text-lg font-bold text-secondary">{tour.price.toLocaleString()}d</span>
          </div>
          <Link
            to={detailPath}
            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
          >
            Chi Tiet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
