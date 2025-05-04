import { useState } from 'react';
import { Exercise, ExerciseSet, WorkoutExercise, WeightType } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';

interface ExerciseFormProps {
    exercise: Exercise;
    workoutExercise?: WorkoutExercise;
    onSave: (workoutExercise: WorkoutExercise) => void;
    onCancel: () => void;
}

export function ExerciseForm({ exercise, workoutExercise, onSave, onCancel }: ExerciseFormProps) {
    const [sets, setSets] = useState<ExerciseSet[]>(
        workoutExercise?.sets || [
            {
                id: '1',
                reps: 10,
                weight: 0,
                completed: false,
                weightType: exercise.defaultWeightType || 'kg'
            }
        ]
    );
    const [restTime, setRestTime] = useState(workoutExercise?.restBetweenSets || 60);
    const [notes, setNotes] = useState(workoutExercise?.notes || '');

    const handleAddSet = () => {
        setSets([
            ...sets,
            {
                id: (sets.length + 1).toString(),
                reps: sets[sets.length - 1]?.reps || 10,
                weight: sets[sets.length - 1]?.weight || 0,
                completed: false,
                weightType: sets[sets.length - 1]?.weightType || 'kg'
            }
        ]);
    };

    const handleRemoveSet = (index: number) => {
        setSets(sets.filter((_, i) => i !== index));
    };

    const handleSetChange = (index: number, field: keyof ExerciseSet, value: any) => {
        setSets(sets.map((set, i) => 
            i === index ? { ...set, [field]: value } : set
        ));
    };

    const handleSave = () => {
        onSave({
            id: workoutExercise?.id || crypto.randomUUID(),
            exerciseId: exercise.id,
            sets,
            notes,
            restBetweenSets: restTime
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{exercise.name} Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Set</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sets.map((set, index) => (
                            <TableRow key={set.id}>
                                <TableCell className="font-medium">
                                    Set {index + 1}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={set.reps}
                                        onChange={(e) => handleSetChange(index, 'reps', parseInt(e.target.value))}
                                        min={1}
                                        className="w-20"
                                    />
                                </TableCell>
                                <TableCell>
                                    {set.weightType !== 'bodyweight' && (
                                        <Input
                                            type="number"
                                            value={set.weight}
                                            onChange={(e) => handleSetChange(index, 'weight', parseFloat(e.target.value))}
                                            min={0}
                                            step={0.5}
                                            className="w-20"
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={set.weightType}
                                        onValueChange={(value: WeightType) => handleSetChange(index, 'weightType', value)}
                                    >
                                        <SelectTrigger className="w-[130px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                            <SelectItem value="lb">Pounds (lb)</SelectItem>
                                            <SelectItem value="bodyweight">Body Weight</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveSet(index)}
                                        disabled={sets.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleAddSet}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Set
                </Button>

                <div className="space-y-2">
                    <Label htmlFor="rest-time">Rest Between Sets (seconds)</Label>
                    <Input
                        id="rest-time"
                        type="number"
                        value={restTime}
                        onChange={(e) => setRestTime(parseInt(e.target.value))}
                        min={0}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about this exercise..."
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Exercise
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 