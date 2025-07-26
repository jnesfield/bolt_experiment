import React, { useState } from 'react';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { useTokenSearch } from '../hooks/useTokenData';
import { cn } from '../utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  onTokenSelect?: (tokenId: string) => void;
}

export interface SearchFilters {
  minMarketCap: number;
  maxMarketCap: number;
  minVolume: number;
  narrativeFilter: string;
  riskLevel: string;
}

export function SearchBar({ onSearch, onFilterChange, onTokenSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    minMarketCap: 0,
    maxMarketCap: 0,
    minVolume: 0,
    narrativeFilter: '',
    riskLevel: ''
  });

  const { data: searchResults } = useTokenSearch(query);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
    setShowResults(value.length > 2);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTokenSelect = (tokenId: string, tokenName: string) => {
    setQuery(tokenName);
    setShowResults(false);
    onTokenSelect?.(tokenId);
    onSearch(tokenName);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search tokens by name or symbol..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length > 2 && setShowResults(true)}
          className="input pl-12 pr-14 w-full h-14 text-base font-medium bg-white/80 backdrop-blur-sm border-2 border-gray-200/60 focus:border-primary-400 shadow-lg"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 shadow-sm',
            showFilters ? 'text-primary-600 bg-primary-100 border border-primary-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 border border-gray-200'
          )}
        >
          <Filter className="w-5 h-5" />
        </button>
        
        {/* Search Results Dropdown */}
        {showResults && searchResults?.coins && searchResults.coins.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border-2 border-gray-200/60 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
            {searchResults.coins.slice(0, 10).map((coin: any) => (
              <button
                key={coin.id}
                onClick={() => handleTokenSelect(coin.id, coin.name)}
                className="w-full px-6 py-4 text-left hover:bg-primary-50/80 flex items-center space-x-4 border-b border-gray-100/60 last:border-b-0 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-110 transition-transform">
                  {coin.symbol?.slice(0, 2).toUpperCase() || coin.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-primary-700">{coin.name}</p>
                  <p className="text-sm text-gray-600 font-medium">{coin.symbol?.toUpperCase()}</p>
                </div>
                <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                  #{coin.market_cap_rank || 'N/A'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Click outside to close results */}
      {showResults && <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />}

      {showFilters && (
        <div className="section-card animate-slide-up">
          <div className="section-header">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Filter className="w-6 h-6 text-primary-600" />
                <span>Advanced Filters</span>
              </h3>
              <p className="text-gray-600 text-sm mt-1">Refine your token discovery</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Market Cap
              </label>
              <select
                value={filters.minMarketCap}
                onChange={(e) => handleFilterChange('minMarketCap', Number(e.target.value))}
                className="input bg-white/80 border-2 border-gray-200/60 focus:border-primary-400"
              >
                <option value={0}>Any</option>
                <option value={1000000}>$1M+</option>
                <option value={10000000}>$10M+</option>
                <option value={100000000}>$100M+</option>
                <option value={1000000000}>$1B+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Volume (24h)
              </label>
              <select
                value={filters.minVolume}
                onChange={(e) => handleFilterChange('minVolume', Number(e.target.value))}
                className="input bg-white/80 border-2 border-gray-200/60 focus:border-primary-400"
              >
                <option value={0}>Any</option>
                <option value={100000}>$100K+</option>
                <option value={1000000}>$1M+</option>
                <option value={10000000}>$10M+</option>
                <option value={100000000}>$100M+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Narrative
              </label>
              <select
                value={filters.narrativeFilter}
                onChange={(e) => handleFilterChange('narrativeFilter', e.target.value)}
                className="input bg-white/80 border-2 border-gray-200/60 focus:border-primary-400"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Risk Level
              </label>
              <select
                value={filters.riskLevel}
                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                className="input bg-white/80 border-2 border-gray-200/60 focus:border-primary-400"
              >
                <option value="">Any Risk</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium">
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
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-lg transition-all duration-200"
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