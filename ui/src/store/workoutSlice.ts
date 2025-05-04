import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workout, WorkoutTemplate } from '../types/workout';

interface WorkoutState {
  workouts: Workout[];
  templates: WorkoutTemplate[];
  activeWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkoutState = {
  workouts: [],
  templates: [],
  activeWorkout: null,
  isLoading: false,
  error: null,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    setWorkouts: (state, action: PayloadAction<Workout[]>) => {
      state.workouts = action.payload;
    },
    addWorkout: (state, action: PayloadAction<Workout>) => {
      state.workouts.push(action.payload);
    },
    updateWorkout: (state, action: PayloadAction<Workout>) => {
      const index = state.workouts.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.workouts[index] = action.payload;
      }
    },
    deleteWorkout: (state, action: PayloadAction<string>) => {
      state.workouts = state.workouts.filter(w => w.id !== action.payload);
    },
    setActiveWorkout: (state, action: PayloadAction<Workout | null>) => {
      state.activeWorkout = action.payload;
    },
    setTemplates: (state, action: PayloadAction<WorkoutTemplate[]>) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action: PayloadAction<WorkoutTemplate>) => {
      state.templates.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setWorkouts,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  setActiveWorkout,
  setTemplates,
  addTemplate,
  setLoading,
  setError,
} = workoutSlice.actions;

export default workoutSlice.reducer; 