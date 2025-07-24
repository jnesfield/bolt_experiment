import React from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar, Users, Shield } from 'lucide-react';
import { Token } from '../types';
import { formatNumber, formatPercentage, cn } from '../utils';

interface TokenCardProps {
  token: Token;
  onClick: () => void;
  isSelected?: boolean;
}

export function TokenCard({ token, onClick, isSelected = false }: TokenCardProps) {
  const priceChangeColor = token.priceChange24h >= 0 ? 'text-success-600' : 'text-danger-600';
  const priceChangeIcon = token.priceChange24h >= 0 ? TrendingUp : TrendingDown;
  const PriceIcon = priceChangeIcon;

  return (
    <div
      className={cn(
        'card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
        isSelected && 'ring-2 ring-primary-500 shadow-lg'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {token.symbol.slice(0, 2)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{token.name}</h3>
            <p className="text-sm text-gray-500">{token.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">${token.price.toFixed(2)}</p>
          <div className={cn('flex items-center text-sm', priceChangeColor)}>
            <PriceIcon className="w-4 h-4 mr-1" />
            {formatPercentage(token.priceChange24h)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="metric-card">
          <div className="flex items-center text-gray-600 mb-1">
            <Activity className="w-4 h-4 mr-1" />
            <span className="text-xs">Market Cap</span>
          </div>
          <p className="font-semibold">{formatNumber(token.marketCap)}</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center text-gray-600 mb-1">
            <Calendar className="w-4 h-4 mr-1" />
            <span className="text-xs">Volume 24h</span>
          </div>
          <p className="font-semibold">{formatNumber(token.volume24h)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-1" />
          <span>FDV: {formatNumber(token.fdv)}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Shield className="w-4 h-4 mr-1" />
          <span>Float: {((token.circulatingSupply / token.totalSupply) * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">7d:</span>
          <span className={token.priceChange7d >= 0 ? 'text-success-600' : 'text-danger-600'}>
            {formatPercentage(token.priceChange7d)}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">30d:</span>
          <span className={token.priceChange30d >= 0 ? 'text-success-600' : 'text-danger-600'}>
            {formatPercentage(token.priceChange30d)}
          </span>
        </div>
      </div>
    </div>
  );
}