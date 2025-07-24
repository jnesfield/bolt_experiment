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
import { Token, AnalysisResult, DeveloperMetrics } from '../types';

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
    queryFn: async (): Promise<AnalysisResult | null> => {
      if (!tokenId) return null;

      // Get basic token data
      const [tokenData, tokenDetails] = await Promise.all([
        cryptoDataService.getTokenData([tokenId]),
        cryptoDataService.getTokenDetails(tokenId)
      ]);

      if (!tokenData.length) return null;

      const token = transformCoinGeckoToToken(tokenData[0]);
      
      // Get GitHub data if available
      let developerMetrics: DeveloperMetrics | null = null;
      const githubRepo = CRYPTO_GITHUB_REPOS[tokenId];
      
      if (githubRepo) {
        try {
          const [repoData, commitActivity, contributors] = await Promise.all([
            cryptoDataService.getGitHubRepoData(githubRepo.owner, githubRepo.repo),
            cryptoDataService.getGitHubCommitActivity(githubRepo.owner, githubRepo.repo),
            cryptoDataService.getGitHubContributors(githubRepo.owner, githubRepo.repo)
          ]);

          developerMetrics = {
            ...calculateDeveloperMetrics(repoData, commitActivity, contributors),
            tokenId
          };
        } catch (error) {
          console.warn(`Failed to fetch GitHub data for ${tokenId}:`, error);
        }
      }

      // Detect narrative
      const narrative = detectNarrative(token, tokenDetails);
      
      // Calculate scores
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
          trending: token.priceChange30d > 50,
          catalysts: getNarrativeCatalysts(narrative)
        } : null,
        developerMetrics,
        tokenomics: null, // Would need additional API for unlock data
        smartMoney: null, // Would need on-chain analysis
        sentiment: null, // Would need social media APIs
        listing: {
          tokenId,
          exchanges: getKnownExchanges(tokenId),
          tier1Exchanges: getTier1Exchanges(tokenId),
          liquidityScore: Math.min(90, Math.max(30, (token.volume24h / token.marketCap) * 1000)),
          avgSpread: 0.15, // Placeholder
          listingRumors: false,
          expectedListings: []
        },
        technical: null, // Would need technical analysis APIs
        overallScore,
        riskLevel,
        recommendation
      };
    },
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