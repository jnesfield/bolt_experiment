import React from 'react';
import { TrendingUp, TrendingDown, Activity, Star, Zap, Target } from 'lucide-react';
import { Token } from '../types';
import { formatNumber, formatPercentage, cn } from '../utils';

interface TokenCardProps {
  token: Token;
  onAnalyze: () => void;
  onViewDetail: () => void;
  isSelected?: boolean;
}

export function TokenCard({ token, onAnalyze, onViewDetail, isSelected = false }: TokenCardProps) {
  const priceChangeColor = token.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400';
  const priceChangeIcon = token.priceChange24h >= 0 ? TrendingUp : TrendingDown;
  const PriceIcon = priceChangeIcon;

  // Simplified performance tier
  const getPerformanceTier = () => {
    if (token.priceChange30d > 100) return 'hot';
    if (token.priceChange30d > 20) return 'warm';
    if (token.priceChange30d > -20) return 'neutral';
    return 'cold';
  };

  const performanceTier = getPerformanceTier();

  const getCardClasses = () => {
    const baseClasses = 'relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer border backdrop-blur-xl';
    
    switch (performanceTier) {
      case 'hot':
        return `${baseClasses} bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-400/30 hover:border-red-400/50`;
      case 'warm':
        return `${baseClasses} bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-400/30 hover:border-orange-400/50`;
      case 'neutral':
        return `${baseClasses} bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/30 hover:border-blue-400/50`;
      case 'cold':
        return `${baseClasses} bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-400/30 hover:border-gray-400/50`;
      default:
        return `${baseClasses} bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/30 hover:border-blue-400/50`;
    }
  };

  const getPerformanceBadge = () => {
    switch (performanceTier) {
      case 'hot':
        return <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-full">🔥 HOT</span>;
      case 'warm':
        return <span className="text-xs font-bold text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">📈 UP</span>;
      case 'neutral':
        return <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">📊 OK</span>;
      case 'cold':
        return <span className="text-xs font-bold text-gray-400 bg-gray-500/20 px-2 py-1 rounded-full">❄️ DOWN</span>;
    }
  };

  return (
    <div className={cn(getCardClasses(), isSelected && 'ring-2 ring-cyan-400/60')}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white font-bold border border-white/20">
              {token.symbol.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{token.name}</h3>
              <p className="text-white/60 text-sm">{token.symbol}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getPerformanceBadge()}
            <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <Star className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="text-2xl font-bold text-white">${token.price.toFixed(4)}</span>
            <div className={cn('flex items-center text-sm font-semibold',
              token.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              <PriceIcon className="w-4 h-4 mr-1" />
              {formatPercentage(token.priceChange24h)}
            </div>
          </div>
          <p className="text-white/50 text-xs">24h change</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Market Cap</p>
            <p className="text-white font-semibold text-sm">{formatNumber(token.marketCap)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Volume 24h</p>
            <p className="text-white font-semibold text-sm">{formatNumber(token.volume24h)}</p>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-xs">7d</span>
            <span className={cn('text-xs font-semibold', 
              token.priceChange7d >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {formatPercentage(token.priceChange7d)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-xs">30d</span>
            <span className={cn('text-xs font-semibold', 
              token.priceChange30d >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {formatPercentage(token.priceChange30d)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze();
            }}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-all text-sm"
          >
            <Zap className="w-4 h-4 inline mr-1" />
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
}