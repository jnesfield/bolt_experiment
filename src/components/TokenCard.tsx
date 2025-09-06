import React from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar, Users, Shield, Star, Zap, Flame, Target, BarChart3 } from 'lucide-react';
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

  // Calculate performance tier for visual styling
  const getPerformanceTier = () => {
    if (token.priceChange30d > 100) return 'hot';
    if (token.priceChange30d > 50) return 'warm';
    if (token.priceChange30d > 0) return 'neutral';
    return 'cold';
  };

  const performanceTier = getPerformanceTier();

  const getCardClasses = () => {
    const baseClasses = 'relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02] group cursor-pointer border-2 backdrop-blur-xl';
    
    switch (performanceTier) {
      case 'hot':
        return `${baseClasses} bg-gradient-to-br from-red-500/20 via-orange-500/15 to-red-600/20 border-red-400/40 shadow-2xl hover:shadow-red-500/30`;
      case 'warm':
        return `${baseClasses} bg-gradient-to-br from-orange-500/20 via-yellow-500/15 to-orange-600/20 border-orange-400/40 shadow-2xl hover:shadow-orange-500/30`;
      case 'neutral':
        return `${baseClasses} bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-blue-600/20 border-blue-400/40 shadow-2xl hover:shadow-blue-500/30`;
      case 'cold':
        return `${baseClasses} bg-gradient-to-br from-gray-500/20 via-slate-500/15 to-gray-600/20 border-gray-400/40 shadow-2xl hover:shadow-gray-500/30`;
      default:
        return `${baseClasses} bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-blue-600/20 border-blue-400/40 shadow-2xl hover:shadow-blue-500/30`;
    }
  };

  const getPerformanceIcon = () => {
    switch (performanceTier) {
      case 'hot': return Flame;
      case 'warm': return TrendingUp;
      case 'neutral': return Target;
      case 'cold': return BarChart3;
      default: return Activity;
    }
  };

  const getPerformanceBadge = () => {
    switch (performanceTier) {
      case 'hot':
        return (
          <div className="bg-red-500/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 border border-red-400/50 shadow-lg">
            <Flame className="w-4 h-4 text-red-300" />
            <span className="text-red-200 text-xs font-bold">🔥 HOT</span>
          </div>
        );
      case 'warm':
        return (
          <div className="bg-orange-500/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 border border-orange-400/50 shadow-lg">
            <TrendingUp className="w-4 h-4 text-orange-300" />
            <span className="text-orange-200 text-xs font-bold">📈 RISING</span>
          </div>
        );
      case 'neutral':
        return (
          <div className="bg-blue-500/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 border border-blue-400/50 shadow-lg">
            <Target className="w-4 h-4 text-blue-300" />
            <span className="text-blue-200 text-xs font-bold">🎯 STABLE</span>
          </div>
        );
      case 'cold':
        return (
          <div className="bg-gray-500/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 border border-gray-400/50 shadow-lg">
            <BarChart3 className="w-4 h-4 text-gray-300" />
            <span className="text-gray-200 text-xs font-bold">📊 COLD</span>
          </div>
        );
    }
  };

  const PerformanceIcon = getPerformanceIcon();

  return (
    <div className={cn(getCardClasses(), isSelected && 'ring-4 ring-cyan-400/60 scale-[1.02]')}>
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.05)_0%,transparent_50%)]"></div>
      </div>

      {/* Performance badge - top right */}
      <div className="absolute top-4 right-4 z-20">
        {getPerformanceBadge()}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 text-white h-full flex flex-col min-h-[480px]">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl group-hover:scale-110 transition-transform duration-300 border border-white/20">
                {token.symbol.slice(0, 2)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <PerformanceIcon className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-xl mb-1 group-hover:text-cyan-200 transition-colors line-clamp-1">{token.name}</h3>
              <p className="text-white/70 font-semibold text-sm">{token.symbol}</p>
            </div>
          </div>
          <button className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 group-hover:scale-110 shrink-0">
            <Star className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Price Section */}
        <div className="mb-6">
          <div className="flex items-baseline space-x-3 mb-2">
            <span className="text-3xl font-bold text-white group-hover:text-cyan-200 transition-colors">
              ${token.price.toFixed(4)}
            </span>
            <div className={cn('flex items-center px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm border',
              token.priceChange24h >= 0 
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' 
                : 'bg-red-500/20 text-red-200 border-red-400/30'
            )}>
              <PriceIcon className="w-4 h-4 mr-1" />
              {formatPercentage(token.priceChange24h)}
            </div>
          </div>
          <p className="text-white/60 text-xs font-medium">24h Change</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center text-white/70 mb-2">
              <Activity className="w-4 h-4 mr-2" />
              <span className="text-xs font-semibold">Market Cap</span>
            </div>
            <p className="font-bold text-lg text-white">{formatNumber(token.marketCap)}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center text-white/70 mb-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="text-xs font-semibold">Volume 24h</span>
            </div>
            <p className="font-bold text-lg text-white">{formatNumber(token.volume24h)}</p>
          </div>
        </div>

        {/* Performance Timeline */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 mb-6 border border-white/10">
          <h4 className="text-white font-bold mb-3 flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            Performance Timeline
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs font-medium">7 days:</span>
              <span className={cn('font-bold text-xs px-2 py-1 rounded-md', 
                token.priceChange7d >= 0 
                  ? 'text-emerald-200 bg-emerald-500/20' 
                  : 'text-red-200 bg-red-500/20'
              )}>
                {formatPercentage(token.priceChange7d)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs font-medium">30 days:</span>
              <span className={cn('font-bold text-xs px-2 py-1 rounded-md', 
                token.priceChange30d >= 0 
                  ? 'text-emerald-200 bg-emerald-500/20' 
                  : 'text-red-200 bg-red-500/20'
              )}>
                {formatPercentage(token.priceChange30d)}
              </span>
            </div>
          </div>
        </div>

        {/* Token Info */}
        <div className="flex items-center justify-between text-xs mb-6 bg-white/5 backdrop-blur-xl rounded-lg p-3 border border-white/10">
          <div className="flex items-center text-white/70">
            <Users className="w-3 h-3 mr-1" />
            <span className="font-medium">FDV: {formatNumber(token.fdv)}</span>
          </div>
          <div className="flex items-center text-white/70">
            <Shield className="w-3 h-3 mr-1" />
            <span className="font-medium">Float: {((token.circulatingSupply / token.totalSupply) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
            className="flex-1 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 border border-white/20 text-sm"
          >
            <Activity className="w-4 h-4" />
            <span>Details</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze();
            }}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 shadow-lg text-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Analyze</span>
          </button>
        </div>
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>
    </div>
  );
}