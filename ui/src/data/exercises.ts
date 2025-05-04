import { Exercise } from '../types/workout';

export const exercises: Exercise[] = [
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

export const exerciseCategories = ['strength', 'cardio', 'flexibility', 'other'] as const;

export const muscleGroups = [
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'forearms',
    'quadriceps',
    'hamstrings',
    'glutes',
    'calves',
    'core',
    'full body'
] as const; 