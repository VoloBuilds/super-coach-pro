import { Env, createDatabase } from './db';
import { ApiResponse, HandlerContext, Route } from './types';
import { getUserFromRequest } from './db';
import { RateLimiter, RateLimitError } from './rateLimit';

// Allowed origins for CORS - supports both development and production
const ALLOWED_ORIGINS = [
  'http://localhost:5173',  // Vite dev server default port
  'http://localhost:3000',  // Alternative dev server port
  'http://localhost:4173',  // Vite preview server port
  'https://supercoachpro-api.volobuilds1.workers.dev', // Production domain (if frontend served from same domain)
  // Add your production frontend domain here when deployed
  'https://supercoach.pro'
];

// Base CORS headers without origin
const baseCorsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Function to get CORS headers with validated origin
function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  
  // Check if origin is in allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      ...baseCorsHeaders,
      'Access-Control-Allow-Origin': origin,
    };
  }
  
  // For requests without Origin header (like direct API calls), allow the first dev origin
  // This maintains compatibility with tools like Postman or curl
  if (!origin) {
    return {
      ...baseCorsHeaders,
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
    };
  }
  
  // Reject requests from unauthorized origins
  return baseCorsHeaders;
}

export async function handleRequest(
  request: Request,
  env: Env,
  routes: Route[]
): Promise<Response> {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(request) });
  }

  try {
    const url = new URL(request.url);
    const db = createDatabase(env);
    const user = await getUserFromRequest(request, env);
    
    // Find matching route
    const route = routes.find(r => {
      const pattern = new RegExp(`^${r.path.replace(/\{[^}]+\}/g, '([^/]+)')}$`);
      return pattern.test(url.pathname);
    });

    if (!route) {
      return createResponse({ error: { message: 'Not Found' } }, 404, request);
    }

    // Extract path parameters
    const paramNames = (route.path.match(/\{([^}]+)\}/g) || []).map(p => p.slice(1, -1));
    const paramValues = url.pathname.match(new RegExp(route.path.replace(/\{[^}]+\}/g, '([^/]+)')))?.slice(1) || [];
    const params = Object.fromEntries(paramNames.map((name, i) => [name, paramValues[i]]));

    // Get handler for HTTP method
    const method = request.method.toLowerCase() as keyof typeof route.handler;
    const handler = route.handler[method];

    if (!handler) {
      return createResponse({ error: { message: 'Method Not Allowed' } }, 405, request);
    }

    // Check rate limits for AI chat endpoints
    let rateLimitHeaders: Record<string, string> = {};
    if (url.pathname === '/api/chat' && method === 'post') {
      const rateLimiter = new RateLimiter(env);
      
      try {
        // Get request body for token estimation
        const body = await request.json();
        
        // Re-create request with cloned body since we consumed it
        const clonedRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(body),
        });
        
        const rateLimitResult = await rateLimiter.checkRateLimit(user, clonedRequest);
        
        // Add rate limit headers
        rateLimitHeaders = {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
          'X-RateLimit-Type': rateLimitResult.limitType,
        };
        
        if (!rateLimitResult.allowed) {
          if (rateLimitResult.retryAfter) {
            rateLimitHeaders = {
              ...rateLimitHeaders,
              'Retry-After': rateLimitResult.retryAfter.toString()
            };
          }
          
          return createResponse(
            { 
              error: { 
                message: 'Rate limit exceeded', 
                details: {
                  limitType: rateLimitResult.limitType,
                  limit: rateLimitResult.limit,
                  resetTime: rateLimitResult.resetTime,
                  retryAfter: rateLimitResult.retryAfter
                }
              } 
            }, 
            429, 
            request,
            rateLimitHeaders
          );
        }
        
        // Create handler context with the body we already parsed
        const context: HandlerContext<any> = {
          db,
          user,
          body,
          params,
          env,
          rateLimiter // Add rate limiter to context for recording actual usage
        };

        // Execute handler
        const result = await handler(context);
        
        return createResponse(result, 200, request, rateLimitHeaders);
      } catch (rateLimitError) {
        if (rateLimitError instanceof RateLimitError) {
          rateLimitHeaders = {
            'X-RateLimit-Limit': rateLimitError.result.limit.toString(),
            'X-RateLimit-Remaining': rateLimitError.result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitError.result.resetTime / 1000).toString(),
            'X-RateLimit-Type': rateLimitError.result.limitType,
          };
          
          if (rateLimitError.result.retryAfter) {
            rateLimitHeaders = {
              ...rateLimitHeaders,
              'Retry-After': rateLimitError.result.retryAfter.toString()
            };
          }
          
          return createResponse(
            { 
              error: { 
                message: rateLimitError.message, 
                details: rateLimitError.result 
              } 
            }, 
            429, 
            request,
            rateLimitHeaders
          );
        }
        
        // Re-throw other errors
        throw rateLimitError;
      }
    }

    // Create handler context with the correct type based on the method
    const context: HandlerContext<any> = {
      db,
      user,
      body: request.method !== 'GET' ? await request.json() : undefined,
      params,
      env
    };

    // Execute handler
    const result = await handler(context);
    
    return createResponse(result, 200, request, rateLimitHeaders);

  } catch (error) {
    console.error('Error processing request:', error);
    
    if (error instanceof RateLimitError) {
      let rateLimitHeaders: Record<string, string> = {
        'X-RateLimit-Limit': error.result.limit.toString(),
        'X-RateLimit-Remaining': error.result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(error.result.resetTime / 1000).toString(),
        'X-RateLimit-Type': error.result.limitType,
      };
      
      if (error.result.retryAfter) {
        rateLimitHeaders = {
          ...rateLimitHeaders,
          'Retry-After': error.result.retryAfter.toString()
        };
      }
      
      return createResponse(
        { 
          error: { 
            message: error.message, 
            details: error.result 
          } 
        }, 
        429, 
        request,
        rateLimitHeaders
      );
    }
    
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return createResponse(
      { error: { message, details: error instanceof Error ? error : undefined } },
      error instanceof Error && error.message === 'Authentication required' ? 401 : 500,
      request
    );
  }
}

function createResponse(
  body: ApiResponse | any, 
  status: number = 200, 
  request?: Request,
  extraHeaders?: Record<string, string>
): Response {
  const corsHeaders = request ? getCorsHeaders(request) : baseCorsHeaders;
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
} 