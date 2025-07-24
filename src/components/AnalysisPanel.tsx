import React from 'react';
import { 
  TrendingUp, 
  Code, 
  Coins, 
  Users, 
  MessageSquare, 
  Building, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { formatNumber, formatPercentage, getScoreColor, getScoreBadgeColor, getRiskColor, getRecommendationColor, cn } from '../utils';

interface AnalysisPanelProps {
  analysis: AnalysisResult;
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const { token, narrative, developerMetrics, tokenomics, smartMoney, sentiment, listing, technical, overallScore, riskLevel, recommendation } = analysis;

  const ScoreIcon = overallScore >= 70 ? CheckCircle : overallScore >= 40 ? AlertTriangle : XCircle;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
              {token.symbol.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{token.name}</h2>
              <p className="text-gray-600">{token.symbol} • ${token.price.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <ScoreIcon className={cn('w-6 h-6', getScoreColor(overallScore))} />
              <span className={cn('text-2xl font-bold', getScoreColor(overallScore))}>
                {overallScore}/100
              </span>
            </div>
            <div className="flex space-x-2">
              <span className={cn('badge', getScoreBadgeColor(overallScore))}>
                {riskLevel.toUpperCase()} RISK
              </span>
              <span className={cn('badge', getRecommendationColor(recommendation).replace('text-', 'bg-').replace('-600', '-100').replace('-700', '-100') + ' ' + getRecommendationColor(recommendation))}>
                {recommendation.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Analysis */}
      {narrative && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Narrative Analysis</h3>
            </div>
            {narrative.trending && <span className="badge badge-success">TRENDING</span>}
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">{narrative.name}</h4>
              <p className="text-gray-600 text-sm mt-1">{narrative.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="metric-card">
                <p className="text-xs text-gray-600 mb-1">30d Performance</p>
                <p className="font-semibold text-success-600">+{narrative.performance30d.toFixed(1)}%</p>
              </div>
              <div className="metric-card">
                <p className="text-xs text-gray-600 mb-1">Market Cap</p>
                <p className="font-semibold">{formatNumber(narrative.marketCap)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-2">Key Catalysts</p>
              <div className="flex flex-wrap gap-2">
                {narrative.catalysts.map((catalyst, index) => (
                  <span key={index} className="badge badge-primary text-xs">
                    {catalyst}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Metrics */}
      {developerMetrics && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Developer Traction</h3>
            </div>
            <span className={cn('badge', 
              developerMetrics.fullTimeDevs >= 10 && developerMetrics.commitGrowth6m > 25 
                ? 'badge-success' 
                : 'badge-warning'
            )}>
              {developerMetrics.fullTimeDevs >= 10 && developerMetrics.commitGrowth6m > 25 ? 'STRONG' : 'MODERATE'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">Full-time Devs</p>
              <p className="font-semibold text-lg">{developerMetrics.fullTimeDevs}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">Monthly Active</p>
              <p className="font-semibold text-lg">{developerMetrics.monthlyActiveDevs}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">6m Growth</p>
              <p className={cn('font-semibold text-lg', 
                developerMetrics.commitGrowth6m > 25 ? 'text-success-600' : 'text-warning-600'
              )}>
                +{developerMetrics.commitGrowth6m.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GitHub Stars:</span>
              <span className="font-medium">{developerMetrics.githubStars.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Last Commit:</span>
              <span className="font-medium">{new Date(developerMetrics.lastCommit).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tokenomics */}
      {tokenomics && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Tokenomics & Unlocks</h3>
            </div>
            <span className={cn('badge', 
              tokenomics.floatPercentage > 70 && new Date(tokenomics.nextUnlockDate) > new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
                ? 'badge-success' 
                : 'badge-warning'
            )}>
              {tokenomics.floatPercentage > 70 ? 'HEALTHY' : 'RISKY'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">Float Percentage</p>
              <p className="font-semibold text-lg">{tokenomics.floatPercentage.toFixed(1)}%</p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">Next Unlock</p>
              <p className="font-semibold text-lg">{tokenomics.nextUnlockPercentage.toFixed(1)}%</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Next Unlock Date</span>
              </div>
              <span className="font-medium">{new Date(tokenomics.nextUnlockDate).toLocaleDateString()}</span>
            </div>
            {tokenomics.hasEmissionSink && (
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-600" />
                  <span className="text-sm text-success-700">Has Emission Sink</span>
                </div>
                <span className="text-sm font-medium text-success-700">
                  {tokenomics.stakingApr > 0 && `${tokenomics.stakingApr}% APR`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Money Flows */}
      {smartMoney && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Smart Money Flows</h3>
            </div>
            <span className={cn('badge', 
              smartMoney.netInflow24h > 300000 ? 'badge-success' : 'badge-warning'
            )}>
              SCORE: {smartMoney.smartMoneyScore}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">24h Net Inflow</p>
              <p className={cn('font-semibold text-lg', 
                smartMoney.netInflow24h > 0 ? 'text-success-600' : 'text-danger-600'
              )}>
                {formatNumber(smartMoney.netInflow24h)}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">Whale Count</p>
              <p className="font-semibold text-lg">{smartMoney.whaleCount}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Holding Time:</span>
              <span className="font-medium">{smartMoney.averageHoldingTime} days</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Top Wallet Concentration:</span>
              <span className="font-medium">{smartMoney.topWalletConcentration.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Analysis */}
      {sentiment && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
            </div>
            <span className={cn('badge', 
              sentiment.engagementPercentile >= 60 && sentiment.engagementPercentile <= 80 && sentiment.botScore < 10
                ? 'badge-success' 
                : 'badge-warning'
            )}>
              {sentiment.engagementPercentile}th PERCENTILE
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">Social Score</p>
              <p className="font-semibold text-lg">{sentiment.socialScore}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">Bot Score</p>
              <p className={cn('font-semibold text-lg', 
                sentiment.botScore < 10 ? 'text-success-600' : 'text-danger-600'
              )}>
                {sentiment.botScore}%
              </p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">Sentiment</p>
              <p className={cn('font-semibold text-lg', 
                sentiment.sentimentScore > 0.6 ? 'text-success-600' : 
                sentiment.sentimentScore > 0.4 ? 'text-warning-600' : 'text-danger-600'
              )}>
                {(sentiment.sentimentScore * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Listing & Liquidity */}
      {listing && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Listing & Liquidity</h3>
            </div>
            <span className={cn('badge', 
              listing.liquidityScore > 80 ? 'badge-success' : 'badge-warning'
            )}>
              LIQUIDITY: {listing.liquidityScore}
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-2">Current Exchanges</p>
              <div className="flex flex-wrap gap-2">
                {listing.exchanges.map((exchange, index) => (
                  <span key={index} className={cn('badge', 
                    listing.tier1Exchanges.includes(exchange) ? 'badge-success' : 'badge-primary'
                  )}>
                    {exchange}
                  </span>
                ))}
              </div>
            </div>
            {listing.listingRumors && listing.expectedListings.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">Expected Listings</p>
                <div className="flex flex-wrap gap-2">
                  {listing.expectedListings.map((exchange, index) => (
                    <span key={index} className="badge badge-warning">
                      {exchange} (Rumored)
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average Spread:</span>
              <span className="font-medium">{listing.avgSpread.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Technical Analysis */}
      {technical && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Technical Analysis</h3>
            </div>
            <span className={cn('badge', 
              technical.trend === 'bullish' ? 'badge-success' : 
              technical.trend === 'bearish' ? 'badge-danger' : 'badge-warning'
            )}>
              {technical.trend.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">Support</p>
              <p className="font-semibold text-lg">${technical.support.toFixed(2)}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-gray-600 mb-1">Resistance</p>
              <p className="font-semibold text-lg">${technical.resistance.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Accumulation Range</p>
              <p className="font-medium">
                ${technical.accumulationRange.low.toFixed(2)} - ${technical.accumulationRange.high.toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">RSI</p>
                <p className={cn('font-semibold', 
                  technical.rsi > 70 ? 'text-danger-600' : 
                  technical.rsi < 30 ? 'text-success-600' : 'text-gray-900'
                )}>
                  {technical.rsi}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">MACD</p>
                <p className={cn('font-semibold', 
                  technical.macd > 0 ? 'text-success-600' : 'text-danger-600'
                )}>
                  {technical.macd.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Breakout %</p>
                <p className="font-semibold">{technical.breakoutProbability}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Recommended Actions</h3>
          </div>
        </div>
        <div className="space-y-3">
          {recommendation === 'strong_buy' && (
            <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
              <h4 className="font-medium text-success-800 mb-2">Strong Buy Signal</h4>
              <ul className="text-sm text-success-700 space-y-1">
                <li>• All key metrics align positively</li>
                <li>• Consider ladder buying in accumulation range</li>
                <li>• Set stop loss below support level</li>
                <li>• Target 3x risk/reward ratio</li>
              </ul>
            </div>
          )}
          {recommendation === 'buy' && (
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <h4 className="font-medium text-primary-800 mb-2">Buy Signal</h4>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>• Most metrics are favorable</li>
                <li>• Consider smaller position size</li>
                <li>• Monitor smart money flows closely</li>
                <li>• Watch for narrative developments</li>
              </ul>
            </div>
          )}
          {recommendation === 'hold' && (
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <h4 className="font-medium text-warning-800 mb-2">Hold/Wait</h4>
              <ul className="text-sm text-warning-700 space-y-1">
                <li>• Mixed signals across metrics</li>
                <li>• Wait for clearer confirmation</li>
                <li>• Monitor unlock schedule</li>
                <li>• Track developer activity</li>
              </ul>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium mb-1">Risk Management:</p>
            <p>• Never risk more than 1% of portfolio on micro-caps</p>
            <p>• Use proper position sizing and stop losses</p>
            <p>• Self-custody tokens held longer than 1 week</p>
          </div>
        </div>
      </div>
    </div>
  );
}