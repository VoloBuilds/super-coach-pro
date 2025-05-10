import { useState } from 'react';
import { MealPlan, Meal, MealType } from '@/types/diet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mealBank } from '@/data/mockMeals';
import { calculateTotalNutrition } from '@/utils/nutrition';

type MealTemplate = {
    id: string;
    name: string;
    description: string;
    mealTypes: MealType[];
};

const mealTemplates: MealTemplate[] = [
    {
        id: '3-meal',
        name: '3 Meals',
        description: 'Basic plan with breakfast, lunch, and dinner',
        mealTypes: ['breakfast', 'lunch', 'dinner'],
    },
    {
        id: '4-meal',
        name: '4 Meals',
        description: 'Three meals plus afternoon snack',
        mealTypes: ['breakfast', 'lunch', 'afternoon-snack', 'dinner'],
    },
    {
        id: '5-meal',
        name: '5 Meals',
        description: 'Three meals plus morning and afternoon snacks',
        mealTypes: ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner'],
    },
    {
        id: '6-meal',
        name: '6 Meals',
        description: 'Three meals plus morning, afternoon, and evening snacks',
        mealTypes: ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'],
    },
];

interface MealPlanBuilderProps {
    initialMealPlan?: MealPlan;
    onSave: (mealPlan: MealPlan) => void;
    onCancel: () => void;
}

export function MealPlanBuilder({ initialMealPlan, onSave, onCancel }: MealPlanBuilderProps) {
    const [name, setName] = useState(initialMealPlan?.name || '');
    const [description, setDescription] = useState(initialMealPlan?.description || '');
    
    // Determine initial template based on the meals present in initialMealPlan
    const getInitialTemplate = () => {
        if (!initialMealPlan) return mealTemplates.find(t => t.id === '3-meal') || null;
        
        const hasSnacks = Object.entries(initialMealPlan.meals).some(([type, meal]) => 
            (type.includes('snack') && meal !== null)
        );
        
        const mealCount = Object.values(initialMealPlan.meals).filter(meal => meal !== null).length;
        
        if (!hasSnacks) return mealTemplates.find(t => t.id === '3-meal') || null;
        return mealTemplates.find(t => t.mealTypes.length === mealCount) || null;
    };

    const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(getInitialTemplate());
    const [meals, setMeals] = useState<Record<MealType, Meal | null>>({
        breakfast: initialMealPlan?.meals.breakfast || null,
        'morning-snack': initialMealPlan?.meals['morning-snack'] || null,
        lunch: initialMealPlan?.meals.lunch || null,
        'afternoon-snack': initialMealPlan?.meals['afternoon-snack'] || null,
        dinner: initialMealPlan?.meals.dinner || null,
        'evening-snack': initialMealPlan?.meals['evening-snack'] || null
    });

    const handleTemplateSelect = (templateId: string) => {
        const template = mealTemplates.find(t => t.id === templateId);
        if (!template) return;
        
        setSelectedTemplate(template);
        
        // Keep existing meals if they're in the new template, remove if not
        setMeals(prev => {
            const newMeals = { ...prev };
            Object.keys(newMeals).forEach(type => {
                if (!template.mealTypes.includes(type as MealType)) {
                    newMeals[type as MealType] = null;
                }
            });
            return newMeals;
        });
    };

    const handleSelectMeal = (type: MealType, meal: Meal | null) => {
        setMeals(prev => ({
            ...prev,
            [type]: meal
        }));
    };

    const handleSave = () => {
        const mealPlan: MealPlan = {
            id: initialMealPlan?.id || crypto.randomUUID(),
            name,
            description,
            meals,
            totalNutrition: calculateTotalNutrition(Object.values(meals).filter((meal): meal is Meal => meal !== null)),
            createdAt: initialMealPlan?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        onSave(mealPlan);
    };

    const isValid = name.trim() !== '' && Object.values(meals).some(meal => meal !== null);

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Meal Plan Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., High Protein Plan"
                        />
                    </div>
                    <div>
                        <Label htmlFor="template">Meal Template</Label>
                        <Select 
                            onValueChange={handleTemplateSelect} 
                            defaultValue={selectedTemplate?.id || '3-meal'}
                            value={selectedTemplate?.id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a meal template" />
                            </SelectTrigger>
                            <SelectContent>
                                {mealTemplates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="description">Description (optional)</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Focused on lean proteins and complex carbs"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Meals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {(['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'] as MealType[])
                        .filter(type => !selectedTemplate || selectedTemplate.mealTypes.includes(type))
                        .map((type) => (
                            <div key={type} className="space-y-2">
                                <Label className="capitalize">{type.replace('-', ' ')}</Label>
                                {meals[type] ? (
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h3 className="font-medium">{meals[type]!.name}</h3>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {meals[type]!.items.map(item => 
                                                    `${item.quantity}x ${item.foodItem.name}`
                                                ).join(', ')}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSelectMeal(type, null)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        {mealBank
                                            .filter(m => m.type === type)
                                            .map(({ meal }) => (
                                                <Button
                                                    key={meal.id}
                                                    variant="outline"
                                                    className="justify-start h-auto py-3"
                                                    onClick={() => handleSelectMeal(type, meal)}
                                                >
                                                    <div className="text-left">
                                                        <div className="font-medium">{meal.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {meal.items.map(item => 
                                                                `${item.quantity}x ${item.foodItem.name}`
                                                            ).join(', ')}
                                                        </div>
                                                    </div>
                                                </Button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ))}
                </CardContent>
            </Card>

            {Object.values(meals).some(meal => meal !== null) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Nutrition Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(calculateTotalNutrition(
                                Object.values(meals).filter((meal): meal is Meal => meal !== null)
                            )).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="capitalize">{key}</span>
                                    <span className="font-medium">
                                        {value as number}{key === 'calories' ? '' : 'g'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={!isValid}>
                    Save Meal Plan
                </Button>
            </div>
        </div>
    );
} 