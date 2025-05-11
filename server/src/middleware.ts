import { Env, createDatabase } from './db';
import { ApiResponse, HandlerContext, Route } from './types';
import { getUserFromRequest } from './db';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleRequest(
  request: Request,
  env: Env,
  routes: Route[]
): Promise<Response> {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
      return createResponse({ error: { message: 'Not Found' } }, 404);
    }

    // Extract path parameters
    const paramNames = (route.path.match(/\{([^}]+)\}/g) || []).map(p => p.slice(1, -1));
    const paramValues = url.pathname.match(new RegExp(route.path.replace(/\{[^}]+\}/g, '([^/]+)')))?.slice(1) || [];
    const params = Object.fromEntries(paramNames.map((name, i) => [name, paramValues[i]]));

    // Get handler for HTTP method
    const method = request.method.toLowerCase() as keyof typeof route.handler;
    const handler = route.handler[method];

    if (!handler) {
      return createResponse({ error: { message: 'Method Not Allowed' } }, 405);
    }

    // Create handler context with the correct type based on the method
    const context: HandlerContext<any> = {
      db,
      user,
      body: request.method !== 'GET' ? await request.json() : undefined,
      params,
    };

    // Execute handler
    const result = await handler(context);
    
    return createResponse(result);

  } catch (error) {
    console.error('Error processing request:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return createResponse(
      { error: { message, details: error instanceof Error ? error : undefined } },
      error instanceof Error && error.message === 'Authentication required' ? 401 : 400
    );
  }
}

function createResponse(body: ApiResponse | any, status: number = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
} 