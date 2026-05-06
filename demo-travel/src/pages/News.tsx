import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import type { News } from '../types';
import { fetchTravelNews } from '../services/travelApi';
import SafeImage from '../components/common/SafeImage';

const NewsPage = () => {
  const [articles, setArticles] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadArticles = async () => {
      try {
        const data = await fetchTravelNews();
        if (active) {
          setArticles(data);
        }
      } catch {
        if (active) {
          setError('Khong the tai bai viet luc nay.');
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

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container">
        <div className="max-w-3xl mb-10">
          <h1 className="text-4xl font-black text-primary uppercase mb-4">Tin Tuc Du Lich</h1>
          <p className="text-gray-600 leading-relaxed">
            Cac bai viet duoc tao tu du lieu tour thuc te tren he thong, giup ban nhanh chong nam duoc
            lich khoi hanh, muc gia va nhung hanh trinh dang duoc quan tam.
          </p>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        {isLoading ? (
          <div className="rounded-3xl bg-white px-6 py-12 text-center text-gray-500 shadow-sm border border-gray-100">
            Dang tai bai viet...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
                <Link to={article.path} className="block aspect-[4/3] overflow-hidden">
                  <SafeImage src={article.image} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" referrerPolicy="no-referrer" />
                </Link>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    <Calendar size={14} />
                    {article.date}
                  </div>
                  <h2 className="mb-3 text-xl font-bold text-gray-900 line-clamp-2">
                    <Link to={article.path}>{article.title}</Link>
                  </h2>
                  <p className="mb-4 text-sm leading-6 text-gray-600 line-clamp-4">{article.excerpt}</p>
                  <Link to={article.path} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary">
                    Doc bai viet <ChevronRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
