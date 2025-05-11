import { useState, useEffect } from 'react';
import { MealPlan } from '@/types/diet';
import { MealPlanBuilder } from '@/components/diet/MealPlanBuilder';
import { Button } from '@/components/ui/button';
import { Plus, Pencil } from 'lucide-react';
import { serverComm } from '@/lib/serverComm';

export default function Diet() {
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingMealPlan, setEditingMealPlan] = useState<MealPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load meal plans on component mount
    useEffect(() => {
        const loadMealPlans = async () => {
            try {
                const fetchedMealPlans = await serverComm.getMealPlans();
                setMealPlans(fetchedMealPlans);
                setError(null);
            } catch (err) {
                setError('Failed to load meal plans');
                console.error('Error loading meal plans:', err);
            }
        };

        loadMealPlans();
    }, []);

    const handleSaveMealPlan = async (mealPlan: MealPlan) => {
        try {
            const savedMealPlan = await serverComm.saveMealPlan(mealPlan);
            
            const updatedMealPlans = editingMealPlan
                ? mealPlans.map(mp => mp.id === savedMealPlan.id ? savedMealPlan : mp)
                : [...mealPlans, savedMealPlan];
                
            setMealPlans(updatedMealPlans);
            setEditingMealPlan(null);
            setIsCreating(false);
            setError(null);
        } catch (err) {
            setError('Failed to save meal plan');
            console.error('Error saving meal plan:', err);
        }
    };

    if (isCreating || editingMealPlan) {
        return (
            <div className="container mx-auto py-6">
                <h1 className="text-2xl font-bold mb-6">
                    {isCreating ? 'Create New Meal Plan' : 'Edit Meal Plan'}
                </h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <MealPlanBuilder
                    initialMealPlan={editingMealPlan || undefined}
                    onSave={handleSaveMealPlan}
                    onCancel={() => {
                        setIsCreating(false);
                        setEditingMealPlan(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Meal Plans</h1>
                <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meal Plan
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {mealPlans.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        You haven't created any meal plans yet.
                    </p>
                    <Button onClick={() => setIsCreating(true)}>
                        Create Your First Meal Plan
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mealPlans.map((mealPlan) => (
                        <div
                            key={mealPlan.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative group"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setEditingMealPlan(mealPlan)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>

                            <h2 className="text-xl font-semibold mb-2">{mealPlan.name}</h2>
                            {mealPlan.description && (
                                <p className="text-muted-foreground mb-4">{mealPlan.description}</p>
                            )}
                            <div className="text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Calories: {mealPlan.totalNutrition.calories}</span>
                                    <span>Protein: {mealPlan.totalNutrition.protein}g</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span>Carbs: {mealPlan.totalNutrition.carbs}g</span>
                                    <span>Fat: {mealPlan.totalNutrition.fat}g</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 