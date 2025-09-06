import React from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar, Users, Shield, Star, Zap, Flame, Target } from 'lucide-react';
import { Token } from '../types';
import { formatNumber, formatPercentage, cn } from '../utils';

interface TokenCardProps {
  token: Token;
  onAnalyze: () => void;
  onViewDetail: () => void;
  isSelected?: boolean;
}

export function TokenCard({ token, onAnalyze, onViewDetail, isSelected = false }: TokenCardProps) {
  const priceChangeColor = token.priceChange24h >= 0 ? 'text-green-300' : 'text-red-300';
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
    const baseClasses = 'relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-[1.03] group cursor-pointer border-2';
    
    switch (performanceTier) {
      case 'hot':
        return `${baseClasses} token-card-hot border-red-400/50 animate-glow`;
      case 'warm':
        return `${baseClasses} token-card-warm border-orange-400/50`;
      case 'neutral':
        return `${baseClasses} token-card-neutral border-blue-400/50`;
      case 'cold':
        return `${baseClasses} token-card-cold border-gray-400/50`;
      default:
        return `${baseClasses} token-card-neutral border-blue-400/50`;
    }
  };

  const getPerformanceIcon = () => {
    switch (performanceTier) {
      case 'hot': return Flame;
      case 'warm': return TrendingUp;
      case 'neutral': return Target;
      case 'cold': return Activity;
      default: return Activity;
    }
  };

  const PerformanceIcon = getPerformanceIcon();

  return (
    <div className={cn(getCardClasses(), isSelected && 'ring-4 ring-cyan-400 scale-[1.03]')}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:30px_30px] animate-pulse"></div>
      </div>

      {/* Floating performance badge */}
      <div className="absolute top-6 right-6 z-20">
        {performanceTier === 'hot' && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 border border-red-400/30 animate-float">
            <Flame className="w-5 h-5 text-red-300" />
            <span className="text-red-200 text-sm font-bold">🔥 HOT</span>
          </div>
        )}
        {performanceTier === 'warm' && (
          <div className="bg-orange-500/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 border border-orange-400/30">
            <TrendingUp className="w-5 h-5 text-orange-300" />
            <span className="text-orange-200 text-sm font-bold">📈 RISING</span>
          </div>
        )}
        {performanceTier === 'neutral' && (
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 border border-blue-400/30">
            <Target className="w-5 h-5 text-blue-300" />
            <span className="text-blue-200 text-sm font-bold">🎯 STABLE</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 text-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl group-hover:scale-110 transition-transform duration-300 border border-white/20">
                {token.symbol.slice(0, 2)}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <PerformanceIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-2xl mb-2 group-hover:text-cyan-200 transition-colors">{token.name}</h3>
              <p className="text-white/70 font-semibold text-lg">{token.symbol}</p>
            </div>
          </div>
          <button className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 group-hover:scale-110">
            <Star className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Price Section */}
        <div className="mb-8">
          <div className="flex items-baseline space-x-4 mb-3">
            <span className="text-4xl font-bold text-white group-hover:text-cyan-200 transition-colors">
              ${token.price.toFixed(4)}
            </span>
            <div className={cn('flex items-center px-3 py-2 rounded-xl text-sm font-bold backdrop-blur-sm border',
              token.priceChange24h >= 0 
                ? 'bg-green-500/20 text-green-200 border-green-400/30' 
                : 'bg-red-500/20 text-red-200 border-red-400/30'
            )}>
              <PriceIcon className="w-5 h-5 mr-2" />
              {formatPercentage(token.priceChange24h)}
            </div>
          </div>
          <p className="text-white/60 text-sm font-medium">24h Change</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8 flex-1">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
            <div className="flex items-center text-white/70 mb-3">
              <Activity className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">Market Cap</span>
            </div>
            <p className="font-bold text-xl text-white">{formatNumber(token.marketCap)}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
            <div className="flex items-center text-white/70 mb-3">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">Volume 24h</span>
            </div>
            <p className="font-bold text-xl text-white">{formatNumber(token.volume24h)}</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <h4 className="text-white font-bold mb-4 flex items-center text-lg">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm font-medium">7 days:</span>
              <span className={cn('font-bold text-sm px-3 py-1 rounded-lg', 
                token.priceChange7d >= 0 
                  ? 'text-green-200 bg-green-500/20' 
                  : 'text-red-200 bg-red-500/20'
              )}>
                {formatPercentage(token.priceChange7d)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm font-medium">30 days:</span>
              <span className={cn('font-bold text-sm px-3 py-1 rounded-lg', 
                token.priceChange30d >= 0 
                  ? 'text-green-200 bg-green-500/20' 
                  : 'text-red-200 bg-red-500/20'
              )}>
                {formatPercentage(token.priceChange30d)}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-sm mb-8 bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="flex items-center text-white/70">
            <Users className="w-4 h-4 mr-2" />
            <span className="font-medium">FDV: {formatNumber(token.fdv)}</span>
          </div>
          <div className="flex items-center text-white/70">
            <Shield className="w-4 h-4 mr-2" />
            <span className="font-medium">Float: {((token.circulatingSupply / token.totalSupply) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
            className="flex-1 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 border border-white/20"
          >
            <Activity className="w-5 h-5" />
            <span>View Details</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze();
            }}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
          >
            <Zap className="w-5 h-5" />
            <span>Analyze</span>
          </button>
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>
    </div>
  );
}