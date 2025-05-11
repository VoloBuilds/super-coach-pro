import { useState, useEffect } from 'react';
import { Exercise, Workout, WorkoutExercise } from '@/types/workout';
import { ExerciseList } from './ExerciseList';
import { ExerciseForm } from './ExerciseForm';
import { exercises } from '@/data/exercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface WorkoutBuilderProps {
    initialWorkout?: Workout;
    onSave: (workout: Workout) => void;
}

export function WorkoutBuilder({ initialWorkout, onSave }: WorkoutBuilderProps) {
    const [workoutName, setWorkoutName] = useState(initialWorkout?.name || 'New Workout');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(initialWorkout?.exercises || []);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Auto-select the workout name input on component mount
    useEffect(() => {
        const input = document.getElementById('workout-name') as HTMLInputElement;
        if (input) {
            input.select();
        }
    }, []);

    const handleSaveExercise = (workoutExercise: WorkoutExercise) => {
        const existingIndex = workoutExercises.findIndex(ex => ex.id === workoutExercise.id);
        if (existingIndex !== -1) {
            setWorkoutExercises(workoutExercises.map((ex, i) => 
                i === existingIndex ? workoutExercise : ex
            ));
        } else {
            setWorkoutExercises([...workoutExercises, workoutExercise]);
        }
        setSelectedExercise(null);
        setIsDialogOpen(false);
    };

    const handleRemoveExercise = (exerciseId: string) => {
        setWorkoutExercises(workoutExercises.filter(ex => ex.id !== exerciseId));
    };

    const handleEditExercise = (exercise: Exercise, workoutExercise: WorkoutExercise) => {
        setSelectedExercise(exercise);
        setIsDialogOpen(true);
    };

    const handleAddExercise = (exercise: Exercise) => {
        setSelectedExercise(exercise);
        setIsDialogOpen(true);
    };

    const handleSaveWorkout = () => {
        const workout = {
            name: workoutName,
            description: '', // Keep empty as we removed description
            exercises: workoutExercises,
            difficulty: 'beginner' as const, // Default as we removed difficulty selection
            createdAt: initialWorkout?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estimatedDuration: workoutExercises.reduce((total, ex) => 
                total + (ex.sets.length * (ex.restBetweenSets + 30)), 0) / 60,
            tags: [] as string[],
            ...(initialWorkout?.id && { id: initialWorkout.id })
        } as Workout;
        onSave(workout);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setSelectedExercise(null);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <Input
                    id="workout-name"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="text-xl font-semibold"
                />
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Selected Exercises</CardTitle>
                    {workoutExercises.length > 0 && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Exercise
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedExercise ? `Configure ${selectedExercise.name}` : 'Add Exercise'}
                                    </DialogTitle>
                                </DialogHeader>
                                {selectedExercise ? (
                                    <ExerciseForm
                                        exercise={selectedExercise}
                                        workoutExercise={workoutExercises.find(ex => ex.exerciseId === selectedExercise.id)}
                                        onSave={handleSaveExercise}
                                        onCancel={() => {
                                            setSelectedExercise(null);
                                            if (workoutExercises.some(ex => ex.exerciseId === selectedExercise.id)) {
                                                setIsDialogOpen(false);
                                            }
                                        }}
                                    />
                                ) : (
                                    <ExerciseList
                                        exercises={exercises}
                                        onSelectExercise={handleAddExercise}
                                    />
                                )}
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {workoutExercises.length === 0 ? (
                            <div className="text-center py-12">
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default" size="lg">
                                            <Plus className="h-5 w-5 mr-2" />
                                            Add Your First Exercise
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {selectedExercise ? `Configure ${selectedExercise.name}` : 'Add Exercise'}
                                            </DialogTitle>
                                        </DialogHeader>
                                        {selectedExercise ? (
                                            <ExerciseForm
                                                exercise={selectedExercise}
                                                workoutExercise={workoutExercises.find(ex => ex.exerciseId === selectedExercise.id)}
                                                onSave={handleSaveExercise}
                                                onCancel={() => {
                                                    setSelectedExercise(null);
                                                    if (workoutExercises.some(ex => ex.exerciseId === selectedExercise.id)) {
                                                        setIsDialogOpen(false);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <ExerciseList
                                                exercises={exercises}
                                                onSelectExercise={handleAddExercise}
                                                selectedExerciseId={undefined}
                                            />
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ) : (
                            workoutExercises.map((workoutExercise) => {
                                const exercise = exercises.find(e => e.id === workoutExercise.exerciseId)!;
                                return (
                                    <div 
                                        key={workoutExercise.id} 
                                        className="flex items-center justify-between p-2 border rounded hover:bg-accent cursor-pointer"
                                        onClick={() => handleEditExercise(exercise, workoutExercise)}
                                    >
                                        <div>
                                            <div className="font-medium">{exercise.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {workoutExercise.sets.length} sets
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveExercise(workoutExercise.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    onClick={handleSaveWorkout}
                    disabled={!workoutName || workoutExercises.length === 0}
                >
                    Save Workout
                </Button>
            </div>
        </div>
    );
} 