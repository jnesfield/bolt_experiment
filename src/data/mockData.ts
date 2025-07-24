import { Token, NarrativeData, DeveloperMetrics, TokenomicsData, SmartMoneyFlow, SentimentData, ListingData, TechnicalAnalysis, AnalysisResult } from '../types';

export const mockTokens: Token[] = [
  {
    id: 'render-token',
    symbol: 'RNDR',
    name: 'Render Token',
    price: 7.42,
    marketCap: 3850000000,
    volume24h: 125000000,
    priceChange24h: 5.2,
    priceChange7d: 12.8,
    priceChange30d: 410.0,
    circulatingSupply: 518000000,
    totalSupply: 536000000,
    fdv: 3980000000,
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: 'fetch-ai',
    symbol: 'FET',
    name: 'Fetch.ai',
    price: 1.85,
    marketCap: 1560000000,
    volume24h: 89000000,
    priceChange24h: 8.7,
    priceChange7d: 18.3,
    priceChange30d: 365.0,
    circulatingSupply: 843000000,
    totalSupply: 1152000000,
    fdv: 2131200000,
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    price: 14.67,
    marketCap: 8650000000,
    volume24h: 245000000,
    priceChange24h: -2.1,
    priceChange7d: 4.5,
    priceChange30d: 28.9,
    circulatingSupply: 590000000,
    totalSupply: 1000000000,
    fdv: 14670000000,
    lastUpdated: '2024-01-15T10:30:00Z'
  }
];

export const mockNarratives: NarrativeData[] = [
  {
    id: 'ai-narrative',
    name: 'AI & Machine Learning',
    description: 'Tokens powering AI infrastructure, GPU sharing, and autonomous agents',
    tokens: ['render-token', 'fetch-ai', 'ocean-protocol'],
    performance30d: 257.5,
    marketCap: 12500000000,
    trending: true,
    catalysts: ['ChatGPT adoption', 'GPU shortage', 'AI agent development', 'Enterprise AI adoption']
  },
  {
    id: 'depin-narrative',
    name: 'DePIN (Decentralized Physical Infrastructure)',
    description: 'Decentralized networks for physical infrastructure and IoT',
    tokens: ['helium', 'filecoin', 'arweave'],
    performance30d: 145.2,
    marketCap: 8900000000,
    trending: true,
    catalysts: ['5G rollout', 'IoT expansion', 'Data storage demand']
  }
];

export const mockDeveloperMetrics: DeveloperMetrics[] = [
  {
    tokenId: 'render-token',
    fullTimeDevs: 28,
    monthlyActiveDevs: 45,
    commitGrowth6m: 42.0,
    lastCommit: '2024-01-14T16:22:00Z',
    githubStars: 1250,
    githubForks: 340
  },
  {
    tokenId: 'fetch-ai',
    fullTimeDevs: 35,
    monthlyActiveDevs: 62,
    commitGrowth6m: 55.0,
    lastCommit: '2024-01-15T09:15:00Z',
    githubStars: 2100,
    githubForks: 580
  }
];

export const mockTokenomics: TokenomicsData[] = [
  {
    tokenId: 'render-token',
    circulatingSupply: 518000000,
    totalSupply: 536000000,
    floatPercentage: 96.6,
    nextUnlockDate: '2024-08-15T00:00:00Z',
    nextUnlockAmount: 5000000,
    nextUnlockPercentage: 2.8,
    stakingApr: 8.5,
    burnRate: 0.2,
    hasEmissionSink: true
  },
  {
    tokenId: 'fetch-ai',
    circulatingSupply: 843000000,
    totalSupply: 1152000000,
    floatPercentage: 73.2,
    nextUnlockDate: '2024-06-20T00:00:00Z',
    nextUnlockAmount: 25000000,
    nextUnlockPercentage: 8.1,
    stakingApr: 12.3,
    burnRate: 0.0,
    hasEmissionSink: false
  }
];

export const mockSmartMoney: SmartMoneyFlow[] = [
  {
    tokenId: 'render-token',
    netInflow24h: 4100000,
    netInflow7d: 12500000,
    whaleCount: 15,
    averageHoldingTime: 45,
    topWalletConcentration: 23.5,
    smartMoneyScore: 85
  },
  {
    tokenId: 'fetch-ai',
    netInflow24h: 2800000,
    netInflow7d: 8900000,
    whaleCount: 12,
    averageHoldingTime: 38,
    topWalletConcentration: 28.2,
    smartMoneyScore: 78
  }
];

export const mockSentiment: SentimentData[] = [
  {
    tokenId: 'render-token',
    twitterEngagement: 15420,
    engagementPercentile: 75,
    botScore: 8,
    socialScore: 82,
    mentionVolume24h: 2340,
    sentimentScore: 0.72
  },
  {
    tokenId: 'fetch-ai',
    twitterEngagement: 18950,
    engagementPercentile: 68,
    botScore: 12,
    socialScore: 76,
    mentionVolume24h: 3120,
    sentimentScore: 0.68
  }
];

export const mockListing: ListingData[] = [
  {
    tokenId: 'render-token',
    exchanges: ['Binance', 'Coinbase', 'Kraken', 'OKX'],
    tier1Exchanges: ['Binance', 'Coinbase'],
    liquidityScore: 88,
    avgSpread: 0.12,
    listingRumors: false,
    expectedListings: []
  },
  {
    tokenId: 'fetch-ai',
    exchanges: ['Binance', 'Coinbase', 'KuCoin'],
    tier1Exchanges: ['Binance', 'Coinbase'],
    liquidityScore: 76,
    avgSpread: 0.18,
    listingRumors: true,
    expectedListings: ['Kraken', 'Bybit']
  }
];

export const mockTechnical: TechnicalAnalysis[] = [
  {
    tokenId: 'render-token',
    support: 6.85,
    resistance: 8.20,
    accumulationRange: {
      low: 6.90,
      high: 7.80
    },
    rsi: 68,
    macd: 0.15,
    trend: 'bullish',
    breakoutProbability: 72
  },
  {
    tokenId: 'fetch-ai',
    support: 1.65,
    resistance: 2.10,
    accumulationRange: {
      low: 1.70,
      high: 1.95
    },
    rsi: 71,
    macd: 0.08,
    trend: 'bullish',
    breakoutProbability: 68
  }
];

export function generateMockAnalysis(tokenId: string): AnalysisResult | null {
  const token = mockTokens.find(t => t.id === tokenId);
  if (!token) return null;

  const narrative = mockNarratives.find(n => n.tokens.includes(tokenId));
  const developerMetrics = mockDeveloperMetrics.find(d => d.tokenId === tokenId);
  const tokenomics = mockTokenomics.find(t => t.tokenId === tokenId);
  const smartMoney = mockSmartMoney.find(s => s.tokenId === tokenId);
  const sentiment = mockSentiment.find(s => s.tokenId === tokenId);
  const listing = mockListing.find(l => l.tokenId === tokenId);
  const technical = mockTechnical.find(t => t.tokenId === tokenId);

  // Calculate overall score based on various factors
  let score = 0;
  let factors = 0;

  if (narrative?.trending) {
    score += 15;
    factors++;
  }

  if (developerMetrics) {
    if (developerMetrics.fullTimeDevs >= 10 && developerMetrics.commitGrowth6m > 25) {
      score += 20;
    }
    factors++;
  }

  if (tokenomics) {
    if (tokenomics.floatPercentage > 70 && !isUnlockRisky(tokenomics.nextUnlockDate, tokenomics.nextUnlockPercentage)) {
      score += 15;
    }
    factors++;
  }

  if (smartMoney) {
    if (smartMoney.netInflow24h > 300000) {
      score += 20;
    }
    factors++;
  }

  if (sentiment) {
    if (sentiment.engagementPercentile >= 60 && sentiment.engagementPercentile <= 80 && sentiment.botScore < 10) {
      score += 15;
    }
    factors++;
  }

  if (listing) {
    score += Math.min(listing.liquidityScore / 5, 15);
    factors++;
  }

  const overallScore = factors > 0 ? score / factors * (100 / 100) : 0;

  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  let recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell' = 'hold';

  if (overallScore >= 80) {
    riskLevel = 'low';
    recommendation = 'strong_buy';
  } else if (overallScore >= 60) {
    riskLevel = 'medium';
    recommendation = 'buy';
  } else if (overallScore >= 40) {
    riskLevel = 'medium';
    recommendation = 'hold';
  } else {
    riskLevel = 'high';
    recommendation = 'sell';
  }

  return {
    token,
    narrative: narrative || null,
    developerMetrics: developerMetrics || null,
    tokenomics: tokenomics || null,
    smartMoney: smartMoney || null,
    sentiment: sentiment || null,
    listing: listing || null,
    technical: technical || null,
    overallScore: Math.round(overallScore),
    riskLevel,
    recommendation
  };
}

function isUnlockRisky(unlockDate: string, unlockPercentage: number): boolean {
  const unlockDateObj = new Date(unlockDate);
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  return unlockDateObj < sixMonthsFromNow && unlockPercentage > 5;
}