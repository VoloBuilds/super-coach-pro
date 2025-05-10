import { MealPlanTemplate } from '@/types/diet';

export const mealPlanTemplates: MealPlanTemplate[] = [
  {
    id: 'standard',
    name: 'Standard (3 Meals)',
    description: 'A traditional three-meal plan with breakfast, lunch, and dinner',
    slots: [
      { type: 'breakfast', defaultTime: '08:00' },
      { type: 'lunch', defaultTime: '13:00' },
      { type: 'dinner', defaultTime: '19:00' }
    ]
  },
  {
    id: 'five-meals',
    name: 'Five Meals',
    description: 'Five balanced meals throughout the day including snacks',
    slots: [
      { type: 'breakfast', defaultTime: '07:00' },
      { type: 'morning-snack', defaultTime: '10:00' },
      { type: 'lunch', defaultTime: '13:00' },
      { type: 'afternoon-snack', defaultTime: '16:00' },
      { type: 'dinner', defaultTime: '19:00' }
    ]
  },
  {
    id: 'six-meals',
    name: 'Six Meals',
    description: 'Six smaller meals spread throughout the day',
    slots: [
      { type: 'breakfast', defaultTime: '07:00' },
      { type: 'morning-snack', defaultTime: '10:00' },
      { type: 'lunch', defaultTime: '13:00' },
      { type: 'afternoon-snack', defaultTime: '16:00' },
      { type: 'dinner', defaultTime: '19:00' },
      { type: 'evening-snack', defaultTime: '21:00' }
    ]
  }
]; 