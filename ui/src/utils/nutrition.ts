import { Meal, Nutrition } from '@/types/diet';

export function calculateTotalNutrition(meals: Meal[]): Nutrition {
    return meals.reduce((total, meal) => {
        const mealTotal = meal.items.reduce((mealSum, item) => {
            const multiplier = item.quantity * (item.foodItem.servingSize / 100);
            return {
                calories: mealSum.calories + item.foodItem.nutritionPer100g.calories * multiplier,
                protein: mealSum.protein + item.foodItem.nutritionPer100g.protein * multiplier,
                carbs: mealSum.carbs + item.foodItem.nutritionPer100g.carbs * multiplier,
                fat: mealSum.fat + item.foodItem.nutritionPer100g.fat * multiplier
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        return {
            calories: Math.round(total.calories + mealTotal.calories),
            protein: Math.round(total.protein + mealTotal.protein),
            carbs: Math.round(total.carbs + mealTotal.carbs),
            fat: Math.round(total.fat + mealTotal.fat)
        };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
} 