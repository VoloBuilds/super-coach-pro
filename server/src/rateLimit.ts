import { Env } from './db';
import { User } from '@supabase/supabase-js';

// Rate limit configuration interface
export interface RateLimitConfig {
  // Basic limits per time window
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  
  // AI-specific limits
  tokensPerMinute?: number;
  tokensPerHour?: number;
  tokensPerDay?: number;
  
  // Cost-based limits (in cents)
  costPerMinute?: number;
  costPerHour?: number;
  costPerDay?: number;
}

// Default rate limits for different user tiers
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  free: {
    requestsPerMinute: 5,
    requestsPerHour: 20,
    requestsPerDay: 100,
    tokensPerMinute: 1000,
    tokensPerHour: 10000,
    tokensPerDay: 50000,
    costPerMinute: 10, // 10 cents
    costPerHour: 50,   // 50 cents
    costPerDay: 200    // $2
  },
  premium: {
    requestsPerMinute: 20,
    requestsPerHour: 100,
    requestsPerDay: 500,
    tokensPerMinute: 5000,
    tokensPerHour: 50000,
    tokensPerDay: 250000,
    costPerMinute: 50,  // 50 cents
    costPerHour: 300,   // $3
    costPerDay: 1000    // $10
  },
  enterprise: {
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    tokensPerMinute: 25000,
    tokensPerHour: 250000,
    tokensPerDay: 1000000,
    costPerMinute: 200, // $2
    costPerHour: 1200,  // $12
    costPerDay: 5000    // $50
  }
};

// Rate limit tracking data
export interface RateLimitData {
  requests: number;
  tokens: number;
  cost: number; // in cents
  resetTime: number;
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  limitType: string;
}

// Rate limit error
export class RateLimitError extends Error {
  constructor(
    public result: RateLimitResult,
    message: string = 'Rate limit exceeded'
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Rate limiter class
export class RateLimiter {
  private env: Env;
  
  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Get user's rate limit configuration based on their tier
   */
  private getUserRateLimit(user: User | null): RateLimitConfig {
    if (!user) {
      // Anonymous users get very limited access
      return {
        requestsPerMinute: 1,
        requestsPerHour: 5,
        requestsPerDay: 10,
        tokensPerMinute: 200,
        tokensPerHour: 1000,
        tokensPerDay: 2000,
        costPerMinute: 2,
        costPerHour: 10,
        costPerDay: 25
      };
    }

    // Check user metadata for tier information
    const userTier = user.user_metadata?.tier || user.app_metadata?.tier || 'free';
    return DEFAULT_RATE_LIMITS[userTier] || DEFAULT_RATE_LIMITS.free;
  }

  /**
   * Generate cache key for rate limiting
   */
  private getRateLimitKey(identifier: string, window: string): string {
    return `rate_limit:${identifier}:${window}`;
  }

  /**
   * Get current rate limit data from KV storage
   */
  private async getRateLimitData(
    identifier: string, 
    window: string
  ): Promise<RateLimitData> {
    const key = this.getRateLimitKey(identifier, window);
    
    try {
      // Try to get from KV store first (if available)
      if (this.env.RATE_LIMIT_KV) {
        const stored = await this.env.RATE_LIMIT_KV.get(key);
        if (stored) {
          const data = JSON.parse(stored) as RateLimitData;
          // Check if data is still valid (not expired)
          if (data.resetTime > Date.now()) {
            return data;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get rate limit data from KV:', error);
    }

    // Return fresh data if nothing found or expired
    const now = Date.now();
    const windowMs = this.getWindowMs(window);
    return {
      requests: 0,
      tokens: 0,
      cost: 0,
      resetTime: now + windowMs
    };
  }

  /**
   * Update rate limit data in storage
   */
  private async updateRateLimitData(
    identifier: string,
    window: string,
    data: RateLimitData,
    ttlSeconds: number
  ): Promise<void> {
    const key = this.getRateLimitKey(identifier, window);
    
    try {
      if (this.env.RATE_LIMIT_KV) {
        await this.env.RATE_LIMIT_KV.put(
          key, 
          JSON.stringify(data),
          { expirationTtl: ttlSeconds }
        );
      }
    } catch (error) {
      console.warn('Failed to update rate limit data in KV:', error);
    }
  }

  /**
   * Get window duration in milliseconds
   */
  private getWindowMs(window: string): number {
    switch (window) {
      case 'minute': return 60 * 1000;
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      default: return 60 * 1000;
    }
  }

  /**
   * Get TTL in seconds for storage
   */
  private getTtlSeconds(window: string): number {
    switch (window) {
      case 'minute': return 120; // 2 minutes buffer
      case 'hour': return 3720;  // 1 hour + 2 minutes buffer
      case 'day': return 86520;  // 1 day + 2 minutes buffer
      default: return 120;
    }
  }

  /**
   * Get user identifier for rate limiting
   */
  private getUserIdentifier(user: User | null, request: Request): string {
    if (user) {
      return `user:${user.id}`;
    }
    
    // For anonymous users, use IP address
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                    request.headers.get('X-Forwarded-For') || 
                    request.headers.get('X-Real-IP') || 
                    'anonymous';
    
    return `ip:${clientIP}`;
  }

  /**
   * Check if request is allowed under rate limits
   */
  async checkRateLimit(
    user: User | null,
    request: Request,
    estimatedTokens: number = 500,
    estimatedCost: number = 1 // in cents
  ): Promise<RateLimitResult> {
    const identifier = this.getUserIdentifier(user, request);
    const limits = this.getUserRateLimit(user);
    
    // Check all time windows
    const windows = ['minute', 'hour', 'day'] as const;
    
    for (const window of windows) {
      const data = await this.getRateLimitData(identifier, window);
      const limitKey = `requestsPer${window.charAt(0).toUpperCase() + window.slice(1)}` as keyof RateLimitConfig;
      const limit = limits[limitKey] as number;
      
      // Check if adding this request would exceed limits
      const newRequests = data.requests + 1;
      const newTokens = data.tokens + estimatedTokens;
      const newCost = data.cost + estimatedCost;
      
      // Check request limit
      if (newRequests > limit) {
        return {
          allowed: false,
          limit,
          remaining: Math.max(0, limit - data.requests),
          resetTime: data.resetTime,
          retryAfter: Math.ceil((data.resetTime - Date.now()) / 1000),
          limitType: `requests_per_${window}`
        };
      }
      
      // Check token limit if applicable
      const tokenLimitKey = `tokensPer${window.charAt(0).toUpperCase() + window.slice(1)}` as keyof RateLimitConfig;
      const tokenLimit = limits[tokenLimitKey] as number | undefined;
      if (tokenLimit && newTokens > tokenLimit) {
        return {
          allowed: false,
          limit: tokenLimit,
          remaining: Math.max(0, tokenLimit - data.tokens),
          resetTime: data.resetTime,
          retryAfter: Math.ceil((data.resetTime - Date.now()) / 1000),
          limitType: `tokens_per_${window}`
        };
      }
      
      // Check cost limit if applicable
      const costLimitKey = `costPer${window.charAt(0).toUpperCase() + window.slice(1)}` as keyof RateLimitConfig;
      const costLimit = limits[costLimitKey] as number | undefined;
      if (costLimit && newCost > costLimit) {
        return {
          allowed: false,
          limit: costLimit,
          remaining: Math.max(0, costLimit - data.cost),
          resetTime: data.resetTime,
          retryAfter: Math.ceil((data.resetTime - Date.now()) / 1000),
          limitType: `cost_per_${window}`
        };
      }
    }
    
    // All checks passed, request is allowed
    const minuteData = await this.getRateLimitData(identifier, 'minute');
    const minuteLimit = limits.requestsPerMinute;
    
    return {
      allowed: true,
      limit: minuteLimit,
      remaining: Math.max(0, minuteLimit - minuteData.requests),
      resetTime: minuteData.resetTime,
      limitType: 'requests_per_minute'
    };
  }

  /**
   * Record successful request in rate limit counters
   */
  async recordRequest(
    user: User | null,
    request: Request,
    actualTokens: number,
    actualCost: number
  ): Promise<void> {
    const identifier = this.getUserIdentifier(user, request);
    const windows = ['minute', 'hour', 'day'] as const;
    
    for (const window of windows) {
      const data = await this.getRateLimitData(identifier, window);
      
      // Update counters
      data.requests += 1;
      data.tokens += actualTokens;
      data.cost += actualCost;
      
      // Save updated data
      const ttl = this.getTtlSeconds(window);
      await this.updateRateLimitData(identifier, window, data, ttl);
    }
  }

  /**
   * Get current rate limit status for a user
   */
  async getRateLimitStatus(
    user: User | null,
    request: Request
  ): Promise<Record<string, RateLimitResult>> {
    const identifier = this.getUserIdentifier(user, request);
    const limits = this.getUserRateLimit(user);
    const windows = ['minute', 'hour', 'day'] as const;
    const status: Record<string, RateLimitResult> = {};
    
    for (const window of windows) {
      const data = await this.getRateLimitData(identifier, window);
      const limitKey = `requestsPer${window.charAt(0).toUpperCase() + window.slice(1)}` as keyof RateLimitConfig;
      const limit = limits[limitKey] as number;
      
      status[window] = {
        allowed: data.requests < limit,
        limit,
        remaining: Math.max(0, limit - data.requests),
        resetTime: data.resetTime,
        limitType: `requests_per_${window}`
      };
    }
    
    return status;
  }
}

/**
 * Estimate token count for OpenAI API call
 * This is a rough estimation - actual token count may vary
 */
export function estimateTokenCount(
  messages: Array<{ role: string; content: string }>,
  model: string = 'gpt-4o-mini'
): number {
  // Rough estimation: ~4 characters per token for English text
  const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
  const estimatedTokens = Math.ceil(totalChars / 4);
  
  // Add overhead for message formatting and system prompts
  const overhead = messages.length * 10;
  
  return estimatedTokens + overhead;
}

/**
 * Estimate cost for OpenAI API call in cents
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number = 200,
  model: string = 'gpt-4o-mini'
): number {
  // OpenAI pricing (as of 2024) in cents per 1K tokens
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o-mini': { input: 0.015, output: 0.06 }, // $0.000015 per input token, $0.00006 per output token
    'gpt-4o': { input: 0.5, output: 1.5 },
    'gpt-4': { input: 3, output: 6 },
    'gpt-3.5-turbo': { input: 0.05, output: 0.15 }
  };
  
  const modelPricing = pricing[model] || pricing['gpt-4o-mini'];
  const inputCost = (inputTokens / 1000) * modelPricing.input;
  const outputCost = (outputTokens / 1000) * modelPricing.output;
  
  return Math.ceil((inputCost + outputCost) * 100); // Convert to cents and round up
}
