import { Exercise, Workout } from '@/types/workout';
import { MealPlan } from '@/types/diet';
import { supabase } from './supabase';

const API_BASE_URL = 'http://localhost:8787'; // Update this based on your deployment environment

export class ServerCommError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ServerCommError';
    }
}

async function getAuthHeader(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    return {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {})
    };
}

export const serverComm = {
    async fetchExercises(): Promise<Exercise[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/exercises`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new ServerCommError(`Failed to fetch exercises: ${message}`);
        }
    },

    async getWorkouts(): Promise<Workout[]> {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/api/workouts`, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched workouts:', data);
            return data;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new ServerCommError(`Failed to fetch workouts: ${message}`);
        }
    },

    async saveWorkout(workout: Workout): Promise<Workout> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Debug - Current session:', session);
            console.log('Debug - User ID from session:', session?.user?.id);
            
            const headers = await getAuthHeader();
            console.log('Debug - Auth headers:', headers);
            
            const method = workout.id ? 'PUT' : 'POST';
            const url = `${API_BASE_URL}/api/workouts${workout.id ? `/${workout.id}` : ''}`;
            
            // Log the workout data being sent
            console.log('Debug - Sending workout data:', workout);
            
            const response = await fetch(url, {
                method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workout)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Debug - Server error response:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new ServerCommError(`Failed to save workout: ${message}`);
        }
    },

    async deleteWorkout(workoutId: string): Promise<void> {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/api/workouts`, {
                method: 'DELETE',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: workoutId })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new ServerCommError(`Failed to delete workout: ${message}`);
        }
    },

    async getMealPlans(): Promise<MealPlan[]> {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/api/meal-plans`, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched meal plans:', data);
            return data;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new ServerCommError(`Failed to fetch meal plans: ${message}`);
        }
    },

    async saveMealPlan(mealPlan: MealPlan): Promise<MealPlan> {
        try {
            const headers = await getAuthHeader();
            
            // For new meal plans, don't use the client-generated ID
            const method = mealPlan.id && await this.getMealPlans().then(plans => 
                plans.some(p => p.id === mealPlan.id)
            ) ? 'PUT' : 'POST';
            
            const url = method === 'PUT'
                ? `${API_BASE_URL}/api/meal-plans/${mealPlan.id}`
                : `${API_BASE_URL}/api/meal-plans`;
            
            // Remove the ID if it's a new meal plan
            const mealPlanData = method === 'POST' ? { ...mealPlan, id: undefined } : mealPlan;
            
            console.log('Debug - Sending meal plan data:', mealPlanData);
            console.log('Debug - Using URL:', url);
            console.log('Debug - Using method:', method);
            
            const response = await fetch(url, {
                method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mealPlanData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Debug - Server error response:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new ServerCommError(`Failed to save meal plan: ${message}`);
        }
    },

    async deleteMealPlan(mealPlanId: string): Promise<void> {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/api/meal-plans/${mealPlanId}`, {
                method: 'DELETE',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new ServerCommError(`Failed to delete meal plan: ${message}`);
        }
    }
}; 