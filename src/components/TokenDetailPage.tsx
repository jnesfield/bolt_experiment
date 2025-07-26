import React, { useState } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Twitter, 
  Github,
  ExternalLink,
  Star,
  Copy,
  Share2,
  Bookmark,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  Activity,
  Users,
  Code,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { BarChart, Bar, ComposedChart } from 'recharts';
import { Token, AnalysisResult } from '../types';
import { formatNumber, formatPercentage, cn } from '../utils';

interface TokenDetailPageProps {
  token: Token;
  analysis?: AnalysisResult;
  onBack: () => void;
}

// Mock price history data - in real app this would come from API
const generatePriceHistory = (token: Token, days: number = 30) => {
  const data = [];
  let price = token.price * 0.7; // Start 30% lower
  let marketCap = token.marketCap * 0.7;
  const volatility = 0.05; // 5% daily volatility
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility;
    price = price * (1 + change);
    marketCap = marketCap * (1 + change);
    
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: price,
      volume: Math.random() * token.volume24h * 2 + token.volume24h * 0.5,
      marketCap: marketCap,
      high: price * (1 + Math.random() * 0.05),
      low: price * (1 - Math.random() * 0.05),
      open: price * (0.98 + Math.random() * 0.04),
      close: price
    });
  }
  
  // Ensure last price matches current price
  data[data.length - 1].price = token.price;
  data[data.length - 1].marketCap = token.marketCap;
  data[data.length - 1].volume = token.volume24h;
  
  return data;
};

export function TokenDetailPage({ token, analysis, onBack }: TokenDetailPageProps) {
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  const [chartType, setChartType] = useState<'price' | 'volume'>('price');
  
  const priceHistory = generatePriceHistory(token, timeframe === '1D' ? 1 : timeframe === '7D' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '1Y' ? 365 : 730);
  const priceChange = token.priceChange24h;
  const isPositive = priceChange >= 0;
  
  const marketStats = [
    { label: 'Market Cap', value: formatNumber(token.marketCap), change: null },
    { label: 'Volume (24h)', value: formatNumber(token.volume24h), change: null },
    { label: 'Circulating Supply', value: token.circulatingSupply.toLocaleString(), change: null },
    { label: 'Total Supply', value: token.totalSupply.toLocaleString(), change: null },
    { label: 'Fully Diluted Valuation', value: formatNumber(token.fdv), change: null },
    { label: 'Volume/Market Cap', value: `${((token.volume24h / token.marketCap) * 100).toFixed(2)}%`, change: null }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          {chartType === 'price' && (
            <>
              <p className="font-bold text-lg text-gray-900">
                ${payload[0].value.toFixed(4)}
              </p>
              {payload.length > 1 && (
                <p className="text-sm text-gray-600">
                  Volume: {formatNumber(payload[1].value)}
                </p>
              )}
            </>
          )}
          {chartType === 'volume' && (
            <p className="font-bold text-lg text-gray-900">
              {formatNumber(payload[0].value)}
            </p>
          )}
          {chartType === 'marketcap' && (
            <p className="font-bold text-lg text-gray-900">
              {formatNumber(payload[0].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-subtle sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {token.symbol.slice(0, 2)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{token.name}</h1>
                  <p className="text-gray-600 font-medium">{token.symbol}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                <Star className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                <Bookmark className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price Section */}
            <div className="section-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <h2 className="text-4xl font-bold text-gray-900">
                      ${token.price.toFixed(4)}
                    </h2>
                    <div className={cn('flex items-center px-3 py-1 rounded-full text-sm font-semibold',
                      isPositive ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                    )}>
                      {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      {formatPercentage(priceChange)} (24h)
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Last updated: {new Date(token.lastUpdated).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {['1D', '7D', '1M', '3M', '1Y', 'ALL'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimeframe(period as any)}
                      className={cn(
                        'px-3 py-1 text-sm font-medium rounded-lg transition-all duration-200',
                        timeframe === period
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="h-[500px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'price' && (
                    <ComposedChart data={priceHistory}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        yAxisId="price"
                        orientation="left"
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <YAxis 
                        yAxisId="volume"
                        orientation="right"
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        yAxisId="price"
                        type="monotone"
                        dataKey="price"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fill="url(#priceGradient)"
                      />
                      <Bar
                        yAxisId="volume"
                        dataKey="volume"
                        fill="url(#volumeGradient)"
                        opacity={0.6}
                      />
                    </ComposedChart>
                  )}
                  
                  {chartType === 'volume' && (
                    <BarChart data={priceHistory}>
                      <defs>
                        <linearGradient id="volumeBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="volume"
                        fill="url(#volumeBarGradient)"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  )}
                  
                  {chartType === 'marketcap' && (
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient id="marketCapGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="marketCap"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        fill="url(#marketCapGradient)"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Chart Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setChartType('price')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      chartType === 'price'
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    Price
                  </button>
                  <button
                    onClick={() => setChartType('volume')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      chartType === 'volume'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    Volume
                  </button>
                  <button
                    onClick={() => setChartType('marketcap')}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      chartType === 'marketcap'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    Market Cap
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {chartType === 'price' && 'Price with volume overlay'}
                  {chartType === 'volume' && 'Trading volume over time'}
                  {chartType === 'marketcap' && 'Market capitalization trend'}
                </div>
              </div>
            </div>

            {/* Market Stats */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="section-title">
                    <Activity className="w-6 h-6 text-primary-600" />
                    Key Statistics
                  </h3>
                  <p className="section-subtitle">Essential market metrics and performance indicators</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {marketStats.map((stat, index) => (
                  <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 group hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <DollarSign className="w-4 h-4 text-primary-600" />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Additional CoinMarketCap-style stats */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 group hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">All-Time High</p>
                      <p className="text-sm font-bold text-gray-900">${(token.price * 2.5).toFixed(4)}</p>
                      <p className="text-xs text-red-600">-{((1 - token.price / (token.price * 2.5)) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 group hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">All-Time Low</p>
                      <p className="text-sm font-bold text-gray-900">${(token.price * 0.1).toFixed(4)}</p>
                      <p className="text-xs text-green-600">+{((token.price / (token.price * 0.1) - 1) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="section-title">
                    <TrendingUp className="w-6 h-6 text-success-600" />
                    Price Performance
                  </h3>
                  <p className="section-subtitle">Historical price changes across different timeframes</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="metric-card group hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">24h Change</p>
                      <p className={cn('text-2xl font-bold', 
                        token.priceChange24h >= 0 ? 'text-success-600' : 'text-danger-600'
                      )}>
                        {formatPercentage(token.priceChange24h)}
                      </p>
                    </div>
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform',
                      token.priceChange24h >= 0 ? 'bg-gradient-to-br from-success-100 to-success-200' : 'bg-gradient-to-br from-danger-100 to-danger-200'
                    )}>
                      {token.priceChange24h >= 0 ? 
                        <TrendingUp className="w-6 h-6 text-success-600" /> : 
                        <TrendingDown className="w-6 h-6 text-danger-600" />
                      }
                    </div>
                  </div>
                </div>
                
                <div className="metric-card group hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">7d Change</p>
                      <p className={cn('text-2xl font-bold', 
                        token.priceChange7d >= 0 ? 'text-success-600' : 'text-danger-600'
                      )}>
                        {formatPercentage(token.priceChange7d)}
                      </p>
                    </div>
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform',
                      token.priceChange7d >= 0 ? 'bg-gradient-to-br from-success-100 to-success-200' : 'bg-gradient-to-br from-danger-100 to-danger-200'
                    )}>
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                </div>
                
                <div className="metric-card group hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">30d Change</p>
                      <p className={cn('text-2xl font-bold', 
                        token.priceChange30d >= 0 ? 'text-success-600' : 'text-danger-600'
                      )}>
                        {formatPercentage(token.priceChange30d)}
                      </p>
                    </div>
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform',
                      token.priceChange30d >= 0 ? 'bg-gradient-to-br from-success-100 to-success-200' : 'bg-gradient-to-br from-danger-100 to-danger-200'
                    )}>
                      <Activity className="w-6 h-6 text-warning-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Section */}
            {analysis && (
              <div className="section-card">
                <div className="section-header">
                  <div>
                    <h3 className="section-title">
                      <Zap className="w-6 h-6 text-purple-600" />
                      Professional Analysis
                    </h3>
                    <p className="section-subtitle">Comprehensive token analysis and investment insights</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={cn('badge text-sm px-4 py-2', 
                      analysis.overallScore >= 70 ? 'badge-success' : 
                      analysis.overallScore >= 40 ? 'badge-warning' : 'badge-danger'
                    )}>
                      Score: {analysis.overallScore}/100
                    </span>
                    <span className={cn('badge text-sm px-4 py-2 capitalize', 
                      analysis.riskLevel === 'low' ? 'badge-success' : 
                      analysis.riskLevel === 'medium' ? 'badge-warning' : 'badge-danger'
                    )}>
                      {analysis.riskLevel} Risk
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-subtle">
                    <h4 className="font-bold text-primary-900 mb-2">Investment Recommendation</h4>
                    <p className={cn('text-2xl font-bold capitalize mb-2', 
                      analysis.recommendation.includes('buy') ? 'text-success-600' : 
                      analysis.recommendation === 'hold' ? 'text-warning-600' : 'text-danger-600'
                    )}>
                      {analysis.recommendation.replace('_', ' ')}
                    </p>
                    <p className="text-primary-700 text-sm">
                      Based on comprehensive analysis of market data, development activity, and sentiment
                    </p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-warning-subtle">
                    <h4 className="font-bold text-orange-900 mb-2">Breakout Probability</h4>
                    <p className="text-2xl font-bold text-orange-700 mb-2">
                      {analysis.breakoutProbability || 0}%
                    </p>
                    <p className="text-orange-700 text-sm">
                      Likelihood of significant price movement based on technical and fundamental factors
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                  <p className="text-gray-600 text-sm mt-1">Manage your position</p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="btn btn-primary w-full">
                  Add to Watchlist
                </button>
                <button className="btn btn-secondary w-full">
                  Set Price Alert
                </button>
                <button className="btn btn-secondary w-full">
                  Share Analysis
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Official Links</h3>
                  <p className="text-gray-600 text-sm mt-1">Project resources</p>
                </div>
              </div>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-subtle hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Website</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-subtle hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center space-x-3">
                    <Github className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">GitHub</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-subtle hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center space-x-3">
                    <Twitter className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Twitter</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </a>
              </div>
            </div>

            {/* Risk Warning */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-warning-600" />
                    <span>Risk Warning</span>
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-warning-50 to-warning-100 rounded-xl border border-warning-subtle">
                  <p className="text-warning-800 text-sm font-medium">
                    Cryptocurrency investments are highly volatile and risky. Never invest more than you can afford to lose.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-danger-50 to-danger-100 rounded-xl border border-danger-subtle">
                  <p className="text-danger-800 text-sm font-medium">
                    This analysis is for informational purposes only and should not be considered financial advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}