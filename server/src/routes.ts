import { Route } from './types';
import { workoutHandlers } from './handlers/workouts';
import { mealPlanHandlers } from './handlers/meal-plans';
import { chatHandler } from './handlers/chat';
import { WorkoutData, MealPlanData } from './db';

// Static data
const exercises = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'strength',
    equipment: ['barbell', 'bench'],
    description: 'A compound exercise that primarily targets the chest muscles',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    defaultWeightType: 'kg'
  },
  {
    id: 'squat',
    name: 'Barbell Squat',
    category: 'strength',
    equipment: ['barbell', 'squat rack'],
    description: 'A compound lower body exercise that primarily targets the legs',
    muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'core'],
    defaultWeightType: 'kg'
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'strength',
    equipment: ['barbell'],
    description: 'A compound exercise that targets multiple muscle groups',
    muscleGroups: ['back', 'hamstrings', 'glutes', 'core'],
    defaultWeightType: 'kg'
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
    category: 'strength',
    equipment: ['pull-up bar'],
    description: 'An upper body compound exercise',
    muscleGroups: ['back', 'biceps', 'shoulders'],
    defaultWeightType: 'bodyweight'
  },
  {
    id: 'running',
    name: 'Running',
    category: 'cardio',
    description: 'Cardiovascular exercise that can be done outdoors or on a treadmill',
    muscleGroups: ['legs', 'core'],
    defaultWeightType: 'bodyweight'
  }
];

export const routes: (Route<any>)[] = [
  {
    path: '/api/exercises',
    handler: {
      get: async () => exercises
    }
  } as Route<typeof exercises[0]>,
  {
    path: '/api/workouts',
    handler: workoutHandlers
  } as Route<WorkoutData>,
  {
    path: '/api/workouts/{id}',
    handler: workoutHandlers
  } as Route<WorkoutData>,
  {
    path: '/api/meal-plans',
    handler: mealPlanHandlers
  } as Route<MealPlanData>,
  {
    path: '/api/meal-plans/{id}',
    handler: mealPlanHandlers
  } as Route<MealPlanData>,
  {
    path: '/api/chat',
    handler: chatHandler
  } as Route<any>
]; 