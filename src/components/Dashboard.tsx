import React, { useState, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Activity, TrendingUp, Users, Calendar, Target, AlertTriangle } from 'lucide-react';
import { TokenCard } from './TokenCard';
import { TokenDetailPage } from './TokenDetailPage';
import { AnalysisPanel } from './AnalysisPanel';
import { NarrativeCard } from './NarrativeCard';
import { BreakoutRadar } from './BreakoutRadar';
import { SearchBar, SearchFilters } from './SearchBar';
import { useTokenData, useTrendingTokens, useTokensByCategory, useTokenAnalysis, useGlobalMarketData } from '../hooks/useTokenData';
import { identifyBreakoutCandidates } from '../services/breakoutAnalysis';
import { AnalysisResult, Token } from '../types';
import { formatNumber, cn } from '../utils';

export function Dashboard() {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [selectedNarrative, setSelectedNarrative] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    minMarketCap: 0,
    maxMarketCap: 0,
    minVolume: 0,
    narrativeFilter: '',
    riskLevel: ''
  });
  const [activeTab, setActiveTab] = useState<'tokens' | 'narratives' | 'breakout' | 'analysis'>('tokens');
  const [breakoutCandidates, setBreakoutCandidates] = useState<AnalysisResult[]>([]);
  const [showTokenDetail, setShowTokenDetail] = useState(false);
  const [weeklyWorkflow, setWeeklyWorkflow] = useState([
    { day: 'Mon', task: 'Parse funding rounds', status: getCurrentDayStatus('Mon'), description: 'Scan for new funding announcements' },
    { day: 'Tue', task: 'Dev commit analysis', status: getCurrentDayStatus('Tue'), description: 'Check GitHub activity metrics' },
    { day: 'Wed', task: 'Token unlock scan', status: getCurrentDayStatus('Wed'), description: 'Review upcoming unlock schedules' },
    { day: 'Thu', task: 'Smart money flows', status: getCurrentDayStatus('Thu'), description: 'Analyze whale wallet movements' },
    { day: 'Fri', task: 'Sentiment update', status: getCurrentDayStatus('Fri'), description: 'Social media sentiment analysis' }
  ]);

  // Helper function to determine task status based on current day
  function getCurrentDayStatus(taskDay: string): 'completed' | 'pending' | 'current' {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const todayIndex = dayOrder.indexOf(today);
    const taskIndex = dayOrder.indexOf(taskDay);
    
    if (todayIndex === -1) return 'pending'; // Weekend - all pending
    if (taskIndex < todayIndex) return 'completed';
    if (taskIndex === todayIndex) return 'current';
    return 'pending';
  }

  // Fetch real data
  const { data: trendingTokens = [], isLoading: trendingLoading } = useTrendingTokens();
  const { data: aiTokens = [], isLoading: aiLoading } = useTokensByCategory('artificial-intelligence');
  const { data: depinTokens = [], isLoading: depinLoading } = useTokensByCategory('infrastructure');
  const { data: selectedAnalysis, isLoading: analysisLoading } = useTokenAnalysis(selectedToken || '');
  const { data: globalData } = useGlobalMarketData();

  // Combine all tokens for display
  const allTokens = useMemo(() => {
    const combined = [...trendingTokens, ...aiTokens, ...depinTokens];
    // Remove duplicates by id
    const unique = combined.filter((token, index, self) => 
      index === self.findIndex(t => t.id === token.id)
    );
    return unique;
  }, [trendingTokens, aiTokens, depinTokens]);

  // Fetch analyses for breakout detection using useQueries
  const tokenAnalysisQueries = useQueries({
    queries: allTokens.slice(0, 5).map(token => ({
      queryKey: ['tokenAnalysis', token.id],
      queryFn: () => performTokenAnalysis(token.id),
      staleTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!token.id
    }))
  });

  // Update breakout candidates when analyses are loaded
  React.useEffect(() => {
    const completedAnalyses = tokenAnalysisQueries
      .filter(query => query.isFetched && query.data)
      .map(query => query.data!)
      .filter((analysis): analysis is AnalysisResult => analysis !== null && analysis !== undefined);
    
    if (completedAnalyses.length > 0) {
      const candidates = identifyBreakoutCandidates(allTokens, completedAnalyses);
      setBreakoutCandidates(candidates);
    }
  }, [tokenAnalysisQueries.map(q => q.isFetched ? q.data?.token.id : '').join(','), allTokens]);

  const filteredTokens = useMemo(() => {
    return allTokens.filter(token => {
      const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMarketCap = filters.minMarketCap === 0 || token.marketCap >= filters.minMarketCap;
      const matchesVolume = filters.minVolume === 0 || token.volume24h >= filters.minVolume;
      
      return matchesSearch && matchesMarketCap && matchesVolume;
    });
  }, [allTokens, searchQuery, filters]);

  const marketStats = useMemo(() => {
    if (globalData?.data) {
      return {
        totalMarketCap: globalData.data.total_market_cap?.usd || 0,
        totalVolume: globalData.data.total_volume?.usd || 0,
        avgPerformance: globalData.data.market_cap_change_percentage_24h_usd || 0,
        tokenCount: allTokens.length
      };
    }
    
    const totalMarketCap = allTokens.reduce((sum, token) => sum + token.marketCap, 0);
    const totalVolume = allTokens.reduce((sum, token) => sum + token.volume24h, 0);
    const avgPerformance = allTokens.length > 0 
      ? allTokens.reduce((sum, token) => sum + token.priceChange24h, 0) / allTokens.length 
      : 0;
    
    return {
      totalMarketCap,
      totalVolume,
      avgPerformance,
      tokenCount: allTokens.length
    };
  }, [allTokens, globalData]);

  // Mock narratives for now - would be calculated from real data
  const mockNarratives = [
    {
      id: 'ai-narrative',
      name: 'AI & Machine Learning',
      description: 'Tokens powering AI infrastructure, GPU sharing, and autonomous agents',
      tokens: aiTokens.map(t => t.id),
      performance30d: aiTokens.length > 0 ? aiTokens.reduce((sum, t) => sum + t.priceChange30d, 0) / aiTokens.length : 0,
      marketCap: aiTokens.reduce((sum, t) => sum + t.marketCap, 0),
      trending: true,
      catalysts: ['ChatGPT adoption', 'GPU shortage', 'AI agent development', 'Enterprise AI adoption']
    },
    {
      id: 'depin-narrative',
      name: 'DePIN (Decentralized Physical Infrastructure)',
      description: 'Decentralized networks for physical infrastructure and IoT',
      tokens: depinTokens.map(t => t.id),
      performance30d: depinTokens.length > 0 ? depinTokens.reduce((sum, t) => sum + t.priceChange30d, 0) / depinTokens.length : 0,
      marketCap: depinTokens.reduce((sum, t) => sum + t.marketCap, 0),
      trending: true,
      catalysts: ['5G rollout', 'IoT expansion', 'Data storage demand']
    }
  ];

  // If showing token detail, render that instead
  if (showTokenDetail && selectedToken) {
    const token = allTokens.find(t => t.id === selectedToken);
    if (token) {
      return (
        <TokenDetailPage 
          token={token}
          analysis={selectedAnalysis}
          onBack={() => setShowTokenDetail(false)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-subtle sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Crypto Analysis Pro
                </h1>
                <p className="text-sm text-gray-600 font-medium">Professional Token Discovery Framework</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Data freshness indicator */}
              <div className="text-right bg-gray-50/80 rounded-lg px-3 py-2 border border-subtle">
                <p className="text-xs text-gray-600 font-medium">
                  {(trendingLoading || aiLoading || depinLoading) ? 'Updating...' : 'Live Data'}
                </p>
                <div className={cn('w-2 h-2 rounded-full mx-auto mt-1', 
                  (trendingLoading || aiLoading || depinLoading) ? 'bg-warning-500 animate-pulse' : 'bg-success-500'
                )} />
              </div>
              <div className="text-right bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg px-4 py-2 border border-primary-subtle">
                <p className="text-sm text-primary-700 font-semibold">Market Overview</p>
                <p className="font-bold text-primary-900 text-lg">{formatNumber(marketStats.totalMarketCap)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="section-card mb-12">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <TrendingUp className="w-8 h-8 text-primary-600" />
                Market Overview
              </h2>
              <p className="section-subtitle">Real-time cryptocurrency market statistics and performance metrics</p>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="metric-card group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Total Market Cap</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(marketStats.totalMarketCap)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
            
            <div className="metric-card group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">24h Volume</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(marketStats.totalVolume)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-success-100 to-success-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </div>
            
            <div className="metric-card group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Avg Performance</p>
                  <p className={cn('text-2xl font-bold', 
                    marketStats.avgPerformance >= 0 ? 'text-success-600' : 'text-danger-600'
                  )}>
                    {marketStats.avgPerformance >= 0 ? '+' : ''}{marketStats.avgPerformance.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-warning-100 to-warning-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-warning-600" />
                </div>
              </div>
            </div>
            
            <div className="metric-card group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Tokens Tracked</p>
                  <p className="text-2xl font-bold text-gray-900">{marketStats.tokenCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-danger-100 to-danger-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-danger-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="section-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Analysis Tools</h3>
              <p className="text-gray-600">Choose your analysis approach</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-gray-100/80 p-2 rounded-xl border border-gray-200/60">
            <button
              onClick={() => setActiveTab('tokens')}
              className={cn(
                'px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2',
                activeTab === 'tokens' 
                  ? 'bg-white text-primary-600 shadow-md border border-primary-subtle' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              )}
            >
              <Target className="w-4 h-4" />
              <span>Token Discovery</span>
            </button>
            <button
              onClick={() => setActiveTab('narratives')}
              className={cn(
                'px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2',
                activeTab === 'narratives' 
                  ? 'bg-white text-primary-600 shadow-md border border-primary-subtle' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              )}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Narrative Radar</span>
            </button>
            <button
              onClick={() => setActiveTab('breakout')}
              className={cn(
                'px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2 relative',
                activeTab === 'breakout' 
                  ? 'bg-white text-primary-600 shadow-md border border-primary-subtle' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              )}
            >
              <Activity className="w-4 h-4" />
              <span>Breakout Radar</span>
              {breakoutCandidates.length > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  {breakoutCandidates.length}
                </span>
              )}
            </button>
            {selectedAnalysis && (
              <button
                onClick={() => setActiveTab('analysis')}
                className={cn(
                  'px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2',
                  activeTab === 'analysis' 
                    ? 'bg-white text-primary-600 shadow-md border border-primary-subtle' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                )}
              >
                <Users className="w-4 h-4" />
                <span>Deep Analysis</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 content-section">
            {activeTab === 'tokens' && (
              <div className="section-card">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">
                      <Target className="w-8 h-8 text-primary-600" />
                      Token Discovery
                    </h2>
                    <p className="section-subtitle">Discover and analyze promising cryptocurrency tokens with advanced filtering and search capabilities</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <SearchBar 
                    onSearch={setSearchQuery} 
                    onFilterChange={setFilters}
                    onTokenSelect={(tokenId) => {
                      setSelectedToken(tokenId);
                      setActiveTab('analysis');
                    }}
                  />
                  
                  {(trendingLoading || aiLoading || depinLoading) && (
                    <div className="text-center py-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-subtle">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-primary-700 font-semibold">Loading token data...</p>
                      <p className="text-primary-600 text-sm mt-1">Fetching real-time market information</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTokens.map(token => (
                      <TokenCard
                        key={token.id}
                        token={token}
                        onAnalyze={() => {
                          setSelectedToken(token.id);
                          setActiveTab('analysis');
                        }}
                        onViewDetail={() => {
                          setSelectedToken(token.id);
                          setShowTokenDetail(true);
                        }}
                        isSelected={selectedToken === token.id}
                      />
                    ))}
                  </div>
                  
                  {filteredTokens.length === 0 && !trendingLoading && !aiLoading && !depinLoading && (
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                      <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-xl font-bold text-gray-900 mb-3">No tokens found</h3>
                      <p className="text-gray-600 max-w-md mx-auto">Try adjusting your search criteria or filters to discover more opportunities.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'narratives' && (
              <div className="section-card">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                      Narrative Radar
                    </h2>
                    <p className="section-subtitle">Track emerging themes and sectors driving the next wave of crypto adoption and investment opportunities</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {mockNarratives.map(narrative => (
                    <NarrativeCard
                      key={narrative.id}
                      narrative={narrative}
                      onClick={() => setSelectedNarrative(narrative.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'breakout' && (
              <div className="section-card">
                <BreakoutRadar 
                  candidates={breakoutCandidates}
                  onTokenSelect={(tokenId) => {
                    setSelectedToken(tokenId);
                    setShowTokenDetail(true);
                  }}
                />
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="section-card">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">
                      <Users className="w-8 h-8 text-purple-600" />
                      Deep Analysis
                    </h2>
                    <p className="section-subtitle">Comprehensive token analysis with developer metrics, tokenomics, sentiment, and breakout probability</p>
                  </div>
                </div>
                
                {analysisLoading && (
                  <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-subtle">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-purple-700 font-semibold">Analyzing token data...</p>
                    <p className="text-purple-600 text-sm mt-1">Processing multiple data sources</p>
                  </div>
                )}
                {selectedAnalysis && <AnalysisPanel analysis={selectedAnalysis} />}
                {!selectedAnalysis && !analysisLoading && (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No analysis available</h3>
                    <p className="text-gray-600 max-w-md mx-auto">Select a token from the discovery section to view detailed analysis.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Weekly Workflow */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <Calendar className="w-6 h-6 text-primary-600" />
                    <span>Weekly Workflow</span>
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Professional 2-hour weekly routine</p>
                </div>
              </div>
              <div className="space-y-4">
                {weeklyWorkflow.map((item, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all duration-200 cursor-pointer",
                      item.status === 'completed' ? 'bg-gradient-to-r from-success-50 to-success-100 border-success-subtle' :
                      item.status === 'current' ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-subtle' :
                      'bg-gradient-to-r from-gray-50 to-gray-100 border-subtle'
                    )}
                    onClick={() => {
                      const updated = [...weeklyWorkflow];
                      if (updated[index].status !== 'current') {
                        updated[index].status = updated[index].status === 'completed' ? 'pending' : 'completed';
                      }
                      setWeeklyWorkflow(updated);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        item.status === 'completed' ? 'bg-gradient-to-br from-success-100 to-success-200' :
                        item.status === 'current' ? 'bg-gradient-to-br from-primary-100 to-primary-200' :
                        'bg-gradient-to-br from-gray-100 to-gray-200'
                      )}>
                        <span className={cn(
                          "text-xs font-bold",
                          item.status === 'completed' ? 'text-success-700' :
                          item.status === 'current' ? 'text-primary-700' :
                          'text-gray-700'
                        )}>{item.day}</span>
                      </div>
                      <div>
                        <span className={cn(
                          "text-sm font-medium",
                          item.status === 'current' ? 'text-primary-800' : 'text-gray-700'
                        )}>{item.task}</span>
                        <p className={cn(
                          "text-xs",
                          item.status === 'current' ? 'text-primary-600' : 'text-gray-500'
                        )}>{item.description}</p>
                      </div>
                    </div>
                    <div className={cn('w-3 h-3 rounded-full shadow-sm', 
                      item.status === 'completed' ? 'bg-success-500' : 
                      item.status === 'current' ? 'bg-primary-500 animate-pulse' :
                      'bg-gray-300'
                    )} />
                  </div>
                ))}
                <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-subtle">
                  <p className="text-xs text-primary-700 font-medium mb-1">
                    Total time: ~2 hours/week • Today is {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                  <p className="text-xs text-primary-600">
                    {new Date().getDay() === 0 || new Date().getDay() === 6 
                      ? "Weekend - No tasks scheduled. Enjoy your break!" 
                      : "Focus on micro-caps with volume • Sweet spot: 60-80th percentile engagement"}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Controls */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <AlertTriangle className="w-6 h-6 text-warning-600" />
                    <span>Risk Controls</span>
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Non-negotiable position limits</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-warning-50 to-warning-100 rounded-xl border border-warning-subtle">
                  <p className="font-semibold text-warning-800 mb-1">Portfolio Sizing</p>
                  <p className="text-warning-700 text-sm">Max 1% per micro-cap position</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-danger-50 to-danger-100 rounded-xl border border-danger-subtle">
                  <p className="font-semibold text-danger-800 mb-1">Leverage Policy</p>
                  <p className="text-danger-700 text-sm">No leverage on small caps</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-subtle">
                  <p className="font-semibold text-primary-800 mb-1">Custody Rule</p>
                  <p className="text-primary-700 text-sm">Self-custody if held {'>'}1 week</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border border-success-subtle">
                  <p className="font-semibold text-success-800 mb-1">Sweet Spot</p>
                  <p className="text-success-700 text-sm">60-80th percentile engagement</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {selectedAnalysis && (
              <div className="section-card">
                <div className="section-header">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Quick Analysis</h3>
                    <p className="text-gray-600 text-sm mt-1">Key metrics at a glance</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-subtle">
                    <span className="text-sm font-medium text-gray-600">Overall Score</span>
                    <span className={cn('font-bold text-lg', 
                      selectedAnalysis.overallScore >= 70 ? 'text-success-600' : 
                      selectedAnalysis.overallScore >= 40 ? 'text-warning-600' : 'text-danger-600'
                    )}>
                      {selectedAnalysis.overallScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-subtle">
                    <span className="text-sm font-medium text-gray-600">Risk Level</span>
                    <span className={cn('font-bold capitalize', 
                      selectedAnalysis.riskLevel === 'low' ? 'text-success-600' : 
                      selectedAnalysis.riskLevel === 'medium' ? 'text-warning-600' : 'text-danger-600'
                    )}>
                      {selectedAnalysis.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-subtle">
                    <span className="text-sm font-medium text-gray-600">Recommendation</span>
                    <span className={cn('font-bold capitalize', 
                      selectedAnalysis.recommendation.includes('buy') ? 'text-success-600' : 
                      selectedAnalysis.recommendation === 'hold' ? 'text-warning-600' : 'text-danger-600'
                    )}>
                      {selectedAnalysis.recommendation.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}