import { useState, useEffect } from 'react';
import { Workout } from '@/types/workout';
import { WorkoutBuilder } from '@/components/workout/WorkoutBuilder';
import { LiveWorkout } from '@/components/LiveWorkout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil } from 'lucide-react';

export default function Workouts() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
    const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

    // Load workouts from local storage on mount
    useEffect(() => {
        const savedWorkouts = localStorage.getItem('workouts');
        if (savedWorkouts) {
            setWorkouts(JSON.parse(savedWorkouts));
        }
    }, []);

    const handleSaveWorkout = (workout: Workout) => {
        const updatedWorkouts = editingWorkout
            ? workouts.map(w => w.id === workout.id ? workout : w)
            : [...workouts, workout];
            
        setWorkouts(updatedWorkouts);
        setEditingWorkout(null);
        setIsCreating(false);

        // Save to local storage
        localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    };

    const handleCompleteWorkout = (completedWorkout: Workout) => {
        // Save completed workout data
        const updatedWorkouts = workouts.map(w => 
            w.id === completedWorkout.id ? completedWorkout : w
        );
        setWorkouts(updatedWorkouts);
        localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
        
        // Exit live mode
        setActiveWorkout(null);
    };

    if (activeWorkout) {
        return (
            <LiveWorkout
                workout={activeWorkout}
                onComplete={handleCompleteWorkout}
                onCancel={() => setActiveWorkout(null)}
            />
        );
    }

    if (isCreating || editingWorkout) {
        return (
            <div className="container mx-auto py-6">
                <h1 className="text-2xl font-bold mb-6">
                    {isCreating ? 'Create New Workout' : 'Edit Workout'}
                </h1>
                <WorkoutBuilder
                    initialWorkout={editingWorkout || undefined}
                    onSave={handleSaveWorkout}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Workouts</h1>
                <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workout
                </Button>
            </div>

            {workouts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        You haven't created any workouts yet.
                    </p>
                    <Button onClick={() => setIsCreating(true)}>
                        Create Your First Workout
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workouts.map((workout) => (
                        <div
                            key={workout.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative group"
                            onClick={() => setActiveWorkout(workout)}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingWorkout(workout);
                                }}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>

                            <h2 className="text-xl font-semibold mb-2">{workout.name}</h2>
                            {workout.description && (
                                <p className="text-muted-foreground mb-4">{workout.description}</p>
                            )}
                            <div className="text-sm text-muted-foreground">
                                <span>{workout.exercises.length} exercises</span>
                                <span className="mx-2">•</span>
                                <span>{workout.estimatedDuration} min</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 