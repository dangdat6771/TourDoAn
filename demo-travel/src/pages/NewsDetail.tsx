import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
import type { News } from '../types';
import { fetchTravelNews } from '../services/travelApi';
import SafeImage from '../components/common/SafeImage';

const NewsDetailPage = () => {
  const { slug } = useParams();
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
          setError('Khong the tai noi dung bai viet.');
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

  const article = useMemo(() => articles.find((item) => item.slug === slug), [articles, slug]);

  if (isLoading) {
    return <div className="container py-20 text-center text-gray-500">Dang tai bai viet...</div>;
  }

  if (error || !article) {
    return (
      <div className="container py-20">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || 'Khong tim thay bai viet.'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container max-w-4xl">
        <Link to="/tin-tuc" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
          <ArrowLeft size={16} />
          Quay lai danh sach bai viet
        </Link>

        <article className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
          <div className="aspect-video overflow-hidden">
            <SafeImage src={article.image} alt={article.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="p-8 md:p-10">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Calendar size={14} />
              {article.date}
            </div>
            <h1 className="mb-6 text-3xl font-black text-gray-900">{article.title}</h1>
            <div className="space-y-4 text-gray-600 leading-7 whitespace-pre-line">
              <p>{article.content}</p>
            </div>

            {article.relatedTourSlug && (
              <div className="mt-8 rounded-2xl bg-primary/5 p-5">
                <p className="mb-2 text-sm font-semibold text-primary">Xem tour lien quan</p>
                <Link to={`/tour/${article.relatedTourSlug}`} className="inline-flex items-center gap-2 font-bold text-primary hover:text-secondary">
                  Di den trang chi tiet tour <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetailPage;
