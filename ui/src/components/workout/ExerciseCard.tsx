import { Exercise } from '@/types/workout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExerciseCardProps {
    exercise: Exercise;
    onClick?: () => void;
    selected?: boolean;
}

export function ExerciseCard({ exercise, onClick, selected }: ExerciseCardProps) {
    return (
        <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${selected ? 'border-primary' : ''}`}
            onClick={onClick}
        >
            <CardHeader>
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{exercise.category}</Badge>
                    {exercise.muscleGroups.map((muscle) => (
                        <Badge key={muscle} variant="outline">{muscle}</Badge>
                    ))}
                </div>
                {exercise.equipment && exercise.equipment.length > 0 && (
                    <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Equipment needed:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {exercise.equipment.map((item) => (
                                <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 