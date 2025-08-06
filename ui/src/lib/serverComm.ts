import { Exercise, Workout } from '@/types/workout';
import { MealPlan } from '@/types/diet';
import { WorkoutSchedule } from '@/types/schedule';
import { supabase } from './supabase';

// Export the server types
export interface WorkoutData {
    name: string;
    description?: string;
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
        notes?: string;
        restBetweenSets: number;
    }>;
    estimatedDuration: number;
}

export interface MealPlanData {
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
        }>;
    }>;
    totalNutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

export interface WorkoutScheduleData {
    workoutId: string;
    date: string;
    recurrence: 'once' | 'weekly';
    daysOfWeek?: string[];
}

// const API_BASE_URL = 'https://supercoachpro-api.volobuilds1.workers.dev'; // Update this based on your deployment environment
const API_BASE_URL = 'http://localhost:8787';

export class ServerCommError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ServerCommError';
    }
}

let cachedSession: { session: any; timestamp: number } | null = null;
const SESSION_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
let fetchingSessionPromise: Promise<any> | null = null;

async function getAuthHeader(): Promise<Record<string, string>> {
    const now = Date.now();
    
    if (cachedSession && (now - cachedSession.timestamp) < SESSION_CACHE_DURATION) {
        return {
            'Content-Type': 'application/json',
            ...(cachedSession.session ? { Authorization: `Bearer ${cachedSession.session.access_token}` } : {})
        };
    }
    
    if (!fetchingSessionPromise) {
        fetchingSessionPromise = supabase.auth.getSession().then(({ data: { session } }) => {
            cachedSession = { session, timestamp: Date.now() };
            fetchingSessionPromise = null;
            return session;
        });
    }
    const session = await fetchingSessionPromise;
    
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
            if (process.env.NODE_ENV === 'development') {
                console.log('Fetched workouts:', data);
            }
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
            
            // Try PUT first if ID exists, fallback to POST if it fails
            if (mealPlan.id) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${mealPlan.id}`, {
                        method: 'PUT',
                        headers: {
                            ...headers,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(mealPlan)
                    });
                    
                    if (response.ok) {
                        return await response.json();
                    }
                    
                    // If PUT fails with 404, fall through to POST
                    if (response.status !== 404) {
                        const errorData = await response.json().catch(() => null);
                        if (errorData) {
                            console.error('Debug - Server error response:', errorData);
                        }
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                } catch (error) {
                    // If it's not a 404 error, re-throw
                    if (error instanceof Error && !error.message.includes('404')) {
                        throw error;
                    }
                }
            }
            
            // POST for new meal plans or when PUT fails with 404
            const mealPlanData = { ...mealPlan, id: undefined };
            
            console.log('Debug - Sending meal plan data:', mealPlanData);
            console.log('Debug - Using POST method');
            
            const response = await fetch(`${API_BASE_URL}/api/meal-plans`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mealPlanData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                if (errorData) {
                    console.error('Debug - Server error response:', errorData);
                }
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
    },

    async sendChatMessage(message: string): Promise<{ message: string; data?: WorkoutData | MealPlanData }> {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new ServerCommError(`Failed to send chat message: ${message}`);
        }
    },

    async getScheduledWorkouts(): Promise<WorkoutSchedule[]> {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/api/workout-schedules?limit=50`, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Raw schedule response:', data);
            
            // Ensure we always return an array
            if (!Array.isArray(data)) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Schedule response is not an array:', data);
                }
                return [];
            }
            
            return data;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Failed to fetch scheduled workouts:', error);
            throw new ServerCommError(`Failed to fetch scheduled workouts: ${message}`);
        }
    },

    async scheduleWorkout(schedule: WorkoutScheduleData): Promise<WorkoutSchedule> {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/api/workout-schedules`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(schedule)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new ServerCommError(`Failed to schedule workout: ${message}`);
        }
    },

    async deleteScheduledWorkout(scheduleId: string): Promise<void> {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/api/workout-schedules/${scheduleId}`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new ServerCommError(`Failed to delete scheduled workout: ${message}`);
        }
    }
}; 