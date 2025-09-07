import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
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
  Target,
  Zap,
  Activity
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { formatNumber, formatPercentage, getScoreColor, getScoreBadgeColor, getRiskColor, getRecommendationColor, cn } from '../utils';

// Generate mock price history for charts
const generatePriceHistory = (token: any, days: number = 30) => {
  const data = [];
  let price = token.price * 0.8; // Start 20% lower
  const volatility = 0.05; // 5% daily volatility
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility;
    price = price * (1 + change);
    
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: price,
      volume: Math.random() * token.volume24h * 2 + token.volume24h * 0.5,
      high: price * (1 + Math.random() * 0.05),
      low: price * (1 - Math.random() * 0.05)
    });
  }
  
  // Ensure last price matches current price
  data[data.length - 1].price = token.price;
  data[data.length - 1].volume = token.volume24h;
  
  return data;
};

interface AnalysisPanelProps {
  analysis: AnalysisResult;
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const { token, narrative, developerMetrics, tokenomics, smartMoney, sentiment, listing, technical, overallScore, riskLevel, recommendation, breakoutProbability, breakoutSignals } = analysis;

  const priceHistory = generatePriceHistory(token, 30);
  const ScoreIcon = overallScore >= 70 ? CheckCircle : overallScore >= 40 ? AlertTriangle : XCircle;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-cyan-400/30">
          <p className="text-sm text-cyan-300 mb-1">{label}</p>
          <p className="font-bold text-lg text-white">
            ${payload[0].value.toFixed(4)}
          </p>
          {payload[1] && (
            <p className="text-sm text-gray-300">
              Volume: {formatNumber(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
              {token.symbol.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{token.name}</h2>
              <p className="text-gray-300 text-lg">{token.symbol} • ${token.price.toFixed(4)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <ScoreIcon className={cn('w-6 h-6', getScoreColor(overallScore))} />
              <span className={cn('text-3xl font-bold text-white')}>
                {overallScore}/100
              </span>
            </div>
            <div className="flex space-x-2">
              <span className="badge-success">
                {riskLevel.toUpperCase()} RISK
              </span>
              <span className="badge-primary">
                {recommendation.replace('_', ' ').toUpperCase()}
              </span>
              <span className={cn('badge', 
                breakoutProbability >= 80 ? 'bg-success-100 text-success-800' :
                breakoutProbability >= 65 ? 'bg-warning-100 text-warning-800' :
                'bg-primary-100 text-primary-800'
              )}>
                <Zap className="w-3 h-3 mr-1" />
                {breakoutProbability}% BREAKOUT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Price Chart</h3>
            <p className="text-gray-300">30-day price movement with volume</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Current Price</p>
              <p className="text-2xl font-bold text-white">${token.price.toFixed(4)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">24h Change</p>
              <p className={cn('text-xl font-bold', 
                token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {formatPercentage(token.priceChange24h)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="h-[400px] bg-black/20 rounded-2xl p-6 border border-white/10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value) => `$${value.toFixed(3)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#06b6d4"
                strokeWidth={3}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Narrative Analysis */}
      {narrative && (
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Narrative Analysis</h3>
            </div>
            {narrative.trending && <span className="badge-success">🔥 TRENDING</span>}
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-white text-lg">{narrative.name}</h4>
              <p className="text-gray-300 mt-2">{narrative.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">30d Performance</p>
                <p className="font-bold text-green-400 text-xl">+{narrative.performance30d.toFixed(1)}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Market Cap</p>
                <p className="font-bold text-white text-xl">{formatNumber(narrative.marketCap)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-3 font-semibold">Key Catalysts</p>
              <div className="flex flex-wrap gap-2">
                {narrative.catalysts.map((catalyst, index) => (
                  <span key={index} className="badge-primary">
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
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Code className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Developer Traction</h3>
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
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Full-time Devs</p>
              <p className="font-bold text-white text-2xl">{developerMetrics.fullTimeDevs}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Monthly Active</p>
              <p className="font-bold text-white text-2xl">{developerMetrics.monthlyActiveDevs}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">6m Growth</p>
              <p className={cn('font-bold text-2xl', 
                developerMetrics.commitGrowth6m > 25 ? 'text-green-400' : 'text-yellow-400'
              )}>
                +{developerMetrics.commitGrowth6m.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex justify-between">
              <span className="text-gray-400">GitHub Stars:</span>
              <span className="font-bold text-white">{developerMetrics.githubStars.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-400">Last Commit:</span>
              <span className="font-bold text-white">{new Date(developerMetrics.lastCommit).toLocaleDateString()}</span>
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
              sentiment.engagementPercentile >= 60 && sentiment.engagementPercentile <= 80 && sentiment.botScore < 15
                ? 'badge-success' 
                : 'badge-warning'
            )}>
              {sentiment.engagementPercentile >= 60 && sentiment.engagementPercentile <= 80 ? 'SWEET SPOT' : `${sentiment.engagementPercentile}th PERCENTILE`}
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
                sentiment.botScore < 15 ? 'text-success-600' : 'text-danger-600'
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
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Sweet Spot Analysis:</strong> {' '}
              {sentiment.engagementPercentile >= 60 && sentiment.engagementPercentile <= 80 && sentiment.botScore < 15
                ? "Perfect engagement range - high interest without excessive hype or bot manipulation"
                : sentiment.engagementPercentile > 80 
                ? "High engagement - monitor for excessive hype and potential top signals"
                : sentiment.botScore >= 15
                ? "High bot activity detected - be cautious of artificial engagement"
                : "Low engagement - early stage or lacking momentum"}
            </p>
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

      {/* Breakout Analysis */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold">Breakout Analysis</h3>
          </div>
          <span className={cn('badge', 
            breakoutProbability >= 80 ? 'badge-success' :
            breakoutProbability >= 65 ? 'badge-warning' :
            'badge-primary'
          )}>
            {breakoutProbability}% PROBABILITY
          </span>
        </div>
        <div className="space-y-3">
          {breakoutSignals.map((signal, index) => {
            const getSignalIcon = () => {
              switch (signal.type) {
                case 'volume': return Activity;
                case 'price': return TrendingUp;
                case 'development': return Code;
                case 'narrative': return MessageSquare;
                case 'smart_money': return Target;
                case 'technical': return BarChart3;
                default: return Activity;
              }
            };
            
            const SignalIcon = getSignalIcon();
            
            return (
              <div 
                key={index}
                className={cn('flex items-center p-3 rounded-lg', 
                  signal.strength === 'strong' ? 'bg-success-50 border border-success-200' :
                  signal.strength === 'moderate' ? 'bg-warning-50 border border-warning-200' :
                  'bg-gray-50 border border-gray-200'
                )}
              >
                <SignalIcon className={cn('w-5 h-5 mr-3', 
                  signal.strength === 'strong' ? 'text-success-600' :
                  signal.strength === 'moderate' ? 'text-warning-600' :
                  'text-gray-600'
                )} />
                <div className="flex-1">
                  <p className={cn('font-medium', 
                    signal.strength === 'strong' ? 'text-success-800' :
                    signal.strength === 'moderate' ? 'text-warning-800' :
                    'text-gray-800'
                  )}>
                    {signal.description}
                  </p>
                </div>
                <span className={cn('badge text-xs', 
                  signal.strength === 'strong' ? 'badge-success' :
                  signal.strength === 'moderate' ? 'badge-warning' :
                  'bg-gray-100 text-gray-800'
                )}>
                  {signal.strength.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Breakout Interpretation:</strong> {' '}
            {breakoutProbability >= 80 && "Very high probability - multiple strong signals align for potential breakout"}
            {breakoutProbability >= 65 && breakoutProbability < 80 && "High probability - several positive indicators suggest breakout potential"}
            {breakoutProbability >= 50 && breakoutProbability < 65 && "Moderate probability - mixed signals, monitor closely for confirmation"}
            {breakoutProbability < 50 && "Lower probability - limited breakout signals, consider waiting for better setup"}
          </p>
        </div>
      </div>

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
                <li>• Ladder buy in accumulation range (DCA approach)</li>
                <li>• Set stop loss below support level</li>
                <li>• Target 3-5x risk/reward ratio</li>
                <li>• Max 1% of portfolio allocation</li>
              </ul>
            </div>
          )}
          {recommendation === 'buy' && (
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <h4 className="font-medium text-primary-800 mb-2">Buy Signal</h4>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>• Most metrics are favorable</li>
                <li>• Start with 0.5% position size</li>
                <li>• Monitor smart money flows closely</li>
                <li>• Watch for narrative developments</li>
                <li>• Set alerts for volume spikes</li>
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
                <li>• Watch for narrative catalysts</li>
              </ul>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium mb-1">Risk Management:</p>
            <p>• Never risk more than 1% of portfolio per micro-cap</p>
            <p>• Use proper position sizing and stop losses</p>
            <p>• Self-custody tokens held longer than 1 week</p>
            <p>• Focus on 60-80th percentile engagement sweet spot</p>
          </div>
        </div>
      </div>
    </div>
  );
}