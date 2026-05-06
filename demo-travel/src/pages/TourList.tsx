import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, LayoutGrid, List, ArrowUpDown, ChevronLeft, ChevronRight as ChevronNext } from 'lucide-react';
import FilterSidebar, { type TourListFilters } from '../components/tour/FilterSidebar';
import TourCard from '../components/tour/TourCard';
import type { Tour } from '../types';
import { fetchPublicToursPage } from '../services/travelApi';
import SafeImage from '../components/common/SafeImage';

const regionNames: Record<string, string> = {
  'mien-bac': 'Mien Bac',
  'mien-trung': 'Mien Trung',
  'mien-nam': 'Mien Nam',
  'xuyen-viet': 'Xuyen Viet',
  'bien-dao': 'Bien Dao',
  'tay-nguyen': 'Tay Nguyen',
  'du-lich-mao-hiem': 'Du Lich Mao Hiem',
  'du-lich-sinh-thai': 'Du Lich Sinh Thai',
  'du-lich-tam-linh': 'Du Lich Tam Linh',
  'chau-a': 'Chau A',
  'chau-au': 'Chau Au',
  'chau-my': 'Chau My',
  'chau-uc': 'Chau Uc',
  'dong-nam-a': 'Dong Nam A',
  'trung-dong': 'Trung Dong',
  'chau-phi': 'Chau Phi',
  'du-thuyen-quoc-te': 'Du Thuyen Quoc Te',
};

const parseFiltersFromSearch = (search: string): TourListFilters => {
  const params = new URLSearchParams(search);
  return {
    departure: params.get('departure') || '',
    destination: params.get('destination') || '',
    dateFrom: params.get('dateFrom') || '',
    adultCount: Number(params.get('adultCount') || 0),
    childCount: Number(params.get('childCount') || 0),
    infantCount: Number(params.get('infantCount') || 0),
    priceRange: params.get('priceRange') || 'all',
  };
};

const parseSortFromSearch = (search: string) => new URLSearchParams(search).get('sort') || 'newest';
const parsePageFromSearch = (search: string) => Math.max(Number(new URLSearchParams(search).get('page') || 1), 1);

const TourList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { regionSlug } = useParams();
  const isDomestic = location.pathname.includes('trong-nuoc');

  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<TourListFilters>(() => parseFiltersFromSearch(location.search));
  const [sort, setSort] = useState(() => parseSortFromSearch(location.search));
  const [currentPage, setCurrentPage] = useState(() => parsePageFromSearch(location.search));
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const pageSize = 9;

  const baseTitle = isDomestic ? 'Tour Trong Nuoc' : 'Tour Nuoc Ngoai';
  const regionTitle = regionSlug ? regionNames[regionSlug] ?? regionSlug : null;
  const title = regionTitle ? `${baseTitle} - ${regionTitle}` : baseTitle;

  useEffect(() => {
    setFilters(parseFiltersFromSearch(location.search));
    setSort(parseSortFromSearch(location.search));
    setCurrentPage(parsePageFromSearch(location.search));
  }, [location.search]);

  useEffect(() => {
    let active = true;

    const loadTours = async () => {
      setIsLoading(true);
      setError('');

      try {
        const params: Record<string, unknown> = {
          sort,
          page: regionSlug ? currentPage - 1 : 0,
          pageSize: regionSlug ? pageSize : 100,
        };

        if (regionSlug) {
          params.categorySlug = regionSlug;
        }
        if (filters.departure) {
          params.departure = filters.departure;
        }
        if (filters.destination) {
          params.destination = filters.destination;
        }
        if (filters.dateFrom) {
          params.dateFrom = filters.dateFrom;
        }

        const totalPassengers = filters.adultCount + filters.childCount + filters.infantCount;
        if (totalPassengers > 0) {
          params.adultCount = totalPassengers;
        }

        if (filters.priceRange === 'under-5') {
          params.maxPrice = 5000000;
        }
        if (filters.priceRange === '5-10') {
          params.minPrice = 5000000;
          params.maxPrice = 10000000;
        }
        if (filters.priceRange === '10-20') {
          params.minPrice = 10000000;
          params.maxPrice = 20000000;
        }
        if (filters.priceRange === '20-plus') {
          params.minPrice = 20000000;
        }

        const result = await fetchPublicToursPage(params);
        const filtered = regionSlug
          ? result.items
          : result.items.filter((tour) => (isDomestic ? tour.category === 'domestic' : tour.category === 'international'));

        if (active) {
          if (regionSlug) {
            setTours(filtered);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
          } else {
            const startIndex = (currentPage - 1) * pageSize;
            const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);
            setTours(paginatedItems);
            setTotalElements(filtered.length);
            setTotalPages(Math.max(Math.ceil(filtered.length / pageSize), 1));
          }
        }
      } catch {
        if (active) {
          setError('Khong the tai danh sach tour.');
          setTotalPages(0);
          setTotalElements(0);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadTours();
    return () => {
      active = false;
    };
  }, [currentPage, filters, sort, isDomestic, regionSlug]);

  const countLabel = totalElements || tours.length;

  const departureOptions = useMemo(
    () =>
      [...new Set(tours.map((tour) => tour.departureLocation).filter(Boolean) as string[])].sort((left, right) =>
        left.localeCompare(right),
      ),
    [tours],
  );

  const destinationOptions = useMemo(
    () =>
      [...new Set((tours.map((tour) => tour.location).filter(Boolean) as string[]))].sort((left, right) =>
        left.localeCompare(right),
      ),
    [tours],
  );

  const syncQuery = (nextFilters: TourListFilters, nextSort: string, nextPage = 1) => {
    const params = new URLSearchParams();

    if (nextFilters.departure) params.set('departure', nextFilters.departure);
    if (nextFilters.destination) params.set('destination', nextFilters.destination);
    if (nextFilters.dateFrom) params.set('dateFrom', nextFilters.dateFrom);
    if (nextFilters.adultCount > 0) params.set('adultCount', String(nextFilters.adultCount));
    if (nextFilters.childCount > 0) params.set('childCount', String(nextFilters.childCount));
    if (nextFilters.infantCount > 0) params.set('infantCount', String(nextFilters.infantCount));
    if (nextFilters.priceRange !== 'all') params.set('priceRange', nextFilters.priceRange);
    if (nextSort !== 'newest') params.set('sort', nextSort);
    if (nextPage > 1) params.set('page', String(nextPage));

    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  const handleApplyFilters = () => {
    syncQuery(filters, sort, 1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    syncQuery(filters, value, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    syncQuery(filters, sort, page);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative h-48 md:h-64 flex items-center overflow-hidden">
        <SafeImage
          src="https://picsum.photos/seed/banner-list/1920/400"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"></div>
        <div className="container relative z-10 text-white">
          <h1 className="text-4xl font-black uppercase mb-4">{title}</h1>
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <span>Trang Chu</span>
            <ChevronRight size={16} />
            <span className="text-secondary">{title}</span>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4">
            <FilterSidebar
              departures={departureOptions}
              destinations={destinationOptions}
              filters={filters}
              onChange={setFilters}
              onApply={handleApplyFilters}
              isLoading={isLoading}
            />
          </div>

          <div className="w-full lg:w-3/4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-primary">{title}</h2>
                <p className="text-sm text-gray-500">
                  Tat ca: <span className="font-bold text-gray-900">{countLabel} Tour</span>
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <ArrowUpDown size={16} />
                  <span>Sap xep:</span>
                  <select
                    value={sort}
                    onChange={(event) => handleSortChange(event.target.value)}
                    className="bg-transparent focus:outline-none font-bold text-gray-900"
                  >
                    <option value="newest">Moi nhat</option>
                    <option value="price_asc">Gia tang dan</option>
                    <option value="price_desc">Gia giam dan</option>
                  </select>
                </div>
                <div className="hidden sm:flex items-center gap-2 border-l pl-6">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

            {isLoading ? (
              <div className="rounded-2xl bg-white px-6 py-10 text-center text-gray-500 shadow-sm border border-gray-100">
                Dang tai du lieu tour...
              </div>
            ) : tours.length === 0 ? (
              <div className="rounded-2xl bg-white px-6 py-10 text-center text-gray-500 shadow-sm border border-gray-100">
                Chua co tour phu hop voi bo loc hien tai.
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
                      : 'grid grid-cols-1 gap-6 mb-8'
                  }
                >
                  {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                    <p className="text-sm text-gray-500">
                      Trang <span className="font-bold text-gray-900">{currentPage}</span> / {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                        Truoc
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Sau
                        <ChevronNext size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourList;
