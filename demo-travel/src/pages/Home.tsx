import React, { useEffect, useState } from 'react';
import Hero from '../components/home/Hero';
import FlashSale from '../components/home/FlashSale';
import TourSection from '../components/home/TourSection';
import NewsSection from '../components/home/NewsSection';
import { Tour } from '../types';
import { fetchPublicTours } from '../services/travelApi';

const Home = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadTours = async () => {
      try {
        const data = await fetchPublicTours();
        if (active) {
          setTours(data);
        }
      } catch (err) {
        if (active) {
          setError('Khong the tai danh sach tour luc nay.');
        }
      }
    };

    loadTours();
    return () => {
      active = false;
    };
  }, []);

  const domesticTours = tours.filter((tour) => tour.category === 'domestic').slice(0, 4);
  const internationalTours = tours.filter((tour) => tour.category === 'international').slice(0, 4);
  const flashSaleTours = [...tours].sort((left, right) => left.price - right.price).slice(0, 3);

  return (
    <main>
      <Hero />
      <FlashSale tours={flashSaleTours} />

      {error && (
        <div className="container pt-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        </div>
      )}

      <TourSection
        title="Tour Trong Nuoc"
        tours={domesticTours}
        viewAllPath="/tour-trong-nuoc"
        bannerImage="https://picsum.photos/seed/banner-domestic/1200/400"
      />

      <TourSection
        title="Tour Nuoc Ngoai"
        tours={internationalTours}
        viewAllPath="/tour-nuoc-ngoai"
        bannerImage="https://picsum.photos/seed/banner-intl/1200/400"
      />

      <NewsSection />
    </main>
  );
};

export default Home;
