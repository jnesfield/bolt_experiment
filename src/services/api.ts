const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const GITHUB_BASE_URL = 'https://api.github.com';

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

const coinGeckoLimiter = new RateLimiter(10, 60000); // 10 requests per minute
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
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      // If it's a network error (CORS, connection failed, etc.), throw with more context
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Network error: Unable to connect to API. This may be due to CORS restrictions or network connectivity issues.`);
      }
      throw error;
    }
  }

  async getTokenData(tokenIds: string[]): Promise<CoinGeckoToken[]> {
    try {
      const idsParam = tokenIds.join(',');
      const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h,7d,30d`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching token data:', error);
      // Return fallback data for development
      return this.getFallbackTokenData(tokenIds);
    }
  }

  async getGlobalMarketData(): Promise<any> {
    try {
      const url = `${COINGECKO_BASE_URL}/global`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching global market data:', error);
      // Return fallback data for development
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
    try {
      const url = `${COINGECKO_BASE_URL}/search/trending`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      // Return fallback trending data
      return {
        coins: [
          { item: { id: 'render-token', name: 'Render', symbol: 'RNDR', market_cap_rank: 45 } },
          { item: { id: 'fetch-ai', name: 'Fetch.ai', symbol: 'FET', market_cap_rank: 67 } },
          { item: { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', market_cap_rank: 15 } }
        ]
      };
    }
  }

  async searchTokens(query: string): Promise<any> {
    try {
      const url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error searching tokens:', error);
      // Return fallback search results
      return {
        coins: [
          { id: 'render-token', name: 'Render', symbol: 'RNDR', market_cap_rank: 45 },
          { id: 'fetch-ai', name: 'Fetch.ai', symbol: 'FET', market_cap_rank: 67 },
          { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', market_cap_rank: 15 }
        ]
      };
    }
  }
}

export const cryptoDataService = new CryptoDataService();