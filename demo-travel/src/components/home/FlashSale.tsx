import React, { useEffect, useState } from 'react';
import type { Tour } from '../../types';
import TourCard from '../tour/TourCard';

interface FlashSaleProps {
  tours: Tour[];
}

const FlashSale: React.FC<FlashSaleProps> = ({ tours }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 20,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (tours.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-primary">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="text-white text-center lg:text-left shrink-0">
            <h2 className="text-3xl font-bold mb-2 uppercase tracking-wider">Uu Dai Hom Nay</h2>
            <h3 className="text-5xl font-black mb-6 uppercase">Tour Noi Bat</h3>
            <p className="opacity-80 mb-8 max-w-xs mx-auto lg:mx-0">
              Cac tour dang duoc quan tam nhat va con lich trong tot cho ke hoach du lich sap toi.
            </p>

            <div className="flex flex-col gap-4 items-center lg:items-start">
              <span className="text-lg font-bold uppercase">Lam moi sau</span>
              <div className="flex gap-4">
                {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((unit, index) => (
                  <div
                    key={index}
                    className="bg-white text-primary w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg"
                  >
                    {unit.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <span className="text-xl opacity-80">Gia tu</span>
                <div className="text-4xl font-black text-secondary border-b-4 border-secondary inline-block ml-2">
                  {Math.min(...tours.map((tour) => tour.price)).toLocaleString()}d
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} variant="flash-sale" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
