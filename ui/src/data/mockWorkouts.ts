import { Exercise, WorkoutTemplate, Workout } from '../types/workout';

export const exercises: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    description: 'Lie on bench and press barbell up',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench']
  },
  {
    id: 'squat',
    name: 'Squat',
    description: 'Stand with barbell on shoulders and squat down',
    muscleGroups: ['quadriceps', 'hamstrings', 'glutes'],
    equipment: ['barbell', 'rack']
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    description: 'Lift barbell from ground to hips',
    muscleGroups: ['back', 'hamstrings', 'glutes'],
    equipment: ['barbell']
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
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
        exercise: exercises[0],
        sets: [
          { reps: 8, weight: 135, isComplete: false },
          { reps: 8, weight: 135, isComplete: false },
          { reps: 8, weight: 135, isComplete: false }
        ],
        restTimeInSeconds: 90
      },
      {
        exercise: exercises[1],
        sets: [
          { reps: 8, weight: 185, isComplete: false },
          { reps: 8, weight: 185, isComplete: false },
          { reps: 8, weight: 185, isComplete: false }
        ],
        restTimeInSeconds: 120
      },
      {
        exercise: exercises[2],
        sets: [
          { reps: 8, weight: 225, isComplete: false },
          { reps: 8, weight: 225, isComplete: false },
          { reps: 8, weight: 225, isComplete: false }
        ],
        restTimeInSeconds: 120
      }
    ]
  },
  {
    id: '2',
    name: 'Upper Body Focus',
    description: 'Upper body strength training session',
    exercises: [
      {
        exercise: exercises[0],
        sets: [
          { reps: 10, weight: 135, isComplete: false },
          { reps: 10, weight: 135, isComplete: false },
          { reps: 10, weight: 135, isComplete: false }
        ],
        restTimeInSeconds: 90
      },
      {
        exercise: exercises[3],
        sets: [
          { reps: 8, weight: 0, isComplete: false },
          { reps: 8, weight: 0, isComplete: false },
          { reps: 8, weight: 0, isComplete: false }
        ],
        restTimeInSeconds: 90
      }
    ]
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
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-10T09:15:00Z',
    estimatedDuration: 45,
    difficulty: 'intermediate',
    tags: []
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
    createdAt: '2024-03-08T16:00:00Z',
    updatedAt: '2024-03-08T17:00:00Z',
    estimatedDuration: 30,
    difficulty: 'intermediate',
    tags: []
  }
]; 