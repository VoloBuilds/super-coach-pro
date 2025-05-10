import { FoodItem } from '../types/diet';

export const mockFoods: FoodItem[] = [
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    category: 'protein',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    }
  },
  {
    id: 'brown-rice',
    name: 'Brown Rice (Cooked)',
    category: 'carbs',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 112,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8
    }
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    category: 'vegetables',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 34,
      protein: 2.8,
      carbs: 7,
      fat: 0.4,
      fiber: 2.6
    }
  },
  {
    id: 'salmon',
    name: 'Salmon Fillet',
    category: 'protein',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 208,
      protein: 22,
      carbs: 0,
      fat: 13,
    }
  },
  {
    id: 'sweet-potato',
    name: 'Sweet Potato',
    category: 'carbs',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 86,
      protein: 1.6,
      carbs: 20,
      fat: 0.1,
      fiber: 3
    }
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt',
    category: 'dairy',
    servingSize: 100,
    servingUnit: 'g',
    nutritionPer100g: {
      calories: 59,
      protein: 10,
      carbs: 3.6,
      fat: 0.4,
    }
  },
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruits',
    servingSize: 1,
    servingUnit: 'piece',
    nutritionPer100g: {
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      fiber: 2.6
    }
  },
  {
    id: 'olive-oil',
    name: 'Olive Oil',
    category: 'fats',
    servingSize: 15,
    servingUnit: 'ml',
    nutritionPer100g: {
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100,
    }
  }
]; 