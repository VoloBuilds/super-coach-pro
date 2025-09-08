import OpenAI from 'openai';
import { RouteHandler, HandlerContext } from '../types';
import { WorkoutData, MealPlanData } from '../db';
import { estimateTokenCount, estimateCost } from '../rateLimit';

const systemPrompt = `You are an AI fitness coach that helps users create personalized workout and meal plans. 
Your responses should be focused on health, fitness, and nutrition advice. 
When discussing workout plans, consider the user's goals, fitness level, and any limitations they mention.
For meal plans, focus on balanced nutrition and consider any dietary restrictions or preferences mentioned.

When suggesting workouts or meal plans, you MUST format them according to these TypeScript interfaces:

interface WorkoutData {
    name: string;
    description: string;
    estimatedDuration: number;
    exercises: Array<{
        name: string;
        sets: Array<{
            weight?: number;
            reps?: number;
            duration?: number;
            distance?: number;
            completed: boolean;
            weightType: 'kg' | 'lbs' | 'bodyweight'
        }>;
        notes: string;
        restBetweenSets: number;
    }>;
}

interface MealPlanData {
    name: string;
    description?: string;
    meals: Array<{
        type: string;
        name: string;
        time: string;
        foods: Array<{
            name: string;
            portion: number;
            unit: string;
            nutrition: {
                calories: number;
                protein: number;
                carbs: number;
                fat: number;
            }
        }>
    }>;
    totalNutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

When suggesting a workout or meal plan, format your response as a JSON object with two fields:
1. "message": Your natural language response and explanation
2. "data": The properly formatted WorkoutData or MealPlanData object

Example format:
{
    "message": "Here's a workout plan I recommend...",
    "data": {
        // WorkoutData or MealPlanData object here
    }
}`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const chatHandler: RouteHandler<any> = {
  async post(context: HandlerContext<{ message: string; history?: ChatMessage[] }>) {
    try {
      const { body, env, user, rateLimiter } = context;

      if (!env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY
      });

      // Initialize conversation with system prompt
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...(body.history || []),
        { role: "user", content: body.message }
      ];

      // Estimate tokens and cost for rate limiting tracking
      const estimatedInputTokens = estimateTokenCount(messages, "gpt-4o-mini");
      const estimatedOutputTokens = 500; // Conservative estimate
      const estimatedCost = estimateCost(estimatedInputTokens, estimatedOutputTokens, "gpt-4o-mini");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0].message;

      // Record actual usage for rate limiting
      if (rateLimiter && user) {
        const actualInputTokens = completion.usage?.prompt_tokens || estimatedInputTokens;
        const actualOutputTokens = completion.usage?.completion_tokens || estimatedOutputTokens;
        const actualCost = estimateCost(actualInputTokens, actualOutputTokens, "gpt-4o-mini");
        
        // Create a dummy request object for recording (we need it for the rateLimiter interface)
        const dummyRequest = new Request('https://example.com/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        try {
          await rateLimiter.recordRequest(user, dummyRequest, actualInputTokens + actualOutputTokens, actualCost);
        } catch (recordError) {
          console.warn('Failed to record rate limit usage:', recordError);
          // Don't fail the request if rate limit recording fails
        }
      }

      // Try to parse the response as JSON if it contains workout or meal plan data
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response.content || '');
      } catch (e) {
        // If not JSON, just return the message as is
        parsedResponse = { message: response.content };
      }

      return {
        message: parsedResponse.message,
        data: parsedResponse.data,
        history: [...messages, { role: "assistant", content: response.content || '' }],
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }
}; 