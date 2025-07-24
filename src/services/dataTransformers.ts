import { Token, DeveloperMetrics, NarrativeData, AnalysisResult } from '../types';
import { CoinGeckoToken, GitHubRepo, GitHubCommitActivity } from './api';

export function transformCoinGeckoToToken(coinGeckoData: CoinGeckoToken): Token {
  return {
    id: coinGeckoData.id,
    symbol: coinGeckoData.symbol.toUpperCase(),
    name: coinGeckoData.name,
    price: coinGeckoData.current_price || 0,
    marketCap: coinGeckoData.market_cap || 0,
    volume24h: coinGeckoData.total_volume || 0,
    priceChange24h: coinGeckoData.price_change_percentage_24h || 0,
    priceChange7d: coinGeckoData.price_change_percentage_7d_in_currency || 0,
    priceChange30d: coinGeckoData.price_change_percentage_30d_in_currency || 0,
    circulatingSupply: coinGeckoData.circulating_supply || 0,
    totalSupply: coinGeckoData.total_supply || 0,
    fdv: coinGeckoData.fully_diluted_valuation || 0,
    lastUpdated: coinGeckoData.last_updated
  };
}

export function calculateDeveloperMetrics(
  repoData: GitHubRepo,
  commitActivity: GitHubCommitActivity[],
  contributors: any[]
): DeveloperMetrics {
  // Calculate commit growth over last 6 months
  const recentActivity = commitActivity.slice(-26); // Last 26 weeks (6 months)
  const firstHalf = recentActivity.slice(0, 13);
  const secondHalf = recentActivity.slice(13);
  
  const firstHalfCommits = firstHalf.reduce((sum, week) => sum + week.total, 0);
  const secondHalfCommits = secondHalf.reduce((sum, week) => sum + week.total, 0);
  
  const commitGrowth6m = firstHalfCommits > 0 
    ? ((secondHalfCommits - firstHalfCommits) / firstHalfCommits) * 100 
    : 0;

  // Estimate active developers (contributors with commits in last 3 months)
  const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  const recentContributors = contributors.filter(contributor => 
    new Date(contributor.last_commit_date || 0).getTime() > threeMonthsAgo
  );

  return {
    tokenId: '', // Will be set by caller
    fullTimeDevs: Math.min(contributors.length, 50), // Estimate based on total contributors
    monthlyActiveDevs: recentContributors.length,
    commitGrowth6m,
    lastCommit: repoData.pushed_at,
    githubStars: repoData.stargazers_count,
    githubForks: repoData.forks_count
  };
}

export function detectNarrative(token: Token, tokenDetails: any): string | null {
  const name = token.name.toLowerCase();
  const description = tokenDetails.description?.en?.toLowerCase() || '';
  const categories = tokenDetails.categories || [];
  
  // AI & Machine Learning
  if (categories.includes('artificial-intelligence') || 
      name.includes('ai') || name.includes('artificial') ||
      description.includes('artificial intelligence') ||
      description.includes('machine learning') ||
      description.includes('gpu') || description.includes('render')) {
    return 'ai-ml';
  }
  
  // DePIN (Decentralized Physical Infrastructure)
  if (categories.includes('infrastructure') ||
      description.includes('infrastructure') ||
      description.includes('iot') || description.includes('storage') ||
      description.includes('network') || description.includes('wireless')) {
    return 'depin';
  }
  
  // Gaming
  if (categories.includes('gaming') || categories.includes('metaverse') ||
      description.includes('gaming') || description.includes('metaverse') ||
      description.includes('nft') || description.includes('virtual')) {
    return 'gaming';
  }
  
  // DeFi
  if (categories.includes('decentralized-finance-defi') ||
      description.includes('defi') || description.includes('lending') ||
      description.includes('yield') || description.includes('liquidity')) {
    return 'defi';
  }
  
  // RWA (Real World Assets)
  if (description.includes('real world') || description.includes('tokenization') ||
      description.includes('asset') || description.includes('commodity')) {
    return 'rwa';
  }
  
  return null;
}

export function calculateOverallScore(
  token: Token,
  developerMetrics?: DeveloperMetrics,
  narrative?: string,
  marketData?: any
): number {
  let score = 0;
  let maxScore = 0;
  
  // Market performance (30 points)
  maxScore += 30;
  if (token.priceChange30d > 100) score += 30;
  else if (token.priceChange30d > 50) score += 20;
  else if (token.priceChange30d > 0) score += 10;
  
  // Volume/Market Cap ratio (20 points)
  maxScore += 20;
  const volumeRatio = token.volume24h / token.marketCap;
  if (volumeRatio > 0.1) score += 20;
  else if (volumeRatio > 0.05) score += 15;
  else if (volumeRatio > 0.01) score += 10;
  
  // Developer activity (25 points)
  if (developerMetrics) {
    maxScore += 25;
    if (developerMetrics.commitGrowth6m > 50) score += 15;
    else if (developerMetrics.commitGrowth6m > 25) score += 10;
    else if (developerMetrics.commitGrowth6m > 0) score += 5;
    
    if (developerMetrics.monthlyActiveDevs > 20) score += 10;
    else if (developerMetrics.monthlyActiveDevs > 10) score += 7;
    else if (developerMetrics.monthlyActiveDevs > 5) score += 5;
  }
  
  // Narrative bonus (15 points)
  maxScore += 15;
  if (narrative === 'ai-ml') score += 15;
  else if (narrative === 'depin') score += 12;
  else if (narrative === 'gaming') score += 10;
  else if (narrative) score += 8;
  
  // Market cap tier (10 points)
  maxScore += 10;
  if (token.marketCap > 1000000000) score += 10; // >$1B
  else if (token.marketCap > 100000000) score += 8; // >$100M
  else if (token.marketCap > 10000000) score += 6; // >$10M
  else if (token.marketCap > 1000000) score += 4; // >$1M
  
  return Math.round((score / maxScore) * 100);
}

export function determineRiskLevel(score: number, token: Token): 'low' | 'medium' | 'high' {
  if (score >= 75 && token.marketCap > 100000000) return 'low';
  if (score >= 60 && token.marketCap > 10000000) return 'medium';
  return 'high';
}

export function determineRecommendation(
  score: number, 
  riskLevel: 'low' | 'medium' | 'high'
): 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell' {
  if (score >= 80 && riskLevel === 'low') return 'strong_buy';
  if (score >= 70) return 'buy';
  if (score >= 50) return 'hold';
  if (score >= 30) return 'sell';
  return 'strong_sell';
}

// Known GitHub repositories for popular crypto projects
export const CRYPTO_GITHUB_REPOS: Record<string, { owner: string; repo: string }> = {
  'ethereum': { owner: 'ethereum', repo: 'go-ethereum' },
  'bitcoin': { owner: 'bitcoin', repo: 'bitcoin' },
  'chainlink': { owner: 'smartcontractkit', repo: 'chainlink' },
  'uniswap': { owner: 'Uniswap', repo: 'v3-core' },
  'aave': { owner: 'aave', repo: 'aave-v3-core' },
  'compound': { owner: 'compound-finance', repo: 'compound-protocol' },
  'maker': { owner: 'makerdao', repo: 'dss' },
  'polygon': { owner: 'maticnetwork', repo: 'bor' },
  'avalanche': { owner: 'ava-labs', repo: 'avalanchego' },
  'solana': { owner: 'solana-labs', repo: 'solana' },
  'cardano': { owner: 'input-output-hk', repo: 'cardano-node' },
  'polkadot': { owner: 'paritytech', repo: 'polkadot' },
  'cosmos': { owner: 'cosmos', repo: 'cosmos-sdk' },
  'near': { owner: 'near', repo: 'nearcore' },
  'algorand': { owner: 'algorand', repo: 'go-algorand' },
  'tezos': { owner: 'tezos', repo: 'tezos' },
  'filecoin': { owner: 'filecoin-project', repo: 'lotus' },
  'helium': { owner: 'helium', repo: 'blockchain-core' },
  'render-token': { owner: 'RNDR-LLC', repo: 'render-network' },
  'fetch-ai': { owner: 'fetchai', repo: 'fetchd' },
  'ocean-protocol': { owner: 'oceanprotocol', repo: 'ocean.py' },
  'the-graph': { owner: 'graphprotocol', repo: 'graph-node' },
  'arweave': { owner: 'ArweaveTeam', repo: 'arweave' }
};