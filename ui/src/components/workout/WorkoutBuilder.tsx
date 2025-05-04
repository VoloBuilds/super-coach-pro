import { useState } from 'react';
import { Exercise, Workout, WorkoutExercise } from '@/types/workout';
import { ExerciseList } from './ExerciseList';
import { ExerciseForm } from './ExerciseForm';
import { exercises } from '@/data/exercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface WorkoutBuilderProps {
    initialWorkout?: Workout;
    onSave: (workout: Workout) => void;
}

export function WorkoutBuilder({ initialWorkout, onSave }: WorkoutBuilderProps) {
    const [workoutName, setWorkoutName] = useState(initialWorkout?.name || '');
    const [workoutDescription, setWorkoutDescription] = useState(initialWorkout?.description || '');
    const [difficulty, setDifficulty] = useState<Workout['difficulty']>(initialWorkout?.difficulty || 'beginner');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(initialWorkout?.exercises || []);

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
    };

    const handleRemoveExercise = (exerciseId: string) => {
        setWorkoutExercises(workoutExercises.filter(ex => ex.id !== exerciseId));
    };

    const handleEditExercise = (exercise: Exercise, workoutExercise: WorkoutExercise) => {
        setSelectedExercise(exercise);
    };

    const handleSaveWorkout = () => {
        const workout: Workout = {
            id: initialWorkout?.id || crypto.randomUUID(),
            name: workoutName,
            description: workoutDescription,
            exercises: workoutExercises,
            difficulty,
            createdAt: initialWorkout?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estimatedDuration: workoutExercises.reduce((total, ex) => 
                total + (ex.sets.length * (ex.restBetweenSets + 30)), 0) / 60, // rough estimate in minutes
            tags: []
        };
        onSave(workout);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Workout Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="workout-name">Workout Name</Label>
                        <Input
                            id="workout-name"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            placeholder="Enter workout name..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="workout-description">Description</Label>
                        <Input
                            id="workout-description"
                            value={workoutDescription}
                            onChange={(e) => setWorkoutDescription(e.target.value)}
                            placeholder="Describe your workout..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select value={difficulty} onValueChange={(value: Workout['difficulty']) => setDifficulty(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {selectedExercise ? (
                <ExerciseForm
                    exercise={selectedExercise}
                    workoutExercise={workoutExercises.find(ex => ex.exerciseId === selectedExercise.id)}
                    onSave={handleSaveExercise}
                    onCancel={() => setSelectedExercise(null)}
                />
            ) : (
                <>
                    {workoutExercises.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Selected Exercises</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {workoutExercises.map((workoutExercise) => {
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
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Add Exercises</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ExerciseList
                                exercises={exercises}
                                onSelectExercise={setSelectedExercise}
                                selectedExerciseId={selectedExercise?.id}
                            />
                        </CardContent>
                    </Card>
                </>
            )}

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