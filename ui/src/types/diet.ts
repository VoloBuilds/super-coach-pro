export interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'carbs' | 'fats' | 'vegetables' | 'fruits' | 'dairy' | 'other';
  servingSize: number;
  servingUnit: 'g' | 'ml' | 'oz' | 'cup' | 'piece';
  nutritionPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealItem {
  id: string;
  foodItem: FoodItem;
  quantity: number; // number of servings
}

export interface Meal {
  id: string;
  name: string;
  time: string; // HH:mm format
  items: MealItem[];
}

export type MealType = 'breakfast' | 'morning-snack' | 'lunch' | 'afternoon-snack' | 'dinner' | 'evening-snack';

export interface MealSlot {
  id: string;
  type: MealType;
  time: string; // HH:mm format
  meal?: Meal;
}

export interface MealPlanTemplate {
  id: string;
  name: string;
  description: string;
  slots: {
    type: MealType;
    defaultTime: string; // HH:mm format
  }[];
}

export interface DailyMealPlan {
  id: string;
  date: string; // YYYY-MM-DD format
  templateId: string;
  slots: MealSlot[];
  targetNutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MealPlan {
    id: string;
    name: string;
    description: string;
    meals: Record<MealType, Meal | null>;
    totalNutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    createdAt: string;
    updatedAt: string;
} 