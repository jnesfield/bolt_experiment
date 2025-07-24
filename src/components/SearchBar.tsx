import React, { useState } from 'react';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { cn } from '../utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  minMarketCap: number;
  maxMarketCap: number;
  minVolume: number;
  narrativeFilter: string;
  riskLevel: string;
}

export function SearchBar({ onSearch, onFilterChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    minMarketCap: 0,
    maxMarketCap: 0,
    minVolume: 0,
    narrativeFilter: '',
    riskLevel: ''
  });

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search tokens by name or symbol..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="input pl-10 pr-12 w-full"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors',
            showFilters ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:text-gray-600'
          )}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {showFilters && (
        <div className="card animate-slide-up">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Market Cap
              </label>
              <select
                value={filters.minMarketCap}
                onChange={(e) => handleFilterChange('minMarketCap', Number(e.target.value))}
                className="input"
              >
                <option value={0}>Any</option>
                <option value={1000000}>$1M+</option>
                <option value={10000000}>$10M+</option>
                <option value={100000000}>$100M+</option>
                <option value={1000000000}>$1B+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Volume (24h)
              </label>
              <select
                value={filters.minVolume}
                onChange={(e) => handleFilterChange('minVolume', Number(e.target.value))}
                className="input"
              >
                <option value={0}>Any</option>
                <option value={100000}>$100K+</option>
                <option value={1000000}>$1M+</option>
                <option value={10000000}>$10M+</option>
                <option value={100000000}>$100M+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Narrative
              </label>
              <select
                value={filters.narrativeFilter}
                onChange={(e) => handleFilterChange('narrativeFilter', e.target.value)}
                className="input"
              >
                <option value="">All Narratives</option>
                <option value="ai">AI & ML</option>
                <option value="depin">DePIN</option>
                <option value="rwa">RWA</option>
                <option value="gaming">Gaming</option>
                <option value="defi">DeFi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                value={filters.riskLevel}
                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                className="input"
              >
                <option value="">Any Risk</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>Quick filters for trending opportunities</span>
              </div>
              <button
                onClick={() => {
                  const resetFilters: SearchFilters = {
                    minMarketCap: 0,
                    maxMarketCap: 0,
                    minVolume: 0,
                    narrativeFilter: '',
                    riskLevel: ''
                  };
                  setFilters(resetFilters);
                  onFilterChange(resetFilters);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}