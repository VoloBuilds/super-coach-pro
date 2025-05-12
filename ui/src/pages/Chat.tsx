import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { serverComm } from "@/lib/serverComm";
import { Workout } from "@/types/workout";
import { MealPlan } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
  data?: Workout | MealPlan;
}

const transformServerWorkout = (data: any): Workout => ({
  id: crypto.randomUUID(),
  name: data.name,
  description: data.description || '',
  estimatedDuration: data.estimatedDuration,
  exercises: data.exercises.map((ex: any) => ({
    id: crypto.randomUUID(),
    exerciseId: ex.name.toLowerCase().replace(/\s+/g, '-'),
    name: ex.name,
    sets: ex.sets.map((set: any) => ({
      ...set,
      id: crypto.randomUUID()
    })),
    notes: ex.notes || '',
    restBetweenSets: ex.restBetweenSets
  }))
});

const transformServerMealPlan = (data: any): MealPlan => {
  const mealsByType = data.meals.reduce((acc: any, meal: any) => {
    acc[meal.type] = {
      name: meal.name,
      time: meal.time,
      foods: meal.foods
    };
    return acc;
  }, {});

  return {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description || '',
    meals: {
      breakfast: mealsByType.breakfast || null,
      'morning-snack': mealsByType['morning-snack'] || null,
      lunch: mealsByType.lunch || null,
      'afternoon-snack': mealsByType['afternoon-snack'] || null,
      dinner: mealsByType.dinner || null,
      'evening-snack': mealsByType['evening-snack'] || null
    },
    totalNutrition: data.totalNutrition,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

const WorkoutDisplay = ({ workout }: { workout: Workout }) => (
  <Card className="mt-2">
    <CardContent className="pt-4">
      <h3 className="font-semibold">{workout.name}</h3>
      <p className="text-sm text-muted-foreground">{workout.description}</p>
      <div className="mt-2">
        <p className="text-sm">Duration: {workout.estimatedDuration} minutes</p>
        <div className="mt-2">
          {workout.exercises.map((exercise) => (
            <div key={exercise.id} className="mb-2">
              <p className="font-medium">{exercise.exerciseId}</p>
              <ul className="text-sm pl-4">
                {exercise.sets.map((set, j) => (
                  <li key={set.id}>
                    Set {j + 1}: {set.reps && `${set.reps} reps`} 
                    {set.weight && ` @ ${set.weight}${set.weightType}`}
                    {set.duration && ` for ${set.duration}s`}
                    {set.distance && ` ${set.distance}m`}
                  </li>
                ))}
              </ul>
              {exercise.notes && <p className="text-sm text-muted-foreground mt-1">{exercise.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input } as Message;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await serverComm.sendChatMessage(input);
      let transformedData;
      if (response.data) {
        if ('exercises' in response.data) {
          transformedData = transformServerWorkout(response.data);
        } else if ('meals' in response.data) {
          transformedData = transformServerMealPlan(response.data);
        }
      }

      const assistantMessage: Message = { 
        role: "assistant", 
        content: response.message,
        data: transformedData
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkout = async (workout: Workout) => {
    try {
      await serverComm.saveWorkout(workout);
      toast({
        title: "Success",
        description: "Workout plan saved successfully!",
      });
    } catch (error) {
      console.error("Error saving workout:", error);
      toast({
        title: "Error",
        description: "Failed to save workout plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveMealPlan = async (mealPlan: MealPlan) => {
    try {
      await serverComm.saveMealPlan(mealPlan);
      toast({
        title: "Success",
        description: "Meal plan saved successfully!",
      });
    } catch (error) {
      console.error("Error saving meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to save meal plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isWorkoutData = (data: any): data is Workout => {
    return data && 'exercises' in data && 'estimatedDuration' in data;
  };

  const isMealPlanData = (data: any): data is MealPlan => {
    return data && 'meals' in data && 'totalNutrition' in data;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 space-y-4">
      <h1 className="text-3xl font-bold">AI Fitness Coach</h1>
      
      <ScrollArea className="flex-1 p-4 border rounded-lg">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div>{message.content}</div>
                {message.data && (
                  <div className="mt-2 pt-2 border-t">
                    {isWorkoutData(message.data) && (
                      <>
                        <WorkoutDisplay workout={message.data} />
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleSaveWorkout(message.data as Workout)}
                          className="mt-2"
                        >
                          Save Workout Plan
                        </Button>
                      </>
                    )}
                    {isMealPlanData(message.data) && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleSaveMealPlan(message.data as MealPlan)}
                        className="mt-2"
                      >
                        Save Meal Plan
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about workout or meal plans..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </form>
    </div>
  );
} 