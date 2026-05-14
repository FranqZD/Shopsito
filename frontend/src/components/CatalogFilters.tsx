import { useEffect, useRef, useState } from 'react';
import apiService from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

interface Category {
  id: number;
  name: string;
}

interface Props {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
}

export default function CatalogFilters({ onSearchChange, onCategoryChange }: Props) {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const isFirstRender = useRef(true);

  const debouncedSearch = useDebounce(searchInput, 300);

  // Fetch categories on mount
  useEffect(() => {
    apiService.get<Category[]>('/api/categories').then((res) => {
      setCategories(res.data);
    }).catch(() => {
      // Error handled by API interceptor
    });
  }, []);

  // Notify parent when debounced search changes (min 2 chars or cleared)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debouncedSearch.length >= 2) {
      onSearchChange(debouncedSearch);
    } else if (debouncedSearch.length === 0) {
      onSearchChange('');
    }
  }, [debouncedSearch, onSearchChange]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onCategoryChange(value);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900
            placeholder-gray-400 transition duration-200 ease-in-out
            focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
            dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500
            dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
        />
      </div>

      {/* Category dropdown */}
      <select
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900
          transition duration-200 ease-in-out
          focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
          dark:border-gray-600 dark:bg-gray-800 dark:text-white
          dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
