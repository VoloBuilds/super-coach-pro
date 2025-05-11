import { WorkoutData, WorkoutDB } from '../db';
import { RouteHandler, HandlerContext, DeleteRequestBody } from '../types';

export const workoutHandlers: RouteHandler<WorkoutData> = {
  async get(context: HandlerContext): Promise<WorkoutData[]> {
    const { db, user } = context;
    
    if (!user) {
      throw new Error('Authentication required');
    }

    return (db as WorkoutDB).getWorkouts(user.id);
  },

  async post(context: HandlerContext<WorkoutData>): Promise<WorkoutData> {
    const { db, user, body: workout } = context;

    if (!user) {
      throw new Error('Authentication required');
    }

    if (!workout) {
      throw new Error('Workout data is required');
    }

    return (db as WorkoutDB).createWorkout({
      ...workout,
      user_id: user.id
    });
  },

  async put(context: HandlerContext<WorkoutData>): Promise<WorkoutData> {
    const { db, user, body: workout, params } = context;

    if (!user) {
      throw new Error('Authentication required');
    }

    const workoutId = params.id;
    if (!workoutId) {
      throw new Error('Workout ID is required for updates');
    }

    if (!workout) {
      throw new Error('Workout data is required');
    }

    return (db as WorkoutDB).updateWorkout(workoutId, workout, user.id);
  },

  async delete(context: HandlerContext<DeleteRequestBody>): Promise<null> {
    const { db, user, body } = context;

    if (!user) {
      throw new Error('Authentication required');
    }

    if (!body?.id) {
      throw new Error('Workout ID is required for deletion');
    }

    await (db as WorkoutDB).deleteWorkout(body.id, user.id);
    return null;
  }
}; 