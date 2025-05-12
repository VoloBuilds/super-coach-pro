export type RecurrencePattern = 'once' | 'weekly';

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface WorkoutSchedule {
    id: string;
    workoutId: string;
    date: string; // ISO date string for one-time schedules
    recurrence: RecurrencePattern;
    daysOfWeek?: DayOfWeek[]; // Only used when recurrence is 'weekly'
    userId: string;
    createdAt: string;
    updatedAt: string;
} 