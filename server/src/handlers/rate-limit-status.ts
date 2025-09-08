import { RouteHandler, HandlerContext } from '../types';
import { RateLimiter } from '../rateLimit';

export const rateLimitStatusHandler: RouteHandler<any> = {
  async get(context: HandlerContext) {
    try {
      const { user, env } = context;
      
      // Create a dummy request for the rate limiter
      const dummyRequest = new Request('https://example.com/api/rate-limit-status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const rateLimiter = new RateLimiter(env);
      const status = await rateLimiter.getRateLimitStatus(user, dummyRequest);
      
      return {
        status,
        user: user ? {
          id: user.id,
          email: user.email,
          tier: user.user_metadata?.tier || user.app_metadata?.tier || 'free'
        } : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Rate limit status error:', error);
      throw error;
    }
  }
};
