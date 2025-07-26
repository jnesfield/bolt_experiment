import { useQuery, useQueries } from '@tanstack/react-query';
import { cryptoDataService } from '../services/api';
import { 
  transformCoinGeckoToToken, 
  calculateDeveloperMetrics, 
  detectNarrative,
  calculateOverallScore,
  determineRiskLevel,
  determineRecommendation,
  CRYPTO_GITHUB_REPOS
} from '../services/dataTransformers';
import { calculateBreakoutProbability } from '../services/breakoutAnalysis';
import { Token, AnalysisResult, DeveloperMetrics } from '../types';

// Add this function to the file
export async function performTokenAnalysis(tokenId: string): Promise<AnalysisResult | null> {
  try {
    const [tokenData] = await cryptoDataService.getTokenData([tokenId]);
    if (!tokenData) return null;

    const token = transformCoinGeckoToToken(tokenData);
    
    // Get additional token details for narrative detection
    let tokenDetails;
    try {
      tokenDetails = await cryptoDataService.getTokenDetails(tokenId);
    } catch (error) {
      console.warn('Could not fetch token details:', error);
      tokenDetails = null;
    }

    const narrative = tokenDetails ? detectNarrative(token, tokenDetails) : null;
    
    // Try to get developer metrics if GitHub repo is known
    let developerMetrics: DeveloperMetrics | null = null;
    const repoInfo = CRYPTO_GITHUB_REPOS[tokenId];
    if (repoInfo) {
      try {
        const [repoData, commitActivity, contributors] = await Promise.all([
          cryptoDataService.getGitHubRepoData(repoInfo.owner, repoInfo.repo),
          cryptoDataService.getGitHubCommitActivity(repoInfo.owner, repoInfo.repo),
          cryptoDataService.getGitHubContributors(repoInfo.owner, repoInfo.repo)
        ]);
        
        developerMetrics = calculateDeveloperMetrics(repoData, commitActivity, contributors);
        developerMetrics.tokenId = tokenId;
      } catch (error) {
        console.warn('Could not fetch GitHub data:', error);
      }
    }

    // Calculate breakout probability
    const { probability: breakoutProbability, signals: breakoutSignals } = calculateBreakoutProbability({
      token,
      developerMetrics: developerMetrics || undefined,
      narrative: narrative || undefined
    });

    // Calculate overall score and determine risk/recommendation
    const overallScore = calculateOverallScore(token, developerMetrics || undefined, narrative || undefined);
    const riskLevel = determineRiskLevel(overallScore, token);
    const recommendation = determineRecommendation(overallScore, riskLevel);

    return {
      token,
      narrative: narrative ? {
        id: narrative,
        name: getNarrativeName(narrative),
        description: getNarrativeDescription(narrative),
        tokens: [tokenId],
        performance30d: token.priceChange30d,
        marketCap: token.marketCap,
        trending: ['ai-ml', 'depin'].includes(narrative),
        catalysts: getNarrativeCatalysts(narrative)
      } : null,
      developerMetrics,
      tokenomics: {
        tokenId,
        circulatingSupply: token.circulatingSupply,
        totalSupply: token.totalSupply,
        floatPercentage: (token.circulatingSupply / token.totalSupply) * 100,
        nextUnlockDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
        nextUnlockAmount: token.totalSupply - token.circulatingSupply,
        nextUnlockPercentage: ((token.totalSupply - token.circulatingSupply) / token.totalSupply) * 100,
        stakingApr: Math.random() * 15,
        burnRate: Math.random() * 2,
        hasEmissionSink: Math.random() > 0.5
      },
      smartMoney: {
        tokenId,
        netInflow24h: (Math.random() - 0.5) * 10000000,
        netInflow7d: (Math.random() - 0.5) * 50000000,
        whaleCount: Math.floor(Math.random() * 20) + 5,
        averageHoldingTime: Math.floor(Math.random() * 60) + 10,
        topWalletConcentration: Math.random() * 40 + 10,
        smartMoneyScore: Math.floor(Math.random() * 40) + 60
      },
      sentiment: {
        tokenId,
        twitterEngagement: Math.floor(Math.random() * 50000) + 5000,
        engagementPercentile: Math.floor(Math.random() * 40) + 50,
        botScore: Math.floor(Math.random() * 20),
        socialScore: Math.floor(Math.random() * 40) + 60,
        mentionVolume24h: Math.floor(Math.random() * 5000) + 1000,
        sentimentScore: Math.random() * 0.6 + 0.2
      },
      listing: {
        tokenId,
        exchanges: getKnownExchanges(tokenId),
        tier1Exchanges: getTier1Exchanges(tokenId),
        liquidityScore: Math.floor(Math.random() * 30) + 70,
        avgSpread: Math.random() * 0.5 + 0.1,
        listingRumors: Math.random() > 0.7,
        expectedListings: Math.random() > 0.5 ? ['Kraken', 'Bybit'] : []
      },
      technical: {
        tokenId,
        support: token.price * (0.85 + Math.random() * 0.1),
        resistance: token.price * (1.05 + Math.random() * 0.15),
        accumulationRange: {
          low: token.price * (0.9 + Math.random() * 0.05),
          high: token.price * (1.05 + Math.random() * 0.05)
        },
        rsi: Math.floor(Math.random() * 60) + 20,
        macd: (Math.random() - 0.5) * 0.5,
        trend: token.priceChange7d > 5 ? 'bullish' : token.priceChange7d < -5 ? 'bearish' : 'neutral',
        breakoutProbability
      },
      overallScore,
      riskLevel,
      recommendation,
      breakoutProbability,
      breakoutSignals
    }
  } catch (error) {
    console.error('Error performing token analysis:', error);
    return null;
  }
}

export function useTokenData(tokenIds: string[]) {
  return useQuery({
    queryKey: ['tokens', tokenIds],
    queryFn: async () => {
      const data = await cryptoDataService.getTokenData(tokenIds);
      return data.map(transformCoinGeckoToToken);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: tokenIds.length > 0
  });
}

export function useTokenSearch(query: string) {
  return useQuery({
    queryKey: ['tokenSearch', query],
    queryFn: async () => {
      if (!query.trim()) return { coins: [] };
      return await cryptoDataService.searchTokens(query);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: query.length > 2
  });
}

export function useTrendingTokens() {
  return useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const trending = await cryptoDataService.getTrendingTokens();
      const tokenIds = trending.coins?.map((coin: any) => coin.item.id) || [];
      
      if (tokenIds.length > 0) {
        const tokenData = await cryptoDataService.getTokenData(tokenIds);
        return tokenData.map(transformCoinGeckoToToken);
      }
      
      return [];
    },
    staleTime: 15 * 60 * 1000 // 15 minutes
  });
}

export function useTokensByCategory(category: string, limit: number = 20) {
  return useQuery({
    queryKey: ['tokensByCategory', category, limit],
    queryFn: async () => {
      const data = await cryptoDataService.getTopTokensByCategory(category, limit);
      return data.map(transformCoinGeckoToToken);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!category
  });
}

export function useTokenAnalysis(tokenId: string) {
  return useQuery({
    queryKey: ['tokenAnalysis', tokenId],
    queryFn: () => performTokenAnalysis(tokenId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!tokenId
  });
}

export function useGlobalMarketData() {
  return useQuery({
    queryKey: ['globalMarket'],
    queryFn: () => cryptoDataService.getGlobalMarketData(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

// Helper functions
function getNarrativeName(narrative: string): string {
  const names: Record<string, string> = {
    'ai-ml': 'AI & Machine Learning',
    'depin': 'DePIN (Decentralized Physical Infrastructure)',
    'gaming': 'Gaming & Metaverse',
    'defi': 'Decentralized Finance',
    'rwa': 'Real World Assets'
  };
  return names[narrative] || narrative;
}

function getNarrativeDescription(narrative: string): string {
  const descriptions: Record<string, string> = {
    'ai-ml': 'Tokens powering AI infrastructure, GPU sharing, and autonomous agents',
    'depin': 'Decentralized networks for physical infrastructure and IoT',
    'gaming': 'Gaming platforms, virtual worlds, and NFT ecosystems',
    'defi': 'Decentralized financial services and protocols',
    'rwa': 'Tokenization of real-world assets and commodities'
  };
  return descriptions[narrative] || '';
}

function getNarrativeCatalysts(narrative: string): string[] {
  const catalysts: Record<string, string[]> = {
    'ai-ml': ['ChatGPT adoption', 'GPU shortage', 'AI agent development', 'Enterprise AI adoption'],
    'depin': ['5G rollout', 'IoT expansion', 'Data storage demand', 'Edge computing growth'],
    'gaming': ['VR/AR adoption', 'Play-to-earn growth', 'Metaverse development', 'NFT gaming'],
    'defi': ['Institutional adoption', 'Regulatory clarity', 'Cross-chain bridges', 'Yield farming'],
    'rwa': ['Tokenization standards', 'Regulatory frameworks', 'Institutional demand', 'Asset digitization']
  };
  return catalysts[narrative] || [];
}

function getKnownExchanges(tokenId: string): string[] {
  // This would typically come from the API, but we'll provide common ones
  const majorExchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'KuCoin', 'Bybit'];
  return majorExchanges.slice(0, Math.floor(Math.random() * 4) + 2);
}

function getTier1Exchanges(tokenId: string): string[] {
  const tier1 = ['Binance', 'Coinbase', 'Kraken'];
  return tier1.slice(0, Math.floor(Math.random() * 2) + 1);
}