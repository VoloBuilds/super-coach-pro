import { useState } from 'react';
import { format } from 'date-fns';
import { Workout } from '@/types/workout';
import { WorkoutSchedule, RecurrencePattern, DayOfWeek } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ScheduleWorkoutDialogProps {
    workouts: Workout[];
    onSchedule: (schedule: Omit<WorkoutSchedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    trigger?: React.ReactNode;
    selectedDate?: Date | null;
}

export function ScheduleWorkoutDialog({ workouts, onSchedule, trigger, selectedDate }: ScheduleWorkoutDialogProps) {
    const [selectedWorkout, setSelectedWorkout] = useState<string>('');
    const [recurrence, setRecurrence] = useState<RecurrencePattern>(selectedDate ? 'once' : 'weekly');
    const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const daysOfWeek: { label: string; value: DayOfWeek }[] = [
        { label: 'Sunday', value: 'sunday' },
        { label: 'Monday', value: 'monday' },
        { label: 'Tuesday', value: 'tuesday' },
        { label: 'Wednesday', value: 'wednesday' },
        { label: 'Thursday', value: 'thursday' },
        { label: 'Friday', value: 'friday' },
        { label: 'Saturday', value: 'saturday' },
    ];

    const handleSchedule = async () => {
        if (recurrence === 'once' && !selectedDate) {
            return; // Should not happen as we disable the button
        }

        const schedule = {
            workoutId: selectedWorkout,
            date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            recurrence,
            ...(recurrence === 'weekly' && { daysOfWeek: selectedDays }),
        };

        await onSchedule(schedule);
        setIsOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setSelectedWorkout('');
        setRecurrence(selectedDate ? 'once' : 'weekly');
        setSelectedDays([]);
    };

    const toggleDay = (day: DayOfWeek) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule Workout</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="workout">Select Workout</Label>
                        <Select
                            value={selectedWorkout}
                            onValueChange={setSelectedWorkout}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a workout" />
                            </SelectTrigger>
                            <SelectContent>
                                {workouts.map((workout) => (
                                    <SelectItem key={workout.id} value={workout.id}>
                                        {workout.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {!selectedDate && (
                        <div className="grid gap-2">
                            <Label>Schedule Type</Label>
                            <Select
                                value={recurrence}
                                onValueChange={(value: RecurrencePattern) => {
                                    setRecurrence(value);
                                    if (value === 'weekly') {
                                        setSelectedDays([]);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {recurrence === 'weekly' && (
                        <div className="grid gap-2">
                            <Label>Select Days</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {daysOfWeek.map((day) => (
                                    <div key={day.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={day.value}
                                            checked={selectedDays.includes(day.value)}
                                            onCheckedChange={() => toggleDay(day.value)}
                                        />
                                        <label
                                            htmlFor={day.value}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {day.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedDate && (
                        <div className="text-sm text-muted-foreground">
                            Scheduling for: {format(selectedDate, 'MMMM d, yyyy')}
                        </div>
                    )}

                    <Button
                        onClick={handleSchedule}
                        disabled={
                            !selectedWorkout || 
                            (recurrence === 'weekly' && selectedDays.length === 0) ||
                            (recurrence === 'once' && !selectedDate)
                        }
                    >
                        Schedule Workout
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 