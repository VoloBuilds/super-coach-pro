export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'other';
  equipment?: string[];
  description?: string;
  muscleGroups: string[];
  defaultWeightType?: WeightType;
}

export type WeightType = 'kg' | 'lb' | 'bodyweight';

export interface ExerciseSet {
  id: string;
  weight?: number;
  reps?: number;
  duration?: number; // in seconds, for cardio/timed exercises
  distance?: number; // in meters, for cardio exercises
  completed: boolean;
  weightType: WeightType;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name?: string;  // Optional name field for AI-generated exercises
  sets: ExerciseSet[];
  notes?: string;
  restBetweenSets: number; // in seconds
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number; // in minutes
}

export interface WorkoutTemplate extends Omit<Workout, 'id'> {
  id?: string;
} 