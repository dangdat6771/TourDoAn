import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { News } from '../../types';
import { fetchTravelNews } from '../../services/travelApi';
import SafeImage from '../common/SafeImage';

const NewsSection = () => {
  const [articles, setArticles] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadArticles = async () => {
      try {
        const data = await fetchTravelNews();
        if (active) {
          setArticles(data);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadArticles();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading || articles.length === 0) {
    return null;
  }

  const mainNews = articles[0];
  const sideNews = articles.slice(1, 5);

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-primary uppercase mb-2">Cam Hung Hanh Trinh</h2>
          <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="group">
            <Link to={mainNews.path} className="block overflow-hidden rounded-3xl relative aspect-video mb-6">
              <SafeImage
                src={mainNews.image}
                alt={mainNews.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold text-primary">
                {mainNews.date}
              </div>
            </Link>
            <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
              <Link to={mainNews.path}>{mainNews.title}</Link>
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">{mainNews.excerpt}</p>
            <Link to={mainNews.path} className="text-primary font-bold flex items-center gap-1 hover:text-secondary transition-colors">
              Doc tiep <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sideNews.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 group">
                <Link to={item.path} className="block overflow-hidden rounded-2xl relative aspect-[4/3]">
                  <SafeImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-0.5 rounded-full text-[10px] font-bold text-primary">
                    {item.date}
                  </div>
                </Link>
                <h4 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={item.path}>{item.title}</Link>
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
