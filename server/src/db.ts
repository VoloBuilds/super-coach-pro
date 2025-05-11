import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

export interface Env {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    DB: D1Database;
    OPENAI_API_KEY: string;
}

export interface WorkoutData {
    id?: string;
    name: string;
    description: string;
    exercises: Array<{
        name: string;
        sets: any[];
        notes: string;
        restBetweenSets: number;
    }>;
    estimatedDuration: number;
    user_id?: string;
}

export interface MealPlanData {
    id?: string;
    user_id?: string;
    name: string;
    description?: string;
    total_nutrition?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    totalNutrition?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
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
            };
        }>;
    }> | Record<string, {
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
            };
        }>;
    } | null>;
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Database interface for workouts
export interface WorkoutDB {
    getWorkouts(userId: string): Promise<WorkoutData[]>;
    createWorkout(workout: WorkoutData): Promise<WorkoutData>;
    updateWorkout(workoutId: string, workout: WorkoutData, userId: string): Promise<WorkoutData>;
    deleteWorkout(workoutId: string, userId: string): Promise<void>;
}

// Database interface for meal plans
export interface MealPlanDB {
    getMealPlans(userId: string): Promise<MealPlanData[]>;
    createMealPlan(mealPlan: MealPlanData): Promise<MealPlanData>;
    updateMealPlan(mealPlanId: string, mealPlan: MealPlanData, userId: string): Promise<MealPlanData>;
    deleteMealPlan(mealPlanId: string, userId: string): Promise<void>;
}

class SupabaseDB implements WorkoutDB, MealPlanDB {
    private client: SupabaseClient;

    constructor(env: Env) {
        this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    }

    async getWorkouts(userId: string): Promise<WorkoutData[]> {
        const { data, error } = await this.client
            .from('workouts')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        if (!data) return [];

        return data.map(transformWorkoutToClientFormat);
    }

    async createWorkout(workout: WorkoutData): Promise<WorkoutData> {
        const workoutData = prepareWorkoutData(workout);
        const { data, error } = await this.client
            .from('workouts')
            .insert([workoutData])
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Failed to create workout');

        return transformWorkoutToClientFormat(data);
    }

    async updateWorkout(workoutId: string, workout: WorkoutData, userId: string): Promise<WorkoutData> {
        const workoutData = prepareWorkoutData({ ...workout, user_id: userId });
        
        // First try to update
        const { data, error } = await this.client
            .from('workouts')
            .update(workoutData)
            .eq('id', workoutId)
            .eq('user_id', userId)
            .select()
            .single();

        // If no rows affected, create new record
        if (error?.code === 'PGRST116') {
            const { data: newData, error: insertError } = await this.client
                .from('workouts')
                .insert([{ ...workoutData, id: workoutId }])
                .select()
                .single();

            if (insertError) throw insertError;
            if (!newData) throw new Error('Failed to create workout');

            return transformWorkoutToClientFormat(newData);
        }

        if (error) throw error;
        if (!data) throw new Error('Workout not found or access denied');

        return transformWorkoutToClientFormat(data);
    }

    async deleteWorkout(workoutId: string, userId: string): Promise<void> {
        const { error } = await this.client
            .from('workouts')
            .delete()
            .eq('id', workoutId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    async getMealPlans(userId: string): Promise<MealPlanData[]> {
        const { data, error } = await this.client
            .from('meal_plans')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        if (!data) return [];

        return data.map(transformMealPlanToClientFormat);
    }

    async createMealPlan(mealPlan: MealPlanData): Promise<MealPlanData> {
        const mealPlanData = prepareMealPlanData(mealPlan);
        const { data, error } = await this.client
            .from('meal_plans')
            .insert([mealPlanData])
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Failed to create meal plan');

        return transformMealPlanToClientFormat(data);
    }

    async updateMealPlan(mealPlanId: string, mealPlan: MealPlanData, userId: string): Promise<MealPlanData> {
        const mealPlanData = prepareMealPlanData({ ...mealPlan, user_id: userId });
        const { data, error } = await this.client
            .from('meal_plans')
            .update(mealPlanData)
            .eq('id', mealPlanId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Meal plan not found or access denied');

        return transformMealPlanToClientFormat(data);
    }

    async deleteMealPlan(mealPlanId: string, userId: string): Promise<void> {
        const { error } = await this.client
            .from('meal_plans')
            .delete()
            .eq('id', mealPlanId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    async getUser(token: string): Promise<User | null> {
        const { data: { user }, error } = await this.client.auth.getUser(token);
        if (error) {
            console.error('Error getting user:', error);
            return null;
        }
        return user;
    }
}

// Helper function to prepare workout data for database
interface DatabaseWorkoutData {
    name: string;
    description: string;
    exercises: Array<{
        name: string;
        sets: any[];
        notes: string;
        restBetweenSets: number;
    }>;
    estimated_duration: number;
    user_id?: string;
}

export function prepareWorkoutData(workout: WorkoutData): DatabaseWorkoutData {
    const { id, estimatedDuration, ...data } = workout;
    return {
        ...data,
        estimated_duration: estimatedDuration
    };
}

// Transform database workout to client format
export function transformWorkoutToClientFormat(workout: any): WorkoutData {
    const { estimated_duration, created_at, updated_at, ...rest } = workout;
    return {
        ...rest,
        estimatedDuration: Number(estimated_duration)
    };
}

export function prepareMealPlanData(mealPlan: MealPlanData): Partial<MealPlanData> {
    const { id, created_at, updated_at, totalNutrition, createdAt, updatedAt, ...data } = mealPlan;
    return {
        ...data,
        total_nutrition: totalNutrition && {
            calories: Number(totalNutrition.calories),
            protein: Number(totalNutrition.protein),
            carbs: Number(totalNutrition.carbs),
            fat: Number(totalNutrition.fat)
        },
        meals: Array.isArray(data.meals) ? data.meals : Object.entries(data.meals || {}).map(([type, meal]) => {
            if (!meal) return null;
            return {
                type,
                ...meal,
            };
        }).filter((meal): meal is NonNullable<typeof meal> => meal !== null)
    };
}

export function transformMealPlanToClientFormat(data: MealPlanData): MealPlanData {
    const { total_nutrition, created_at, updated_at, meals, ...rest } = data;
    
    const mealsRecord = Array.isArray(meals) 
        ? meals.reduce<Record<string, any>>((acc, meal) => {
            if (meal && meal.type) {
                const { type, ...mealData } = meal;
                acc[type] = mealData;
            }
            return acc;
        }, {})
        : meals;

    return {
        ...rest,
        totalNutrition: total_nutrition && {
            calories: Number(total_nutrition.calories),
            protein: Number(total_nutrition.protein),
            carbs: Number(total_nutrition.carbs),
            fat: Number(total_nutrition.fat)
        },
        meals: mealsRecord,
        createdAt: created_at,
        updatedAt: updated_at
    };
}

// Factory function to create database instance
export function createDatabase(env: Env): SupabaseDB {
    return new SupabaseDB(env);
}

// Function to get user from request
export async function getUserFromRequest(request: Request, env: Env): Promise<User | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    const db = createDatabase(env);
    return db.getUser(token);
} 