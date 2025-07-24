import React, { useState, useMemo } from 'react';
import { Activity, TrendingUp, Users, Calendar, Target, AlertTriangle } from 'lucide-react';
import { TokenCard } from './TokenCard';
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
    queries: allTokens.slice(0, 20).map(token => ({
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Crypto Analysis Pro</h1>
                <p className="text-sm text-gray-600">Professional Token Discovery Framework</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Market Overview</p>
                <p className="font-semibold text-gray-900">{formatNumber(marketStats.totalMarketCap)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Market Cap</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(marketStats.totalMarketCap)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">24h Volume</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(marketStats.totalVolume)}</p>
              </div>
              <Activity className="w-8 h-8 text-success-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className={cn('text-2xl font-bold', 
                  marketStats.avgPerformance >= 0 ? 'text-success-600' : 'text-danger-600'
                )}>
                  {marketStats.avgPerformance >= 0 ? '+' : ''}{marketStats.avgPerformance.toFixed(1)}%
                </p>
              </div>
              <Users className="w-8 h-8 text-warning-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tokens Tracked</p>
                <p className="text-2xl font-bold text-gray-900">{marketStats.tokenCount}</p>
              </div>
              <Target className="w-8 h-8 text-danger-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('tokens')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
              activeTab === 'tokens' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Token Discovery
          </button>
          <button
            onClick={() => setActiveTab('narratives')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
              activeTab === 'narratives' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Narrative Radar
          </button>
          <button
            onClick={() => setActiveTab('breakout')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 relative',
              activeTab === 'breakout' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Breakout Radar
            {breakoutCandidates.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {breakoutCandidates.length}
              </span>
            )}
          </button>
          {selectedAnalysis && (
            <button
              onClick={() => setActiveTab('analysis')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                activeTab === 'analysis' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Deep Analysis
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'tokens' && (
              <div className="space-y-6">
                <SearchBar 
                  onSearch={setSearchQuery} 
                  onFilterChange={setFilters}
                  onTokenSelect={(tokenId) => {
                    setSelectedToken(tokenId);
                    setActiveTab('analysis');
                  }}
                />
                
                {(trendingLoading || aiLoading || depinLoading) && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading token data...</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTokens.map(token => (
                    <TokenCard
                      key={token.id}
                      token={token}
                      onClick={() => {
                        setSelectedToken(token.id);
                        setActiveTab('analysis');
                      }}
                      isSelected={selectedToken === token.id}
                    />
                  ))}
                </div>
                
                {filteredTokens.length === 0 && !trendingLoading && !aiLoading && !depinLoading && (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'narratives' && (
              <div className="space-y-6">
                <div className="card">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Trending Narratives</h2>
                  <p className="text-gray-600 mb-6">
                    Track emerging themes and sectors driving the next wave of crypto adoption.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <BreakoutRadar 
                candidates={breakoutCandidates}
                onTokenSelect={(tokenId) => {
                  setSelectedToken(tokenId);
                  setActiveTab('analysis');
                }}
              />
            )}

            {activeTab === 'analysis' && (
              <div>
                {analysisLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Analyzing token data...</p>
                  </div>
                )}
                {selectedAnalysis && <AnalysisPanel analysis={selectedAnalysis} />}
                {!selectedAnalysis && !analysisLoading && (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No analysis available</h3>
                    <p className="text-gray-600">Select a token to view detailed analysis.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Workflow */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                Weekly Workflow
              </h3>
              <div className="space-y-3">
                {[
                  { day: 'Mon', task: 'Parse funding rounds', status: 'completed' },
                  { day: 'Tue', task: 'Dev commit analysis', status: 'completed' },
                  { day: 'Wed', task: 'Token unlock scan', status: 'pending' },
                  { day: 'Thu', task: 'Smart money flows', status: 'pending' },
                  { day: 'Fri', task: 'Sentiment update', status: 'pending' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">{item.day}</span>
                      <span className="text-sm text-gray-600">{item.task}</span>
                    </div>
                    <span className={cn('w-2 h-2 rounded-full', 
                      item.status === 'completed' ? 'bg-success-500' : 'bg-gray-300'
                    )} />
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Controls */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-warning-600" />
                Risk Controls
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-warning-50 rounded-lg">
                  <p className="font-medium text-warning-800">Portfolio Sizing</p>
                  <p className="text-warning-700">Max 1% per micro-cap position</p>
                </div>
                <div className="p-3 bg-danger-50 rounded-lg">
                  <p className="font-medium text-danger-800">Leverage Policy</p>
                  <p className="text-danger-700">No leverage on small caps</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="font-medium text-primary-800">Custody Rule</p>
                  <p className="text-primary-700">Self-custody if held {'>'}1 week</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {selectedAnalysis && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overall Score</span>
                    <span className={cn('font-semibold', 
                      selectedAnalysis.overallScore >= 70 ? 'text-success-600' : 
                      selectedAnalysis.overallScore >= 40 ? 'text-warning-600' : 'text-danger-600'
                    )}>
                      {selectedAnalysis.overallScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <span className={cn('font-semibold capitalize', 
                      selectedAnalysis.riskLevel === 'low' ? 'text-success-600' : 
                      selectedAnalysis.riskLevel === 'medium' ? 'text-warning-600' : 'text-danger-600'
                    )}>
                      {selectedAnalysis.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Recommendation</span>
                    <span className={cn('font-semibold capitalize', 
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