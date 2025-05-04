import { useState, useMemo } from 'react';
import { Exercise } from '@/types/workout';
import { ExerciseCard } from './ExerciseCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exerciseCategories, muscleGroups } from '@/data/exercises';

interface ExerciseListProps {
    exercises: Exercise[];
    onSelectExercise: (exercise: Exercise) => void;
    selectedExerciseId?: string;
}

export function ExerciseList({ exercises, onSelectExercise, selectedExerciseId }: ExerciseListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');

    const filteredExercises = useMemo(() => {
        return exercises.filter((exercise) => {
            const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
            const matchesMuscleGroup = selectedMuscleGroup === 'all' || exercise.muscleGroups.includes(selectedMuscleGroup);
            
            return matchesSearch && matchesCategory && matchesMuscleGroup;
        });
    }, [exercises, searchTerm, selectedCategory, selectedMuscleGroup]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
                <Input
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {exerciseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Muscle Group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Muscle Groups</SelectItem>
                        {muscleGroups.map((muscle) => (
                            <SelectItem key={muscle} value={muscle}>
                                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredExercises.map((exercise) => (
                    <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onClick={() => onSelectExercise(exercise)}
                        selected={exercise.id === selectedExerciseId}
                    />
                ))}
            </div>

            {filteredExercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No exercises found matching your criteria
                </div>
            )}
        </div>
    );
} 