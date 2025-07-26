import { Token, DeveloperMetrics, AnalysisResult, BreakoutSignal } from '../types';

export interface BreakoutAnalysisInput {
  token: Token;
  developerMetrics?: DeveloperMetrics;
  narrative?: string;
  volumeRatio?: number;
  priceAction?: {
    consolidationDays: number;
    volatility: number;
    supportLevel: number;
    resistanceLevel: number;
  };
}

export function calculateBreakoutProbability(input: BreakoutAnalysisInput): {
  probability: number;
  signals: BreakoutSignal[];
} {
  const signals: BreakoutSignal[] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  // Volume Analysis (25% weight)
  const volumeRatio = input.token.volume24h / input.token.marketCap;
  if (volumeRatio > 0.10) { // Lowered threshold for micro-caps
    signals.push({
      type: 'volume',
      strength: 'strong',
      description: `Exceptional volume: ${(volumeRatio * 100).toFixed(1)}% of market cap (breakout signal)`,
      weight: 25
    });
    weightedScore += 25 * 0.9;
  } else if (volumeRatio > 0.05) {
    signals.push({
      type: 'volume',
      strength: 'moderate',
      description: `High volume: ${(volumeRatio * 100).toFixed(1)}% of market cap (accumulation)`,
      weight: 25
    });
    weightedScore += 25 * 0.6;
  } else if (volumeRatio > 0.02) {
    signals.push({
      type: 'volume',
      strength: 'weak',
      description: `Moderate volume: ${(volumeRatio * 100).toFixed(1)}% of market cap (watching)`,
      weight: 25
    });
    weightedScore += 25 * 0.3;
  }
  totalWeight += 25;

  // Price Action Analysis (20% weight)
  const recentPerformance = input.token.priceChange7d;
  const momentum = input.token.priceChange24h;
  
  if (recentPerformance > 15 && momentum > 5) {
    signals.push({
      type: 'price',
      strength: 'strong',
      description: `Strong momentum: +${recentPerformance.toFixed(1)}% (7d), +${momentum.toFixed(1)}% (24h)`,
      weight: 20
    });
    weightedScore += 20 * 0.85;
  } else if (recentPerformance > 5 && momentum > 2) {
    signals.push({
      type: 'price',
      strength: 'moderate',
      description: `Building momentum: +${recentPerformance.toFixed(1)}% (7d), +${momentum.toFixed(1)}% (24h)`,
      weight: 20
    });
    weightedScore += 20 * 0.5;
  } else if (recentPerformance > -5 && momentum > -2) {
    signals.push({
      type: 'price',
      strength: 'weak',
      description: `Stable price action: ${recentPerformance.toFixed(1)}% (7d), ${momentum.toFixed(1)}% (24h)`,
      weight: 20
    });
    weightedScore += 20 * 0.2;
  }
  totalWeight += 20;

  // Development Activity (20% weight)
  if (input.developerMetrics) {
    const { commitGrowth6m, monthlyActiveDevs, fullTimeDevs } = input.developerMetrics;
    
    if (commitGrowth6m > 50 && monthlyActiveDevs > 15) {
      signals.push({
        type: 'development',
        strength: 'strong',
        description: `High dev activity: +${commitGrowth6m.toFixed(1)}% commits, ${monthlyActiveDevs} active devs`,
        weight: 20
      });
      weightedScore += 20 * 0.8;
    } else if (commitGrowth6m > 25 && monthlyActiveDevs > 8) {
      signals.push({
        type: 'development',
        strength: 'moderate',
        description: `Growing dev activity: +${commitGrowth6m.toFixed(1)}% commits, ${monthlyActiveDevs} active devs`,
        weight: 20
      });
      weightedScore += 20 * 0.5;
    } else if (commitGrowth6m > 0 && monthlyActiveDevs > 3) {
      signals.push({
        type: 'development',
        strength: 'weak',
        description: `Stable dev activity: +${commitGrowth6m.toFixed(1)}% commits, ${monthlyActiveDevs} active devs`,
        weight: 20
      });
      weightedScore += 20 * 0.2;
    }
  }
  totalWeight += 20;

  // Narrative Strength (15% weight)
  if (input.narrative) {
    const narrativeStrength = getNarrativeStrength(input.narrative, input.token.priceChange30d);
    
    if (narrativeStrength === 'strong') {
      signals.push({
        type: 'narrative',
        strength: 'strong',
        description: `Hot narrative: ${getNarrativeName(input.narrative)} (+${input.token.priceChange30d.toFixed(1)}% sector)`,
        weight: 15
      });
      weightedScore += 15 * 0.9;
    } else if (narrativeStrength === 'moderate') {
      signals.push({
        type: 'narrative',
        strength: 'moderate',
        description: `Growing narrative: ${getNarrativeName(input.narrative)}`,
        weight: 15
      });
      weightedScore += 15 * 0.6;
    } else {
      signals.push({
        type: 'narrative',
        strength: 'weak',
        description: `Established narrative: ${getNarrativeName(input.narrative)}`,
        weight: 15
      });
      weightedScore += 15 * 0.3;
    }
  }
  totalWeight += 15;

  // Market Cap Tier Bonus (10% weight)
  const marketCapTier = getMarketCapTier(input.token.marketCap);
  if (marketCapTier === 'micro' && volumeRatio > 0.05) {
    signals.push({
      type: 'technical',
      strength: 'strong',
      description: `Micro-cap breakout setup: ${formatMarketCap(input.token.marketCap)} with ${(volumeRatio * 100).toFixed(1)}% volume ratio`,
      weight: 10
    });
    weightedScore += 10 * 0.8;
  } else if (marketCapTier === 'small' && volumeRatio > 0.03) {
    signals.push({
      type: 'technical',
      strength: 'moderate',
      description: `Small-cap with momentum: ${formatMarketCap(input.token.marketCap)} showing volume`,
      weight: 10
    });
    weightedScore += 10 * 0.5;
  }
  totalWeight += 10;

  // Smart Money Indicators (10% weight)
  // This would use on-chain data in production
  const hasSmartMoneySignals = volumeRatio > 0.1 && input.token.priceChange24h > 3;
  if (hasSmartMoneySignals) {
    signals.push({
      type: 'smart_money',
      strength: 'moderate',
      description: 'Potential smart money accumulation detected',
      weight: 10
    });
    weightedScore += 10 * 0.6;
  }
  totalWeight += 10;

  const probability = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

  return {
    probability: Math.min(95, Math.max(5, probability)), // Cap between 5-95%
    signals: signals.sort((a, b) => b.weight - a.weight) // Sort by importance
  };
}

function getNarrativeStrength(narrative: string, performance30d: number): 'weak' | 'moderate' | 'strong' {
  const hotNarratives = ['ai-ml', 'depin'];
  const isHot = hotNarratives.includes(narrative);
  
  if (isHot && performance30d > 100) return 'strong';
  if (isHot && performance30d > 30) return 'moderate';
  if (performance30d > 50) return 'moderate';
  return 'weak';
}

function getNarrativeName(narrative: string): string {
  const names: Record<string, string> = {
    'ai-ml': 'AI & ML',
    'depin': 'DePIN',
    'gaming': 'Gaming',
    'defi': 'DeFi',
    'rwa': 'RWA'
  };
  return names[narrative] || narrative;
}

function getMarketCapTier(marketCap: number): 'micro' | 'small' | 'mid' | 'large' {
  if (marketCap < 100000000) return 'micro';    // Under $100M
  if (marketCap < 1000000000) return 'small';   // $100M - $1B
  if (marketCap < 10000000000) return 'mid';    // $1B - $10B
  return 'large';
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
  if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(1)}K`;
  return `$${marketCap.toFixed(0)}`;
}

export function identifyBreakoutCandidates(tokens: Token[], analyses: AnalysisResult[]): AnalysisResult[] {
  return analyses
    .filter(analysis => analysis.breakoutProbability >= 60) // 60%+ breakout probability
    .sort((a, b) => b.breakoutProbability - a.breakoutProbability)
    .slice(0, 10); // Top 10 candidates
}