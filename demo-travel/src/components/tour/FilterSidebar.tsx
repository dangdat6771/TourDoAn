import React from 'react';
import { Filter, ChevronDown, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';

export type TourListFilters = {
  departure: string;
  destination: string;
  dateFrom: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  priceRange: string;
};

interface FilterSidebarProps {
  departures: string[];
  destinations: string[];
  filters: TourListFilters;
  onChange: (filters: TourListFilters) => void;
  onApply: () => void;
  isLoading?: boolean;
}

const priceRanges = [
  { value: 'all', label: 'Tat ca muc gia' },
  { value: 'under-5', label: 'Duoi 5 trieu' },
  { value: '5-10', label: 'Tu 5 den 10 trieu' },
  { value: '10-20', label: 'Tu 10 den 20 trieu' },
  { value: '20-plus', label: 'Tren 20 trieu' },
];

const updateQuantity = (
  value: number,
  delta: number,
  minimum: number,
) => Math.max(minimum, value + delta);

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  departures,
  destinations,
  filters,
  onChange,
  onApply,
  isLoading = false,
}) => {
  const selectedDate = filters.dateFrom ? new Date(filters.dateFrom) : null;

  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
      <div className="bg-primary p-4 flex items-center gap-2 text-white">
        <Filter size={20} />
        <h3 className="font-bold uppercase tracking-wider">Bo Loc</h3>
      </div>

      <div className="p-6 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700">Diem di</label>
          <div className="relative">
            <select
              value={filters.departure}
              onChange={(event) => onChange({ ...filters, departure: event.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="">Tat ca diem di</option>
              {departures.map((departure) => (
                <option key={departure} value={departure}>
                  {departure}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700">Diem den</label>
          <div className="relative">
            <select
              value={filters.destination}
              onChange={(event) => onChange({ ...filters, destination: event.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="">Tat ca diem den</option>
              {destinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700">Ngay khoi hanh</label>
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={(date) =>
                onChange({
                  ...filters,
                  dateFrom: date ? date.toISOString().slice(0, 10) : '',
                })
              }
              placeholderText="dd/mm/yyyy"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              dateFormat="dd/MM/yyyy"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-bold text-gray-700">So luong hanh khach</label>

          {[
            { key: 'adultCount', label: 'Nguoi lon', minimum: 0 },
            { key: 'childCount', label: 'Tre em', minimum: 0 },
            { key: 'infantCount', label: 'Em be', minimum: 0 },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-sm text-gray-600">{item.label}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      [item.key]: updateQuantity(
                        filters[item.key as keyof TourListFilters] as number,
                        -1,
                        item.minimum,
                      ),
                    })
                  }
                  className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                >
                  -
                </button>
                <span className="text-sm font-bold w-5 text-center">
                  {filters[item.key as keyof TourListFilters] as number}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      [item.key]: (filters[item.key as keyof TourListFilters] as number) + 1,
                    })
                  }
                  className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700">Muc gia</label>
          <div className="relative">
            <select
              value={filters.priceRange}
              onChange={(event) => onChange({ ...filters, priceRange: event.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        <button
          type="button"
          onClick={onApply}
          disabled={isLoading}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg mt-4 disabled:opacity-70"
        >
          {isLoading ? 'Dang loc...' : 'Ap Dung'}
        </button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
