export interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  circulatingSupply: number;
  totalSupply: number;
  fdv: number;
  lastUpdated: string;
}

export interface NarrativeData {
  id: string;
  name: string;
  description: string;
  tokens: string[];
  performance30d: number;
  marketCap: number;
  trending: boolean;
  catalysts: string[];
}

export interface DeveloperMetrics {
  tokenId: string;
  fullTimeDevs: number;
  monthlyActiveDevs: number;
  commitGrowth6m: number;
  lastCommit: string;
  githubStars: number;
  githubForks: number;
}

export interface TokenomicsData {
  tokenId: string;
  circulatingSupply: number;
  totalSupply: number;
  floatPercentage: number;
  nextUnlockDate: string;
  nextUnlockAmount: number;
  nextUnlockPercentage: number;
  stakingApr: number;
  burnRate: number;
  hasEmissionSink: boolean;
}

export interface SmartMoneyFlow {
  tokenId: string;
  netInflow24h: number;
  netInflow7d: number;
  whaleCount: number;
  averageHoldingTime: number;
  topWalletConcentration: number;
  smartMoneyScore: number;
}

export interface SentimentData {
  tokenId: string;
  twitterEngagement: number;
  engagementPercentile: number;
  botScore: number;
  socialScore: number;
  mentionVolume24h: number;
  sentimentScore: number;
}

export interface ListingData {
  tokenId: string;
  exchanges: string[];
  tier1Exchanges: string[];
  liquidityScore: number;
  avgSpread: number;
  listingRumors: boolean;
  expectedListings: string[];
}

export interface TechnicalAnalysis {
  tokenId: string;
  support: number;
  resistance: number;
  accumulationRange: {
    low: number;
    high: number;
  };
  rsi: number;
  macd: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  breakoutProbability: number;
}

export interface AnalysisResult {
  token: Token;
  narrative: NarrativeData | null;
  developerMetrics: DeveloperMetrics | null;
  tokenomics: TokenomicsData | null;
  smartMoney: SmartMoneyFlow | null;
  sentiment: SentimentData | null;
  listing: ListingData | null;
  technical: TechnicalAnalysis | null;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
}

export interface WatchlistItem {
  tokenId: string;
  addedDate: string;
  notes: string;
  targetPrice: number;
  stopLoss: number;
  positionSize: number;
}