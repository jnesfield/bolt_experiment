import React from 'react';
import { TrendingUp, Zap, Target, Activity, Code, MessageSquare } from 'lucide-react';
import { AnalysisResult, BreakoutSignal } from '../types';
import { formatNumber, formatPercentage, cn } from '../utils';

interface BreakoutRadarProps {
  candidates: AnalysisResult[];
  onTokenSelect: (tokenId: string) => void;
}

export function BreakoutRadar({ candidates, onTokenSelect }: BreakoutRadarProps) {
  const getSignalIcon = (type: BreakoutSignal['type']) => {
    switch (type) {
      case 'volume': return Activity;
      case 'price': return TrendingUp;
      case 'development': return Code;
      case 'narrative': return MessageSquare;
      case 'smart_money': return Target;
      case 'technical': return Zap;
      default: return Activity;
    }
  };

  const getSignalColor = (strength: BreakoutSignal['strength']) => {
    switch (strength) {
      case 'strong': return 'text-success-600 bg-success-50';
      case 'moderate': return 'text-warning-600 bg-warning-50';
      case 'weak': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-success-700 bg-success-100';
    if (probability >= 65) return 'text-warning-700 bg-warning-100';
    return 'text-primary-700 bg-primary-100';
  };

  if (candidates.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Breakout Candidates</h3>
          <p className="text-gray-600">No tokens currently meet the breakout criteria (60%+ probability).</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Breakout Radar</h2>
              <p className="text-sm text-gray-600">Tokens with high probability of price breakouts</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Candidates Found</p>
            <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="metric-card">
            <p className="text-xs text-gray-600 mb-1">Avg Breakout Probability</p>
            <p className="font-semibold text-lg">
              {candidates.length > 0 
                ? Math.round(candidates.reduce((sum, c) => sum + c.breakoutProbability, 0) / candidates.length)
                : 0}%
            </p>
          </div>
          <div className="metric-card">
            <p className="text-xs text-gray-600 mb-1">High Confidence (80%+)</p>
            <p className="font-semibold text-lg text-success-600">
              {candidates.filter(c => c.breakoutProbability >= 80).length}
            </p>
          </div>
          <div className="metric-card">
            <p className="text-xs text-gray-600 mb-1">Total Market Cap</p>
            <p className="font-semibold text-lg">
              {formatNumber(candidates.reduce((sum, c) => sum + c.token.marketCap, 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {candidates.map((candidate, index) => {
          const { token, breakoutProbability, breakoutSignals } = candidate;
          const topSignals = breakoutSignals.slice(0, 3);
          
          return (
            <div 
              key={token.id}
              className="card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
              onClick={() => onTokenSelect(token.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      #{index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{token.name}</h3>
                    <p className="text-sm text-gray-500">{token.symbol} • ${token.price.toFixed(4)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', 
                    getProbabilityColor(breakoutProbability)
                  )}>
                    <Zap className="w-4 h-4 mr-1" />
                    {breakoutProbability}% Breakout
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatNumber(token.marketCap)} cap
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="metric-card">
                  <p className="text-xs text-gray-600 mb-1">24h Change</p>
                  <p className={cn('font-semibold', 
                    token.priceChange24h >= 0 ? 'text-success-600' : 'text-danger-600'
                  )}>
                    {formatPercentage(token.priceChange24h)}
                  </p>
                </div>
                <div className="metric-card">
                  <p className="text-xs text-gray-600 mb-1">7d Change</p>
                  <p className={cn('font-semibold', 
                    token.priceChange7d >= 0 ? 'text-success-600' : 'text-danger-600'
                  )}>
                    {formatPercentage(token.priceChange7d)}
                  </p>
                </div>
                <div className="metric-card">
                  <p className="text-xs text-gray-600 mb-1">Volume Ratio</p>
                  <p className="font-semibold">
                    {((token.volume24h / token.marketCap) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-2 font-medium">Key Breakout Signals</p>
                <div className="space-y-2">
                  {topSignals.map((signal, signalIndex) => {
                    const SignalIcon = getSignalIcon(signal.type);
                    return (
                      <div 
                        key={signalIndex}
                        className={cn('flex items-center p-2 rounded-lg', getSignalColor(signal.strength))}
                      >
                        <SignalIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm flex-1">{signal.description}</span>
                        <span className="text-xs font-medium ml-2">
                          {signal.strength.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {breakoutSignals.length > 3 && (
                  <p className="text-xs text-gray-500 mt-2">
                    +{breakoutSignals.length - 3} more signals
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Risk Level:</span>
                  <span className={cn('font-medium capitalize', 
                    candidate.riskLevel === 'low' ? 'text-success-600' : 
                    candidate.riskLevel === 'medium' ? 'text-warning-600' : 'text-danger-600'
                  )}>
                    {candidate.riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Overall Score:</span>
                  <span className="font-medium">{candidate.overallScore}/100</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Breakout Methodology</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Volume Analysis (25%):</strong> Exceptional volume relative to market cap indicates accumulation</p>
          <p><strong>Price Action (20%):</strong> Recent momentum and trend strength</p>
          <p><strong>Development Activity (20%):</strong> Growing developer engagement and commit activity</p>
          <p><strong>Narrative Strength (15%):</strong> Alignment with trending market themes</p>
          <p><strong>Market Cap Tier (10%):</strong> Micro/small caps with volume have higher breakout potential</p>
          <p><strong>Smart Money (10%):</strong> Indicators of institutional or whale accumulation</p>
        </div>
      </div>
    </div>
  );
}