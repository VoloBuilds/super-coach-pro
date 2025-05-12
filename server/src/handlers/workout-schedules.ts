import { WorkoutScheduleData, WorkoutDB } from '../db';
import { RouteHandler, HandlerContext, DeleteRequestBody } from '../types';

export const workoutScheduleHandlers: RouteHandler<WorkoutScheduleData> = {
    async get(context: HandlerContext): Promise<WorkoutScheduleData[]> {
        const { db, user } = context;
        
        if (!user) {
            throw new Error('Authentication required');
        }

        return (db as WorkoutDB).getWorkoutSchedules(user.id);
    },

    async post(context: HandlerContext<WorkoutScheduleData>): Promise<WorkoutScheduleData> {
        const { db, user, body: schedule } = context;

        if (!user) {
            throw new Error('Authentication required');
        }

        if (!schedule) {
            throw new Error('Schedule data is required');
        }

        return (db as WorkoutDB).createWorkoutSchedule({
            ...schedule,
            user_id: user.id
        });
    },

    async delete(context: HandlerContext<DeleteRequestBody>): Promise<null> {
        const { db, user, body } = context;

        if (!user) {
            throw new Error('Authentication required');
        }

        if (!body?.id) {
            throw new Error('Schedule ID is required for deletion');
        }

        await (db as WorkoutDB).deleteWorkoutSchedule(body.id, user.id);
        return null;
    }
}; 