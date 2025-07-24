import React from 'react';
import { TrendingUp, Flame, Calendar, DollarSign } from 'lucide-react';
import { NarrativeData } from '../types';
import { formatNumber, formatPercentage, cn } from '../utils';

interface NarrativeCardProps {
  narrative: NarrativeData;
  onClick: () => void;
}

export function NarrativeCard({ narrative, onClick }: NarrativeCardProps) {
  return (
    <div 
      className="card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{narrative.name}</h3>
            <p className="text-sm text-gray-500">{narrative.tokens.length} tokens</p>
          </div>
        </div>
        {narrative.trending && (
          <span className="badge badge-success">
            <TrendingUp className="w-3 h-3 mr-1" />
            TRENDING
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{narrative.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="metric-card">
          <div className="flex items-center text-gray-600 mb-1">
            <Calendar className="w-4 h-4 mr-1" />
            <span className="text-xs">30d Performance</span>
          </div>
          <p className="font-semibold text-success-600">
            {formatPercentage(narrative.performance30d)}
          </p>
        </div>
        <div className="metric-card">
          <div className="flex items-center text-gray-600 mb-1">
            <DollarSign className="w-4 h-4 mr-1" />
            <span className="text-xs">Market Cap</span>
          </div>
          <p className="font-semibold">{formatNumber(narrative.marketCap)}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-600 mb-2">Key Catalysts</p>
        <div className="flex flex-wrap gap-1">
          {narrative.catalysts.slice(0, 3).map((catalyst, index) => (
            <span key={index} className="badge badge-primary text-xs">
              {catalyst}
            </span>
          ))}
          {narrative.catalysts.length > 3 && (
            <span className="text-xs text-gray-500">
              +{narrative.catalysts.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}