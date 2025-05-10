import { useState } from 'react';
import { FoodItem, Meal, MealItem, MealType } from '@/types/diet';
import { mockFoods } from '@/data/mockFoods';
import { FoodCard } from './FoodCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface MealBuilderProps {
  initialMeal?: Meal;
  onSave: (meal: Meal) => void;
}

export function MealBuilder({ initialMeal, onSave }: MealBuilderProps) {
  const [mealName, setMealName] = useState(initialMeal?.name || '');
  const [mealTime, setMealTime] = useState(initialMeal?.time || '');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [mealItems, setMealItems] = useState<MealItem[]>(initialMeal?.items || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantity, setQuantity] = useState(1);

  const filteredFoods = mockFoods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddFood = () => {
    if (selectedFood) {
      const newMealItem: MealItem = {
        id: crypto.randomUUID(),
        foodItem: selectedFood,
        quantity: quantity
      };
      setMealItems([...mealItems, newMealItem]);
      setSelectedFood(null);
      setQuantity(1);
    }
  };

  const handleRemoveFood = (itemId: string) => {
    setMealItems(mealItems.filter(item => item.id !== itemId));
  };

  const calculateTotalNutrition = () => {
    return mealItems.reduce((total, item) => {
      const multiplier = item.quantity * (item.foodItem.servingSize / 100);
      return {
        calories: total.calories + item.foodItem.nutritionPer100g.calories * multiplier,
        protein: total.protein + item.foodItem.nutritionPer100g.protein * multiplier,
        carbs: total.carbs + item.foodItem.nutritionPer100g.carbs * multiplier,
        fat: total.fat + item.foodItem.nutritionPer100g.fat * multiplier
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSaveMeal = () => {
    const meal: Meal = {
      id: initialMeal?.id || crypto.randomUUID(),
      name: mealName,
      time: mealTime,
      items: mealItems
    };
    onSave(meal);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal-name">Meal Name</Label>
            <Input
              id="meal-name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Enter meal name..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meal-time">Time</Label>
            <Input
              id="meal-time"
              type="time"
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Foods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="protein">Protein</SelectItem>
                <SelectItem value="carbs">Carbs</SelectItem>
                <SelectItem value="fats">Fats</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="fruits">Fruits</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onClick={() => setSelectedFood(food)}
                selected={selectedFood?.id === food.id}
              />
            ))}
          </div>

          {selectedFood && (
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="quantity">Servings</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <Button onClick={handleAddFood}>Add to Meal</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {mealItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Meal Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mealItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.foodItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {item.foodItem.servingSize}{item.foodItem.servingUnit}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFood(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="pt-4 border-t">
                <p className="font-medium mb-2">Total Nutrition</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(calculateTotalNutrition()).map(([key, value]) => (
                    <div key={key}>
                      <p className="font-medium capitalize">{key}</p>
                      <p className="text-muted-foreground">
                        {Math.round(value)}{key === 'calories' ? ' kcal' : 'g'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSaveMeal}
          disabled={!mealName || !mealTime || mealItems.length === 0}
        >
          Save Meal
        </Button>
      </div>
    </div>
  );
} 