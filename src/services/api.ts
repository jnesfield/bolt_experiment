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
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
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
      throw error;
    }
  }

  async getTokenDetails(tokenId: string): Promise<any> {
    try {
      const url = `${COINGECKO_BASE_URL}/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching token details:', error);
      throw error;
    }
  }

  async getTopTokensByCategory(category: string, limit: number = 50): Promise<CoinGeckoToken[]> {
    try {
      const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&category=${category}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d,30d`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching category tokens:', error);
      throw error;
    }
  }

  async getTrendingTokens(): Promise<any> {
    try {
      const url = `${COINGECKO_BASE_URL}/search/trending`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      throw error;
    }
  }

  async getGitHubRepoData(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const url = `${GITHUB_BASE_URL}/repos/${owner}/${repo}`;
      
      const response = await this.fetchWithRateLimit(url, githubLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching GitHub repo data:', error);
      throw error;
    }
  }

  async getGitHubCommitActivity(owner: string, repo: string): Promise<GitHubCommitActivity[]> {
    try {
      const url = `${GITHUB_BASE_URL}/repos/${owner}/${repo}/stats/commit_activity`;
      
      const response = await this.fetchWithRateLimit(url, githubLimiter);
      const data = await response.json();
      
      return data || [];
    } catch (error) {
      console.error('Error fetching GitHub commit activity:', error);
      throw error;
    }
  }

  async getGitHubContributors(owner: string, repo: string): Promise<any[]> {
    try {
      const url = `${GITHUB_BASE_URL}/repos/${owner}/${repo}/contributors?per_page=100`;
      
      const response = await this.fetchWithRateLimit(url, githubLimiter);
      const data = await response.json();
      
      return data || [];
    } catch (error) {
      console.error('Error fetching GitHub contributors:', error);
      throw error;
    }
  }

  // Search for tokens by name or symbol
  async searchTokens(query: string): Promise<any> {
    try {
      const url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error searching tokens:', error);
      throw error;
    }
  }

  // Get global market data
  async getGlobalMarketData(): Promise<any> {
    try {
      const url = `${COINGECKO_BASE_URL}/global`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching global market data:', error);
      throw error;
    }
  }

  // Get exchange data
  async getExchanges(): Promise<any[]> {
    try {
      const url = `${COINGECKO_BASE_URL}/exchanges?per_page=100&page=1`;
      
      const response = await this.fetchWithRateLimit(url, coinGeckoLimiter);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      throw error;
    }
  }
}

export const cryptoDataService = new CryptoDataService();