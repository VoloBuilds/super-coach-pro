import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Workout } from '@/types/workout';
import { WorkoutBuilder } from '@/components/workout/WorkoutBuilder';
import { LiveWorkout } from '@/components/LiveWorkout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil } from 'lucide-react';
import { serverComm } from '@/lib/serverComm';

export default function Workouts() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
    const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    // Load workouts on component mount
    useEffect(() => {
        const loadWorkouts = async () => {
            try {
                const fetchedWorkouts = await serverComm.getWorkouts();
                if (!Array.isArray(fetchedWorkouts)) {
                    throw new Error('Invalid response format');
                }
                setWorkouts(fetchedWorkouts);

                // Check if we should start a specific workout
                const state = location.state as { startWorkout?: Workout };
                if (state?.startWorkout) {
                    setActiveWorkout(state.startWorkout);
                    // Clear the state to prevent starting the workout again on refresh
                    window.history.replaceState({}, document.title);
                }
            } catch (err) {
                setError('Failed to load workouts');
                console.error('Error loading workouts:', err);
            }
        };

        loadWorkouts();
    }, [location]);

    const handleSaveWorkout = async (workout: Workout) => {
        try {
            // Save to backend - no need to generate ID client-side
            const savedWorkout = await serverComm.saveWorkout(workout);
            
            // Update local state
            const updatedWorkouts = editingWorkout
                ? workouts.map(w => w.id === savedWorkout.id ? savedWorkout : w)
                : [...workouts, savedWorkout];
                
            setWorkouts(updatedWorkouts);
            setEditingWorkout(null);
            setIsCreating(false);
            setError(null);
        } catch (err) {
            setError('Failed to save workout');
            console.error('Error saving workout:', err);
        }
    };

    const handleCompleteWorkout = async (completedWorkout: Workout) => {
        try {
            // Save completed workout data to backend
            const savedWorkout = await serverComm.saveWorkout(completedWorkout);
            
            // Update local state
            const updatedWorkouts = workouts.map(w => 
                w.id === savedWorkout.id ? savedWorkout : w
            );
            setWorkouts(updatedWorkouts);
            
            // Exit live mode
            setActiveWorkout(null);
            setError(null);
        } catch (err) {
            setError('Failed to save workout completion');
            console.error('Error completing workout:', err);
        }
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
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
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

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

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