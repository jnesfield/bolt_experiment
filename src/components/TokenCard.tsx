import React from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar, Users, Shield, Star, Zap } from 'lucide-react';
import { Token } from '../types';
import { formatNumber, formatPercentage, cn } from '../utils';

interface TokenCardProps {
  token: Token;
  onAnalyze: () => void;
  onViewDetail: () => void;
  isSelected?: boolean;
}

export function TokenCard({ token, onAnalyze, onViewDetail, isSelected = false }: TokenCardProps) {
  const priceChangeColor = token.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600';
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

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group cursor-pointer',
        isSelected && 'ring-4 ring-blue-500 scale-[1.02]',
        performanceTier === 'hot' && 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600',
        performanceTier === 'warm' && 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
        performanceTier === 'neutral' && 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600',
        performanceTier === 'cold' && 'bg-gradient-to-br from-gray-500 via-slate-600 to-gray-700'
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:20px_20px]"></div>
      </div>

      {/* Performance Badge */}
      <div className="absolute top-4 right-4 z-10">
        {performanceTier === 'hot' && (
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-bold">HOT</span>
          </div>
        )}
        {performanceTier === 'warm' && (
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-bold">RISING</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
              {token.symbol.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-bold text-white text-xl mb-1">{token.name}</h3>
              <p className="text-white/80 font-medium">{token.symbol}</p>
            </div>
          </div>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors">
            <Star className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Price Section */}
        <div className="mb-6">
          <div className="flex items-baseline space-x-3 mb-2">
            <span className="text-3xl font-bold text-white">${token.price.toFixed(4)}</span>
            <div className={cn('flex items-center px-2 py-1 rounded-lg text-sm font-bold',
              token.priceChange24h >= 0 ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
            )}>
              <PriceIcon className="w-4 h-4 mr-1" />
              {formatPercentage(token.priceChange24h)}
            </div>
          </div>
          <p className="text-white/70 text-sm">24h Change</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center text-white/80 mb-2">
              <Activity className="w-4 h-4 mr-2" />
              <span className="text-xs font-semibold">Market Cap</span>
            </div>
            <p className="font-bold text-lg text-white">{formatNumber(token.marketCap)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center text-white/80 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-xs font-semibold">Volume 24h</span>
            </div>
            <p className="font-bold text-lg text-white">{formatNumber(token.volume24h)}</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm">7d:</span>
              <span className={cn('font-bold text-sm', 
                token.priceChange7d >= 0 ? 'text-green-200' : 'text-red-200'
              )}>
                {formatPercentage(token.priceChange7d)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm">30d:</span>
              <span className={cn('font-bold text-sm', 
                token.priceChange30d >= 0 ? 'text-green-200' : 'text-red-200'
              )}>
                {formatPercentage(token.priceChange30d)}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-sm mb-6">
          <div className="flex items-center text-white/80">
            <Users className="w-4 h-4 mr-1" />
            <span>FDV: {formatNumber(token.fdv)}</span>
          </div>
          <div className="flex items-center text-white/80">
            <Shield className="w-4 h-4 mr-1" />
            <span>Float: {((token.circulatingSupply / token.totalSupply) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
            className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>View Details</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze();
            }}
            className="flex-1 bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analyze</span>
          </button>
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>
    </div>
  );
}