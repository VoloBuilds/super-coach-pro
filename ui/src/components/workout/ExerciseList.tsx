import { useState, useMemo } from 'react';
import { Exercise } from '@/types/workout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exerciseCategories, muscleGroups } from '@/data/exercises';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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
                        <SelectValue placeholder="All Categories" />
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
                        <SelectValue placeholder="All Muscle Groups" />
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

            <div className="relative">
                {/* Sticky Headers */}
                <div className="sticky top-0 bg-background z-10 grid grid-cols-[2.5fr,1fr,2fr,1fr] gap-6 pb-2 border-b">
                    <div className="text-sm font-medium text-muted-foreground">Exercise</div>
                    <div className="text-sm font-medium text-muted-foreground">Category</div>
                    <div className="text-sm font-medium text-muted-foreground">Muscle Groups</div>
                    <div className="text-sm font-medium text-muted-foreground">Equipment</div>
                </div>

                <div className="grid gap-4 pt-4">
                    {filteredExercises.map((exercise) => (
                        <Card
                            key={exercise.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                exercise.id === selectedExerciseId ? 'border-primary' : ''
                            }`}
                            onClick={() => onSelectExercise(exercise)}
                        >
                            <div className="p-6">
                                <div className="grid grid-cols-[2.5fr,1fr,2fr,1fr] gap-6 items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold">{exercise.name}</h3>
                                        {exercise.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
                                        )}
                                    </div>
                                    <div className="pt-1">
                                        <Badge variant="secondary" className="text-sm bg-muted/50">
                                            {exercise.category}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {exercise.muscleGroups.map((muscle) => (
                                            <Badge key={muscle} variant="outline" className="text-sm bg-background">
                                                {muscle}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="pt-1">
                                        {exercise.equipment && (
                                            <div className="flex flex-wrap gap-2">
                                                {exercise.equipment.map((item) => (
                                                    <Badge key={item} variant="outline" className="text-sm bg-background">
                                                        {item}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {filteredExercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No exercises found matching your criteria
                </div>
            )}
        </div>
    );
} 