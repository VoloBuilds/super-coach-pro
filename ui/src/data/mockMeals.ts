import { Meal, MealType } from '@/types/diet';
import { mockFoods } from './mockFoods';

function getDefaultTimeForMealType(type: MealType): string {
  switch (type) {
    case 'breakfast': return '08:00';
    case 'morning-snack': return '10:30';
    case 'lunch': return '12:00';
    case 'afternoon-snack': return '15:30';
    case 'dinner': return '18:00';
    case 'evening-snack': return '20:30';
  }
}

export const mealBank: { type: MealType; meal: Meal }[] = [
  // Breakfast Options
  {
    type: 'breakfast',
    meal: {
      id: 'oatmeal-breakfast',
      name: 'Oatmeal with Fruit',
      time: getDefaultTimeForMealType('breakfast'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Greek Yogurt')!,
          quantity: 1
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Banana')!,
          quantity: 1
        }
      ]
    }
  },
  {
    type: 'breakfast',
    meal: {
      id: 'protein-breakfast',
      name: 'High Protein Breakfast',
      time: getDefaultTimeForMealType('breakfast'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Greek Yogurt')!,
          quantity: 2
        }
      ]
    }
  },
  {
    type: 'breakfast',
    meal: {
      id: 'light-protein-breakfast',
      name: 'Light Protein Breakfast',
      time: getDefaultTimeForMealType('breakfast'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Greek Yogurt')!,
          quantity: 1.5
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Banana')!,
          quantity: 0.5
        }
      ]
    }
  },
  {
    type: 'breakfast',
    meal: {
      id: 'fruit-breakfast',
      name: 'Fresh Fruit Breakfast',
      time: getDefaultTimeForMealType('breakfast'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Banana')!,
          quantity: 2
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Greek Yogurt')!,
          quantity: 0.5
        }
      ]
    }
  },
  
  // Lunch Options
  {
    type: 'lunch',
    meal: {
      id: 'chicken-rice-lunch',
      name: 'Chicken and Rice Bowl',
      time: getDefaultTimeForMealType('lunch'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Chicken Breast')!,
          quantity: 1.5
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Brown Rice (Cooked)')!,
          quantity: 1.5
        },
        {
          id: '3',
          foodItem: mockFoods.find(f => f.name === 'Broccoli')!,
          quantity: 1
        }
      ]
    }
  },
  {
    type: 'lunch',
    meal: {
      id: 'salmon-lunch',
      name: 'Salmon with Sweet Potato',
      time: getDefaultTimeForMealType('lunch'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Salmon Fillet')!,
          quantity: 1
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Sweet Potato')!,
          quantity: 1
        },
        {
          id: '3',
          foodItem: mockFoods.find(f => f.name === 'Broccoli')!,
          quantity: 1
        }
      ]
    }
  },
  {
    type: 'lunch',
    meal: {
      id: 'light-chicken-lunch',
      name: 'Light Chicken and Vegetables',
      time: getDefaultTimeForMealType('lunch'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Chicken Breast')!,
          quantity: 1
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Broccoli')!,
          quantity: 2
        },
        {
          id: '3',
          foodItem: mockFoods.find(f => f.name === 'Olive Oil')!,
          quantity: 0.5
        }
      ]
    }
  },
  {
    type: 'lunch',
    meal: {
      id: 'salmon-rice-lunch',
      name: 'Salmon Rice Bowl',
      time: getDefaultTimeForMealType('lunch'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Salmon Fillet')!,
          quantity: 1
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Brown Rice (Cooked)')!,
          quantity: 1
        },
        {
          id: '3',
          foodItem: mockFoods.find(f => f.name === 'Broccoli')!,
          quantity: 1
        },
        {
          id: '4',
          foodItem: mockFoods.find(f => f.name === 'Olive Oil')!,
          quantity: 0.5
        }
      ]
    }
  },
  
  // Dinner Options
  {
    type: 'dinner',
    meal: {
      id: 'light-dinner',
      name: 'Light Protein Dinner',
      time: getDefaultTimeForMealType('dinner'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Chicken Breast')!,
          quantity: 1
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Sweet Potato')!,
          quantity: 0.5
        },
        {
          id: '3',
          foodItem: mockFoods.find(f => f.name === 'Broccoli')!,
          quantity: 1.5
        }
      ]
    }
  },
  {
    type: 'dinner',
    meal: {
      id: 'salmon-veggie-dinner',
      name: 'Salmon and Vegetables',
      time: getDefaultTimeForMealType('dinner'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Salmon Fillet')!,
          quantity: 1
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Broccoli')!,
          quantity: 2
        },
        {
          id: '3',
          foodItem: mockFoods.find(f => f.name === 'Olive Oil')!,
          quantity: 0.5
        }
      ]
    }
  },
  {
    type: 'dinner',
    meal: {
      id: 'chicken-sweet-potato-dinner',
      name: 'Chicken with Sweet Potato',
      time: getDefaultTimeForMealType('dinner'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Chicken Breast')!,
          quantity: 1.5
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Sweet Potato')!,
          quantity: 1
        },
        {
          id: '3',
          foodItem: mockFoods.find(f => f.name === 'Olive Oil')!,
          quantity: 0.5
        }
      ]
    }
  },
  {
    type: 'dinner',
    meal: {
      id: 'protein-rice-dinner',
      name: 'Protein Rice Bowl',
      time: getDefaultTimeForMealType('dinner'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Chicken Breast')!,
          quantity: 1
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Brown Rice (Cooked)')!,
          quantity: 1
        },
        {
          id: '3',
          foodItem: mockFoods.find(f => f.name === 'Broccoli')!,
          quantity: 1
        }
      ]
    }
  },
  
  // Morning Snacks
  {
    type: 'morning-snack',
    meal: {
      id: 'fruit-yogurt-morning',
      name: 'Fruit and Yogurt',
      time: getDefaultTimeForMealType('morning-snack'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Greek Yogurt')!,
          quantity: 0.5
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Banana')!,
          quantity: 1
        }
      ]
    }
  },
  {
    type: 'morning-snack',
    meal: {
      id: 'protein-morning',
      name: 'Protein Snack',
      time: getDefaultTimeForMealType('morning-snack'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Greek Yogurt')!,
          quantity: 1
        }
      ]
    }
  },
  {
    type: 'morning-snack',
    meal: {
      id: 'fruit-morning',
      name: 'Fresh Fruit',
      time: getDefaultTimeForMealType('morning-snack'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Banana')!,
          quantity: 1
        }
      ]
    }
  },
  
  // Afternoon Snacks
  {
    type: 'afternoon-snack',
    meal: {
      id: 'sweet-potato-afternoon',
      name: 'Sweet Potato Snack',
      time: getDefaultTimeForMealType('afternoon-snack'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Sweet Potato')!,
          quantity: 0.5
        }
      ]
    }
  },
  {
    type: 'afternoon-snack',
    meal: {
      id: 'fruit-afternoon',
      name: 'Fresh Fruit',
      time: getDefaultTimeForMealType('afternoon-snack'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Banana')!,
          quantity: 1
        }
      ]
    }
  },
  {
    type: 'afternoon-snack',
    meal: {
      id: 'protein-afternoon',
      name: 'Protein Boost',
      time: getDefaultTimeForMealType('afternoon-snack'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Greek Yogurt')!,
          quantity: 0.75
        }
      ]
    }
  },
  
  // Evening Snacks
  {
    type: 'evening-snack',
    meal: {
      id: 'light-yogurt-evening',
      name: 'Light Yogurt',
      time: getDefaultTimeForMealType('evening-snack'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Greek Yogurt')!,
          quantity: 0.5
        }
      ]
    }
  },
  {
    type: 'evening-snack',
    meal: {
      id: 'veggie-evening',
      name: 'Veggie Snack',
      time: getDefaultTimeForMealType('evening-snack'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Broccoli')!,
          quantity: 0.5
        },
        {
          id: '2',
          foodItem: mockFoods.find(f => f.name === 'Olive Oil')!,
          quantity: 0.25
        }
      ]
    }
  },
  {
    type: 'evening-snack',
    meal: {
      id: 'light-sweet-potato-evening',
      name: 'Light Sweet Potato',
      time: getDefaultTimeForMealType('evening-snack'),
      items: [
        {
          id: '1',
          foodItem: mockFoods.find(f => f.name === 'Sweet Potato')!,
          quantity: 0.3
        }
      ]
    }
  }
]; 