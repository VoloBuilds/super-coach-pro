import { FoodItem } from '@/types/diet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FoodCardProps {
  food: FoodItem;
  onClick?: () => void;
  selected?: boolean;
}

export function FoodCard({ food, onClick, selected }: FoodCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${selected ? 'border-primary' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-lg">{food.name}</CardTitle>
        <Badge variant="secondary">{food.category}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Serving: {food.servingSize} {food.servingUnit}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium">Calories</p>
              <p className="text-muted-foreground">{food.nutritionPer100g.calories} kcal</p>
            </div>
            <div>
              <p className="font-medium">Protein</p>
              <p className="text-muted-foreground">{food.nutritionPer100g.protein}g</p>
            </div>
            <div>
              <p className="font-medium">Carbs</p>
              <p className="text-muted-foreground">{food.nutritionPer100g.carbs}g</p>
            </div>
            <div>
              <p className="font-medium">Fat</p>
              <p className="text-muted-foreground">{food.nutritionPer100g.fat}g</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 