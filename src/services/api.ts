const COINGECKO_BASE_URL = '/coingecko-api';
const GITHUB_BASE_URL = '/github-api';
import { dataCache } from './dataCache';

// Rate limiting helper
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}

const coinGeckoLimiter = new RateLimiter(3, 60000); // 3 requests per minute
const coinGeckoLimiter2 = new RateLimiter(50, 60000); // 50 requests per minute
const githubLimiter = new RateLimiter(60, 3600000); // 60 requests per hour

export interface CoinGeckoToken {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  circulating_supply: number;
  total_supply: number;
  fully_diluted_valuation: number;
  last_updated: string;
}

export interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  open_issues_count: number;
}

export interface GitHubCommitActivity {
  total: number;
  week: number;
  days: number[];
}

export class CryptoDataService {
  private async fetchWithRateLimit(url: string, limiter: RateLimiter): Promise<Response> {
    await limiter.waitIfNeeded();
    
    let retries = 0;
    const maxRetries = 3;
    
    while (retries <= maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });
        
        if (response.status === 429) {
          // Rate limited - implement exponential backoff
          if (retries < maxRetries) {
            const backoffDelay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
            console.warn(`Rate limited, retrying in ${backoffDelay}ms (attempt ${retries + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            retries++;
            continue;
          }
        }
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        // If it's a network error (CORS, connection failed, etc.), throw with more context
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          throw new Error(`Network error: Unable to connect to API. This may be due to CORS restrictions or network connectivity issues.`);
        }
        
        // For other errors, retry if we haven't exceeded max retries
        if (retries < maxRetries) {
          const backoffDelay = Math.pow(2, retries) * 1000;
          console.warn(`Request failed, retrying in ${backoffDelay}ms (attempt ${retries + 1}/${maxRetries + 1}):`, error.message);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          retries++;
          continue;
        }
        
        throw error;
      }
    }
  }

  async getTokenData(tokenIds: string[]): Promise<CoinGeckoToken[]> {
    const cacheKey = `tokens-${tokenIds.join(',')}`;
    
    try {
      const idsParam = tokenIds.join(',');
      const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h,7d,30d`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching token data:', error);
      
      // Try to return last known good data
      const cachedData = dataCache.get<CoinGeckoToken[]>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached token data (${Math.round((dataCache.getAge(cacheKey) || 0) / 60000)} minutes old)`);
        return cachedData;
      }
      
      // Fall back to static data only if no cache available
      console.warn('No cached data available, using static fallback');
      return this.getFallbackTokenData(tokenIds);
    }
  }

  async getGlobalMarketData(): Promise<any> {
    const cacheKey = 'global-market';
    
    try {
      const url = `${COINGECKO_BASE_URL}/global`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching global market data:', error);
      
      // Try to return last known good data
      const cachedData = dataCache.get<any>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached global data (${Math.round((dataCache.getAge(cacheKey) || 0) / 60000)} minutes old)`);
        return cachedData;
      }
      
      // Fall back to static data only if no cache available
      console.warn('No cached global data available, using static fallback');
      return this.getFallbackGlobalData();
    }
  }

  private getFallbackTokenData(tokenIds: string[]): CoinGeckoToken[] {
    const fallbackTokens: { [key: string]: CoinGeckoToken } = {
      'render-token': {
        id: 'render-token',
        symbol: 'rndr',
        name: 'Render',
        current_price: 7.42,
        market_cap: 3850000000,
        total_volume: 125000000,
        price_change_percentage_24h: 5.2,
        price_change_percentage_7d_in_currency: 12.8,
        price_change_percentage_30d_in_currency: 410.5,
        circulating_supply: 518000000,
        total_supply: 536870912,
        fully_diluted_valuation: 3980000000,
        last_updated: new Date().toISOString()
      },
      'fetch-ai': {
        id: 'fetch-ai',
        symbol: 'fet',
        name: 'Fetch.ai',
        current_price: 1.85,
        market_cap: 1560000000,
        total_volume: 89000000,
        price_change_percentage_24h: 3.1,
        price_change_percentage_7d_in_currency: 18.4,
        price_change_percentage_30d_in_currency: 365.2,
        circulating_supply: 843000000,
        total_supply: 1152997575,
        fully_diluted_valuation: 2130000000,
        last_updated: new Date().toISOString()
      },
      'chainlink': {
        id: 'chainlink',
        symbol: 'link',
        name: 'Chainlink',
        current_price: 14.67,
        market_cap: 8650000000,
        total_volume: 445000000,
        price_change_percentage_24h: -1.2,
        price_change_percentage_7d_in_currency: 8.9,
        price_change_percentage_30d_in_currency: 28.9,
        circulating_supply: 590000000,
        total_supply: 1000000000,
        fully_diluted_valuation: 14670000000,
        last_updated: new Date().toISOString()
      }
    };

    return tokenIds.map(id => fallbackTokens[id]).filter(Boolean);
  }

  private getFallbackGlobalData(): any {
    return {
      data: {
        active_cryptocurrencies: 13500,
        upcoming_icos: 0,
        ongoing_icos: 49,
        ended_icos: 3376,
        markets: 1050,
        total_market_cap: {
          usd: 3420000000000
        },
        total_volume: {
          usd: 89500000000
        },
        market_cap_percentage: {
          btc: 58.2,
          eth: 12.8
        },
        market_cap_change_percentage_24h_usd: 2.1,
        updated_at: Math.floor(Date.now() / 1000)
      }
    };
  }

  async getTrendingTokens(): Promise<any> {
    const cacheKey = 'trending-tokens';
    
    try {
      const url = `${COINGECKO_BASE_URL}/search/trending`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      
      // Try to return last known good data
      const cachedData = dataCache.get<any>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached trending data (${Math.round((dataCache.getAge(cacheKey) || 0) / 60000)} minutes old)`);
        return cachedData;
      }
      
      // Fall back to static data only if no cache available
      console.warn('No cached trending data available, using static fallback');
      const fallbackData = {
        coins: [
          { item: { id: 'render-token', name: 'Render', symbol: 'RNDR', market_cap_rank: 45 } },
          { item: { id: 'fetch-ai', name: 'Fetch.ai', symbol: 'FET', market_cap_rank: 67 } },
          { item: { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', market_cap_rank: 15 } }
        ]
      };
      return fallbackData;
    }
  }

  async searchTokens(query: string): Promise<any> {
    const cacheKey = `search-${query}`;
    
    try {
      const url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, data, 5 * 60 * 1000); // 5 minute TTL for search
      
      return data;
    } catch (error) {
      console.error('Error searching tokens:', error);
      
      // Try to return last known good data
      const cachedData = dataCache.get<any>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached search data (${Math.round((dataCache.getAge(cacheKey) || 0) / 60000)} minutes old)`);
        return cachedData;
      }
      
      // Fall back to static data only if no cache available
      console.warn('No cached search data available, using static fallback');
      const fallbackData = {
        coins: [
          { id: 'render-token', name: 'Render', symbol: 'RNDR', market_cap_rank: 45 },
          { id: 'fetch-ai', name: 'Fetch.ai', symbol: 'FET', market_cap_rank: 67 },
          { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', market_cap_rank: 15 }
        ]
      };
      return fallbackData;
    }
  }

  async getTokenDetails(tokenId: string): Promise<any> {
    const cacheKey = `token-details-${tokenId}`;
    
    try {
      const url = `${COINGECKO_BASE_URL}/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching token details:', error);
      
      // Try to return last known good data
      const cachedData = dataCache.get<any>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached token details (${Math.round((dataCache.getAge(cacheKey) || 0) / 60000)} minutes old)`);
        return cachedData;
      }
      
      // No fallback for token details - throw error
      throw error;
    }
  }

  async getTopTokensByCategory(category: string, limit: number = 50): Promise<CoinGeckoToken[]> {
    const cacheKey = `category-${category}-${limit}`;
    
    try {
      const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&category=${category}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d,30d`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching category tokens:', error);
      
      // Try to return last known good data
      const cachedData = dataCache.get<CoinGeckoToken[]>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached category data (${Math.round((dataCache.getAge(cacheKey) || 0) / 60000)} minutes old)`);
        return cachedData;
      }
      
      // Fall back to static data only if no cache available
      console.warn('No cached category data available, using static fallback');
      return this.getFallbackCategoryTokens(category, limit);
    }
  }

  private getFallbackCategoryTokens(category: string, limit: number): CoinGeckoToken[] {
    const aiTokens: CoinGeckoToken[] = [
      {
        id: 'render-token',
        symbol: 'rndr',
        name: 'Render',
        current_price: 7.42,
        market_cap: 3850000000,
        total_volume: 125000000,
        price_change_percentage_24h: 5.2,
        price_change_percentage_7d_in_currency: 12.8,
        price_change_percentage_30d_in_currency: 410.5,
        circulating_supply: 518000000,
        total_supply: 536870912,
        fully_diluted_valuation: 3980000000,
        last_updated: new Date().toISOString()
      },
      {
        id: 'fetch-ai',
        symbol: 'fet',
        name: 'Fetch.ai',
        current_price: 1.85,
        market_cap: 1560000000,
        total_volume: 89000000,
        price_change_percentage_24h: 3.1,
        price_change_percentage_7d_in_currency: 18.4,
        price_change_percentage_30d_in_currency: 365.2,
        circulating_supply: 843000000,
        total_supply: 1152997575,
        fully_diluted_valuation: 2130000000,
        last_updated: new Date().toISOString()
      }
    ];

    const depinTokens: CoinGeckoToken[] = [
      {
        id: 'helium',
        symbol: 'hnt',
        name: 'Helium',
        current_price: 6.85,
        market_cap: 1120000000,
        total_volume: 45000000,
        price_change_percentage_24h: 2.8,
        price_change_percentage_7d_in_currency: 15.2,
        price_change_percentage_30d_in_currency: 180.3,
        circulating_supply: 163000000,
        total_supply: 223000000,
        fully_diluted_valuation: 1530000000,
        last_updated: new Date().toISOString()
      },
      {
        id: 'chainlink',
        symbol: 'link',
        name: 'Chainlink',
        current_price: 14.67,
        market_cap: 8650000000,
        total_volume: 445000000,
        price_change_percentage_24h: -1.2,
        price_change_percentage_7d_in_currency: 8.9,
        price_change_percentage_30d_in_currency: 28.9,
        circulating_supply: 590000000,
        total_supply: 1000000000,
        fully_diluted_valuation: 14670000000,
        last_updated: new Date().toISOString()
      }
    ];

    if (category === 'artificial-intelligence') {
      return aiTokens.slice(0, limit);
    } else if (category === 'infrastructure') {
      return depinTokens.slice(0, limit);
    }

    return [...aiTokens, ...depinTokens].slice(0, limit);
  }

  async getGitHubRepoData(owner: string, repo: string): Promise<GitHubRepo> {
    const cacheKey = `github-repo-${owner}-${repo}`;
    
    try {
      const url = `${GITHUB_BASE_URL}/repos/${owner}/${repo}`;
      
      const response = await this.fetchWithRateLimit(url, githubLimiter);
      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, data, 60 * 60 * 1000); // 1 hour TTL for GitHub data
      
      return data;
    } catch (error) {
      console.error('Error fetching GitHub repo data:', error);
      
      // Try to return last known good data
      const cachedData = dataCache.get<GitHubRepo>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached GitHub repo data (${Math.round((dataCache.getAge(cacheKey) || 0) / 60000)} minutes old)`);
        return cachedData;
      }
      
      // No fallback for GitHub data - throw error
      throw error;
    }
  }

  async getGitHubCommitActivity(owner: string, repo: string): Promise<GitHubCommitActivity[]> {
    const cacheKey = `github-commits-${owner}-${repo}`;
    
    try {
      const url = `${GITHUB_BASE_URL}/repos/${owner}/${repo}/stats/commit_activity`;
      
      const response = await this.fetchWithRateLimit(url, githubLimiter);
      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, data || [], 60 * 60 * 1000); // 1 hour TTL
      
      return data || [];
    } catch (error) {
      console.error('Error fetching GitHub commit activity:', error);
      
      // Try to return last known good data
      const cachedData = dataCache.get<GitHubCommitActivity[]>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached GitHub commit data (${Math.round((dataCache.getAge(cacheKey) || 0) / 60000)} minutes old)`);
        return cachedData;
      }
      
      // Return empty array if no cache
      return [];
    }
  }

  async getGitHubContributors(owner: string, repo: string): Promise<any[]> {
    const cacheKey = `github-contributors-${owner}-${repo}`;
    
    try {
      const url = `${GITHUB_BASE_URL}/repos/${owner}/${repo}/contributors?per_page=100`;
      
      const response = await this.fetchWithRateLimit(url, githubLimiter);
      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, data || [], 60 * 60 * 1000); // 1 hour TTL
      
      return data || [];
    } catch (error) {
      console.error('Error fetching GitHub contributors:', error);
      
      // Try to return last known good data
      const cachedData = dataCache.get<any[]>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached GitHub contributors data (${Math.round((dataCache.getAge(cacheKey) || 0) / 60000)} minutes old)`);
        return cachedData;
      }
      
      // Return empty array if no cache
      return [];
    }
  }

  // Get exchange data
  async getExchanges(): Promise<any[]> {
    const cacheKey = 'exchanges';
    
    try {
      const url = `${COINGECKO_BASE_URL}/exchanges?per_page=100&page=1`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, data, 60 * 60 * 1000); // 1 hour TTL
      
      return data;
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      
      // Try to return last known good data
      const cachedData = dataCache.get<any[]>(cacheKey);
      if (cachedData) {
        console.warn(`Using cached exchanges data (${Math.round((dataCache.getAge(cacheKey) || 0) / 60000)} minutes old)`);
        return cachedData;
      }
      
      // Return empty array if no cache
      return [];
    }
  }
}

export const cryptoDataService = new CryptoDataService();