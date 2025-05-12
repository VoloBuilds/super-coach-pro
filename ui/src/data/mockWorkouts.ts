import { Exercise, WorkoutTemplate, Workout } from '../types/workout';

export const exercises: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'strength',
    description: 'Lie on bench and press barbell up',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench']
  },
  {
    id: 'squat',
    name: 'Squat',
    category: 'strength',
    description: 'Stand with barbell on shoulders and squat down',
    muscleGroups: ['quadriceps', 'hamstrings', 'glutes'],
    equipment: ['barbell', 'rack']
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'strength',
    description: 'Lift barbell from ground to hips',
    muscleGroups: ['back', 'hamstrings', 'glutes'],
    equipment: ['barbell']
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
    category: 'strength',
    description: 'Pull yourself up to bar',
    muscleGroups: ['back', 'biceps'],
    equipment: ['pull-up bar']
  }
];

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: '1',
    name: 'Full Body Strength',
    description: 'Complete full body workout focusing on compound movements',
    exercises: [
      {
        id: crypto.randomUUID(),
        exerciseId: exercises[0].id,
        sets: [
          { id: crypto.randomUUID(), reps: 8, weight: 135, completed: false, weightType: 'kg' },
          { id: crypto.randomUUID(), reps: 8, weight: 135, completed: false, weightType: 'kg' },
          { id: crypto.randomUUID(), reps: 8, weight: 135, completed: false, weightType: 'kg' }
        ],
        restBetweenSets: 90
      },
      {
        id: crypto.randomUUID(),
        exerciseId: exercises[1].id,
        sets: [
          { id: crypto.randomUUID(), reps: 8, weight: 185, completed: false, weightType: 'kg' },
          { id: crypto.randomUUID(), reps: 8, weight: 185, completed: false, weightType: 'kg' },
          { id: crypto.randomUUID(), reps: 8, weight: 185, completed: false, weightType: 'kg' }
        ],
        restBetweenSets: 120
      },
      {
        id: crypto.randomUUID(),
        exerciseId: exercises[2].id,
        sets: [
          { id: crypto.randomUUID(), reps: 8, weight: 225, completed: false, weightType: 'kg' },
          { id: crypto.randomUUID(), reps: 8, weight: 225, completed: false, weightType: 'kg' },
          { id: crypto.randomUUID(), reps: 8, weight: 225, completed: false, weightType: 'kg' }
        ],
        restBetweenSets: 120
      }
    ],
    estimatedDuration: 45
  },
  {
    id: '2',
    name: 'Upper Body Focus',
    description: 'Upper body strength training session',
    exercises: [
      {
        id: crypto.randomUUID(),
        exerciseId: exercises[0].id,
        sets: [
          { id: crypto.randomUUID(), reps: 10, weight: 135, completed: false, weightType: 'kg' },
          { id: crypto.randomUUID(), reps: 10, weight: 135, completed: false, weightType: 'kg' },
          { id: crypto.randomUUID(), reps: 10, weight: 135, completed: false, weightType: 'kg' }
        ],
        restBetweenSets: 90
      },
      {
        id: crypto.randomUUID(),
        exerciseId: exercises[3].id,
        sets: [
          { id: crypto.randomUUID(), reps: 8, weight: 0, completed: false, weightType: 'bodyweight' },
          { id: crypto.randomUUID(), reps: 8, weight: 0, completed: false, weightType: 'bodyweight' },
          { id: crypto.randomUUID(), reps: 8, weight: 0, completed: false, weightType: 'bodyweight' }
        ],
        restBetweenSets: 90
      }
    ],
    estimatedDuration: 30
  }
];

export const workouts: Workout[] = [
  {
    id: '1',
    name: 'Morning Strength Session',
    description: 'Completed full body workout',
    exercises: [
      {
        id: crypto.randomUUID(),
        exerciseId: 'bench-press',
        sets: [
          { id: '1', reps: 8, weight: 135, completed: false, weightType: 'kg' },
          { id: '2', reps: 8, weight: 135, completed: false, weightType: 'kg' },
          { id: '3', reps: 8, weight: 135, completed: false, weightType: 'kg' }
        ],
        notes: '',
        restBetweenSets: 90
      },
      {
        id: crypto.randomUUID(),
        exerciseId: 'squat',
        sets: [
          { id: '1', reps: 8, weight: 185, completed: false, weightType: 'kg' },
          { id: '2', reps: 8, weight: 185, completed: false, weightType: 'kg' },
          { id: '3', reps: 8, weight: 185, completed: false, weightType: 'kg' }
        ],
        notes: '',
        restBetweenSets: 120
      },
      {
        id: crypto.randomUUID(),
        exerciseId: 'deadlift',
        sets: [
          { id: '1', reps: 8, weight: 225, completed: false, weightType: 'kg' },
          { id: '2', reps: 8, weight: 225, completed: false, weightType: 'kg' },
          { id: '3', reps: 8, weight: 225, completed: false, weightType: 'kg' }
        ],
        notes: '',
        restBetweenSets: 120
      }
    ],
    estimatedDuration: 45
  },
  {
    id: '2',
    name: 'Upper Body Training',
    description: 'Focus on chest and back',
    exercises: [
      {
        id: crypto.randomUUID(),
        exerciseId: 'bench-press',
        sets: [
          { id: '1', reps: 10, weight: 135, completed: false, weightType: 'kg' },
          { id: '2', reps: 10, weight: 135, completed: false, weightType: 'kg' },
          { id: '3', reps: 10, weight: 135, completed: false, weightType: 'kg' }
        ],
        notes: '',
        restBetweenSets: 90
      },
      {
        id: crypto.randomUUID(),
        exerciseId: 'pull-up',
        sets: [
          { id: '1', reps: 8, weight: 0, completed: false, weightType: 'bodyweight' },
          { id: '2', reps: 8, weight: 0, completed: false, weightType: 'bodyweight' },
          { id: '3', reps: 8, weight: 0, completed: false, weightType: 'bodyweight' }
        ],
        notes: '',
        restBetweenSets: 90
      }
    ],
    estimatedDuration: 30
  }
]; 