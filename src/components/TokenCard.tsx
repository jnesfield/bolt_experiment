import React from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar, Users, Shield } from 'lucide-react';
import { Token } from '../types';
import { formatNumber, formatPercentage, cn } from '../utils';

interface TokenCardProps {
  token: Token;
  onAnalyze: () => void;
  onViewDetail: () => void;
  isSelected?: boolean;
}

export function TokenCard({ token, onAnalyze, onViewDetail, isSelected = false }: TokenCardProps) {
  const priceChangeColor = token.priceChange24h >= 0 ? 'text-success-600' : 'text-danger-600';
  const priceChangeIcon = token.priceChange24h >= 0 ? TrendingUp : TrendingDown;
  const PriceIcon = priceChangeIcon;

  return (
    <div
      className={cn(
        'card transition-all duration-300 hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1 group',
        isSelected && 'ring-2 ring-primary-500 shadow-xl scale-[1.02]'
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={onViewDetail}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
            {token.symbol.slice(0, 2)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{token.name}</h3>
            <p className="text-sm text-gray-600 font-medium">{token.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-gray-900">${token.price.toFixed(4)}</p>
          <div className={cn('flex items-center text-sm font-semibold', priceChangeColor)}>
            <PriceIcon className="w-4 h-4 mr-1" />
            {formatPercentage(token.priceChange24h)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="metric-card group-hover:shadow-md">
          <div className="flex items-center text-gray-600 mb-2">
            <Activity className="w-4 h-4 mr-1" />
            <span className="text-xs font-semibold">Market Cap</span>
          </div>
          <p className="font-bold text-lg">{formatNumber(token.marketCap)}</p>
        </div>
        <div className="metric-card group-hover:shadow-md">
          <div className="flex items-center text-gray-600 mb-2">
            <Calendar className="w-4 h-4 mr-1" />
            <span className="text-xs font-semibold">Volume 24h</span>
          </div>
          <p className="font-bold text-lg">{formatNumber(token.volume24h)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-1" />
          <span className="font-medium">FDV: {formatNumber(token.fdv)}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Shield className="w-4 h-4 mr-1" />
          <span className="font-medium">Float: {((token.circulatingSupply / token.totalSupply) * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200/60">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">7d Performance:</span>
          <span className={cn('font-bold', token.priceChange7d >= 0 ? 'text-success-600' : 'text-danger-600')}>
            {formatPercentage(token.priceChange7d)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 font-medium">30d Performance:</span>
          <span className={cn('font-bold', token.priceChange30d >= 0 ? 'text-success-600' : 'text-danger-600')}>
            {formatPercentage(token.priceChange30d)}
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="pt-4 border-t border-subtle flex space-x-3">
        <button
          onClick={onViewDetail}
          className="flex-1 btn btn-primary text-sm py-2 hover:scale-105 transition-transform duration-200"
        >
          <Activity className="w-4 h-4 mr-1" />
          View Details
        </button>
        <button
          onClick={onAnalyze}
          className="flex-1 btn btn-secondary text-sm py-2 hover:scale-105 transition-transform duration-200"
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Analyze
        </button>
      </div>
    </div>
  );
}