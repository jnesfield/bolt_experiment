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