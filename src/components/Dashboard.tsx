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
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="glass-card shadow-2xl border-b border-white/10 sticky top-0 z-50" style={{ borderRadius: 0 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl animate-glow">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Crypto Analysis Pro
                </h1>
                <p className="text-sm text-gray-300 font-medium">Professional Token Discovery Framework</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Data freshness indicator */}
              <div className="text-right glass-card px-4 py-3 border border-white/20">
                <p className="text-xs text-gray-300 font-medium">
                  {(trendingLoading || aiLoading || depinLoading) ? 'Updating...' : 'Live Data'}
                </p>
                <div className={cn('w-2 h-2 rounded-full mx-auto mt-1', 
                  (trendingLoading || aiLoading || depinLoading) ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                )} />
              </div>
              <div className="text-right glass-card px-6 py-3 border border-cyan-400/30 neon-border">
                <p className="text-sm text-cyan-300 font-semibold">Market Overview</p>
                <p className="font-bold text-white text-xl">{formatNumber(marketStats.totalMarketCap)}</p>
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
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                Market Overview
              </h2>
              <p className="section-subtitle">Real-time cryptocurrency market statistics and performance metrics</p>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-2">Total Market Cap</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(marketStats.totalMarketCap)}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-cyan-400/30">
                  <TrendingUp className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-2">24h Volume</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(marketStats.totalVolume)}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-green-400/30">
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-2">Avg Performance</p>
                  <p className={cn('text-3xl font-bold', 
                    marketStats.avgPerformance >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {marketStats.avgPerformance >= 0 ? '+' : ''}{marketStats.avgPerformance.toFixed(1)}%
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-yellow-400/30">
                  <Users className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-2">Tokens Tracked</p>
                  <p className="text-3xl font-bold text-white">{marketStats.tokenCount}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-400/30">
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="section-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Analysis Tools</h3>
              <p className="text-gray-300">Choose your analysis approach</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('tokens')}
              className={cn(
                'px-8 py-4 text-sm font-bold rounded-xl transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm',
                activeTab === 'tokens' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg border border-cyan-400/30 neon-border' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10 border border-white/20'
              )}
            >
              <Target className="w-5 h-5" />
              <span>Token Discovery</span>
            </button>
            <button
              onClick={() => setActiveTab('narratives')}
              className={cn(
                'px-8 py-4 text-sm font-bold rounded-xl transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm',
                activeTab === 'narratives' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg border border-orange-400/30' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10 border border-white/20'
              )}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Narrative Radar</span>
            </button>
            <button
              onClick={() => setActiveTab('breakout')}
              className={cn(
                'px-8 py-4 text-sm font-bold rounded-xl transition-all duration-300 flex items-center space-x-3 relative backdrop-blur-sm',
                activeTab === 'breakout' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg border border-purple-400/30' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10 border border-white/20'
              )}
            >
              <Activity className="w-5 h-5" />
              <span>Breakout Radar</span>
              {breakoutCandidates.length > 0 && (
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
                  {breakoutCandidates.length}
                </span>
              )}
            </button>
            {selectedAnalysis && (
              <button
                onClick={() => setActiveTab('analysis')}
                className={cn(
                  'px-8 py-4 text-sm font-bold rounded-xl transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm',
                  activeTab === 'analysis' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border border-green-400/30' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10 border border-white/20'
                )}
              >
                <Users className="w-5 h-5" />
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
                      <Target className="w-8 h-8 text-cyan-400" />
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
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent mx-auto mb-6"></div>
                      <p className="text-white font-bold text-xl">Loading token data...</p>
                      <p className="text-gray-300 text-sm mt-2">Fetching real-time market information</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10">
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
                      <AlertTriangle className="w-20 h-20 text-gray-400 mx-auto mb-8" />
                      <h3 className="text-2xl font-bold text-white mb-4">No tokens found</h3>
                      <p className="text-gray-300 max-w-md mx-auto">Try adjusting your search criteria or filters to discover more opportunities.</p>
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
                      <TrendingUp className="w-8 h-8 text-orange-400" />
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
                      <Users className="w-8 h-8 text-purple-400" />
                      Deep Analysis
                    </h2>
                    <p className="section-subtitle">Comprehensive token analysis with developer metrics, tokenomics, sentiment, and breakout probability</p>
                  </div>
                </div>
                
                {analysisLoading && (
                  <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-subtle">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
                    <p className="text-white font-bold text-xl">Analyzing token data...</p>
                    <p className="text-gray-300 text-sm mt-2">Processing multiple data sources</p>
                  </div>
                )}
                {selectedAnalysis && <AnalysisPanel analysis={selectedAnalysis} />}
                {!selectedAnalysis && !analysisLoading && (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <AlertTriangle className="w-20 h-20 text-gray-400 mx-auto mb-8" />
                    <h3 className="text-2xl font-bold text-white mb-4">No analysis available</h3>
                    <p className="text-gray-300 max-w-md mx-auto">Select a token from the discovery section to view detailed analysis.</p>
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
                  <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                    <Calendar className="w-7 h-7 text-cyan-400" />
                    <span>Weekly Workflow</span>
                  </h3>
                  <p className="text-gray-300 text-sm mt-2">Professional 2-hour weekly routine</p>
                </div>
              </div>
              <div className="space-y-5">
                {weeklyWorkflow.map((item, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-sm",
                      item.status === 'completed' ? 'bg-green-500/10 border-green-400/30' :
                      item.status === 'current' ? 'bg-cyan-500/10 border-cyan-400/30 animate-glow' :
                      'bg-white/5 border-white/10'
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
                        "w-12 h-12 rounded-xl flex items-center justify-center border",
                        item.status === 'completed' ? 'bg-green-500/20 border-green-400/30' :
                        item.status === 'current' ? 'bg-cyan-500/20 border-cyan-400/30' :
                        'bg-white/10 border-white/20'
                      )}>
                        <span className={cn(
                          "text-sm font-bold",
                          item.status === 'completed' ? 'text-green-300' :
                          item.status === 'current' ? 'text-cyan-300' :
                          'text-gray-300'
                        )}>{item.day}</span>
                      </div>
                      <div>
                        <span className={cn(
                          "text-base font-semibold",
                          item.status === 'current' ? 'text-cyan-200' : 'text-white'
                        )}>{item.task}</span>
                        <p className={cn(
                          "text-xs",
                          item.status === 'current' ? 'text-cyan-300' : 'text-gray-400'
                        )}>{item.description}</p>
                      </div>
                    </div>
                    <div className={cn('w-4 h-4 rounded-full shadow-lg', 
                      item.status === 'completed' ? 'bg-green-400' : 
                      item.status === 'current' ? 'bg-cyan-400 animate-pulse' :
                      'bg-gray-500'
                    )} />
                  </div>
                ))}
                <div className="mt-6 p-4 bg-cyan-500/10 rounded-xl border border-cyan-400/30">
                  <p className="text-sm text-cyan-300 font-semibold mb-2">
                    Total time: ~2 hours/week • Today is {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                  <p className="text-xs text-cyan-200">
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
                  <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                    <AlertTriangle className="w-7 h-7 text-yellow-400" />
                    <span>Risk Controls</span>
                  </h3>
                  <p className="text-gray-300 text-sm mt-2">Non-negotiable position limits</p>
                </div>
              </div>
              <div className="space-y-5">
                <div className="p-5 bg-yellow-500/10 rounded-2xl border border-yellow-400/30">
                  <p className="font-bold text-yellow-300 mb-2">Portfolio Sizing</p>
                  <p className="text-yellow-200 text-sm">Max 1% per micro-cap position</p>
                </div>
                <div className="p-5 bg-red-500/10 rounded-2xl border border-red-400/30">
                  <p className="font-bold text-red-300 mb-2">Leverage Policy</p>
                  <p className="text-red-200 text-sm">No leverage on small caps</p>
                </div>
                <div className="p-5 bg-cyan-500/10 rounded-2xl border border-cyan-400/30">
                  <p className="font-bold text-cyan-300 mb-2">Custody Rule</p>
                  <p className="text-cyan-200 text-sm">Self-custody if held {'>'} 1 week</p>
                </div>
                <div className="p-5 bg-green-500/10 rounded-2xl border border-green-400/30">
                  <p className="font-bold text-green-300 mb-2">Sweet Spot</p>
                  <p className="text-green-200 text-sm">60-80th percentile engagement</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {selectedAnalysis && (
              <div className="section-card">
                <div className="section-header">
                  <div>
                    <h3 className="text-xl font-bold text-white">Quick Analysis</h3>
                    <p className="text-gray-300 text-sm mt-2">Key metrics at a glance</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-gray-300">Overall Score</span>
                    <span className={cn('font-bold text-lg', 
                      selectedAnalysis.overallScore >= 70 ? 'text-green-400' : 
                      selectedAnalysis.overallScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                    )}>
                      {selectedAnalysis.overallScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-gray-300">Risk Level</span>
                    <span className={cn('font-bold capitalize', 
                      selectedAnalysis.riskLevel === 'low' ? 'text-green-400' : 
                      selectedAnalysis.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    )}>
                      {selectedAnalysis.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-gray-300">Recommendation</span>
                    <span className={cn('font-bold capitalize', 
                      selectedAnalysis.recommendation.includes('buy') ? 'text-green-400' : 
                      selectedAnalysis.recommendation === 'hold' ? 'text-yellow-400' : 'text-red-400'
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