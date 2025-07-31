import { useState, useEffect } from 'react';
import { Workout } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { exercises } from '@/data/exercises';
import { PlayCircle, PauseCircle, StopCircle } from 'lucide-react';

interface LiveWorkoutProps {
    workout: Workout;
    onComplete: (completedWorkout: Workout) => void;
    onCancel: () => void;
}

export function LiveWorkout({ workout, onComplete, onCancel }: LiveWorkoutProps) {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
    const [actualReps, setActualReps] = useState<string>('');
    const [actualWeight, setActualWeight] = useState<string>('');

    // Initialize completed sets tracking
    useEffect(() => {
        const initial: Record<string, boolean[]> = {};
        workout.exercises.forEach(exercise => {
            initial[exercise.id] = new Array(exercise.sets.length).fill(false);
        });
        setCompletedSets(initial);
    }, [workout]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        
        if (!isPaused && isResting) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 0) {
                        setIsResting(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPaused, isResting]);

    const currentExercise = workout.exercises[currentExerciseIndex];
    // Get exercise info from either the workoutExercise (AI-generated) or exercises list (manually created)
    const exercise = currentExercise.name 
        ? { id: currentExercise.exerciseId, name: currentExercise.name } 
        : exercises.find(e => e.id === currentExercise?.exerciseId);

    const handleCompleteSet = (actualReps?: number, actualWeight?: number) => {
        // Update completed sets
        const newCompletedSets = { ...completedSets };
        newCompletedSets[currentExercise.id] = [...newCompletedSets[currentExercise.id]];
        newCompletedSets[currentExercise.id][currentSetIndex] = true;
        setCompletedSets(newCompletedSets);

        // Update the actual reps and weight if provided
        if (actualReps || actualWeight) {
            const updatedWorkout = {
                ...workout,
                exercises: workout.exercises.map((exercise, index) => {
                    if (index !== currentExerciseIndex) return exercise;
                    return {
                        ...exercise,
                        sets: exercise.sets.map((set, idx) => {
                            if (idx !== currentSetIndex) return set;
                            return {
                                ...set,
                                reps: actualReps ?? set.reps,
                                weight: actualWeight ?? set.weight
                            };
                        })
                    };
                })
            };
        }

        // Move to rest period or next set/exercise
        if (currentSetIndex < currentExercise.sets.length - 1) {
            setIsResting(true);
            setTimer(currentExercise.restBetweenSets);
            setCurrentSetIndex(prev => prev + 1);
        } else if (currentExerciseIndex < workout.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            setCurrentSetIndex(0);
            setIsResting(true);
            setTimer(currentExercise.restBetweenSets);
        } else {
            // Workout complete
            onComplete(workout);
        }
    };

    const handleSkipRest = () => {
        setIsResting(false);
        setTimer(0);
    };

    const togglePause = () => {
        setIsPaused(prev => !prev);
    };

    if (!currentExercise || !exercise) return null;

    const currentSet = currentExercise.sets[currentSetIndex];
    const isLastSet = currentSetIndex === currentExercise.sets.length - 1;
    const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;

    return (
        <div className="space-y-6 max-w-3xl mx-auto p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{workout.name}</h1>
                <div className="space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePause}
                    >
                        {isPaused ? <PlayCircle className="h-6 w-6" /> : <PauseCircle className="h-6 w-6" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onCancel}
                    >
                        <StopCircle className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{exercise.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isResting ? (
                        <div className="text-center space-y-4">
                            <h3 className="text-xl">Rest Time</h3>
                            <div className="text-4xl font-bold">{timer}s</div>
                            <Button onClick={handleSkipRest}>Skip Rest</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>Set {currentSetIndex + 1} of {currentExercise.sets.length}</div>
                                <div>Exercise {currentExerciseIndex + 1} of {workout.exercises.length}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm">Target Reps: {currentSet.reps}</label>
                                        <Input
                                            type="number"
                                            placeholder="Actual reps"
                                            className="mt-1"
                                            value={actualReps}
                                            onChange={e => setActualReps(e.target.value)}
                                        />
                                    </div>
                                    {currentSet.weightType !== 'bodyweight' && (
                                        <div className="flex-1">
                                            <label className="text-sm">Target Weight: {currentSet.weight}{currentSet.weightType}</label>
                                            <Input
                                                type="number"
                                                placeholder="Actual weight"
                                                className="mt-1"
                                                value={actualWeight}
                                                onChange={e => setActualWeight(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button 
                                className="w-full"
                                onClick={() => {
                                    handleCompleteSet(
                                        actualReps ? parseInt(actualReps) : undefined,
                                        actualWeight ? parseFloat(actualWeight) : undefined
                                    );
                                    setActualReps('');
                                    setActualWeight('');
                                }}
                            >
                                {isLastSet && isLastExercise ? 'Complete Workout' : 'Complete Set'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workout.exercises.map((ex, exIndex) => {
                    // Get exercise info from either the workoutExercise (AI-generated) or exercises list (manually created)
                    const exerciseInfo = ex.name 
                        ? { id: ex.exerciseId, name: ex.name }
                        : exercises.find(e => e.id === ex.exerciseId)!;
                    return (
                        <Card key={ex.id} className={exIndex === currentExerciseIndex ? 'border-primary' : ''}>
                            <CardHeader>
                                <CardTitle className="text-sm">{exerciseInfo.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-1">
                                    {ex.sets.map((_, setIndex) => (
                                        <div
                                            key={setIndex}
                                            className={`h-2 rounded ${
                                                completedSets[ex.id]?.[setIndex]
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
} 