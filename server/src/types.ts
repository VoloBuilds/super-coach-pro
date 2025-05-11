import { User } from '@supabase/supabase-js';
import { WorkoutDB, MealPlanDB, Env } from './db';

export interface HandlerContext<T = unknown> {
  db: WorkoutDB & MealPlanDB;
  user: User | null;
  body: T;
  params: Record<string, string>;
  env: Env;
}

export interface RouteHandler<T = unknown> {
  get?: (context: HandlerContext) => Promise<T[]>;
  post?: (context: HandlerContext<T>) => Promise<T>;
  put?: (context: HandlerContext<T>) => Promise<T>;
  delete?: (context: HandlerContext<DeleteRequestBody>) => Promise<null>;
}

export interface Route<T = unknown> {
  path: string;
  handler: RouteHandler<T>;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

export interface DeleteRequestBody {
  id: string;
} 