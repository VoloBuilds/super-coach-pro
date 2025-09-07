import OpenAI from 'openai';
import { RouteHandler, HandlerContext } from '../types';
import { WorkoutData, MealPlanData } from '../db';

const systemPrompt = `You are an AI fitness coach that helps users create personalized workout and meal plans. 

CRITICAL SAFETY DISCLAIMERS AND WARNINGS:
⚠️  MEDICAL DISCLAIMER: You are not a medical professional. All advice is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment.
⚠️  CONSULT PROFESSIONALS: Users should always consult with a healthcare provider before starting any new exercise program or diet plan, especially if they have pre-existing medical conditions, injuries, or health concerns.
⚠️  INDIVIDUAL RESPONSIBILITY: Users are responsible for their own safety and should listen to their bodies. Stop any exercise if they experience pain, dizziness, or discomfort.
⚠️  NO GUARANTEES: Results may vary between individuals. This advice does not guarantee specific outcomes.

MANDATORY SAFETY RULES - YOU MUST FOLLOW THESE:
1. NEVER recommend daily calorie intake below 1200 calories for women or 1500 calories for men
2. NEVER suggest extreme diets, fasting longer than 24 hours, or dangerous weight loss methods
3. NEVER recommend exercises for users with disclosed injuries without professional clearance
4. NEVER provide medical diagnosis, treatment, or advice for medical conditions
5. ALWAYS include safety warnings for high-intensity or advanced exercises
6. NEVER recommend supplements, medications, or substances
7. ALWAYS suggest proper warm-up and cool-down routines
8. NEVER ignore user-mentioned health limitations or contraindications

Your responses should be focused on health, fitness, and nutrition advice within safe parameters. 
When discussing workout plans, consider the user's goals, fitness level, and any limitations they mention.
For meal plans, focus on balanced nutrition and consider any dietary restrictions or preferences mentioned.
Always emphasize the importance of proper form, gradual progression, and listening to one's body.

When suggesting workouts or meal plans, you MUST format them according to these TypeScript interfaces:

interface WorkoutData {
    name: string;
    description: string;
    estimatedDuration: number;
    exercises: Array<{
        name: string;
        sets: Array<{
            weight?: number;
            reps?: number;
            duration?: number;
            distance?: number;
            completed: boolean;
            weightType: 'kg' | 'lbs' | 'bodyweight'
        }>;
        notes: string;
        restBetweenSets: number;
    }>;
}

interface MealPlanData {
    name: string;
    description?: string;
    meals: Array<{
        type: string;
        name: string;
        time: string;
        foods: Array<{
            name: string;
            portion: number;
            unit: string;
            nutrition: {
                calories: number;
                protein: number;
                carbs: number;
                fat: number;
            }
        }>
    }>;
    totalNutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

When suggesting a workout or meal plan, format your response as a JSON object with two fields:
1. "message": Your natural language response and explanation
2. "data": The properly formatted WorkoutData or MealPlanData object

Example format:
{
    "message": "Here's a workout plan I recommend...",
    "data": {
        // WorkoutData or MealPlanData object here
    }
}`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  blockedReasons: string[];
}

// Content filtering and validation functions
function validateMealPlan(mealPlan: MealPlanData): ValidationResult {
  const warnings: string[] = [];
  const blockedReasons: string[] = [];
  
  // Check if nutrition data exists
  if (!mealPlan.totalNutrition) {
    blockedReasons.push('Meal plan is missing nutritional information required for safety validation.');
    return { isValid: false, warnings, blockedReasons };
  }
  
  // Check minimum daily calories
  const totalCalories = mealPlan.totalNutrition.calories;
  if (totalCalories < 1200) {
    blockedReasons.push(`Daily calorie intake (${totalCalories}) is below the safe minimum of 1200 calories. This could be dangerous and is not recommended.`);
  } else if (totalCalories < 1500) {
    warnings.push(`Daily calorie intake (${totalCalories}) is quite low. Please ensure this aligns with your healthcare provider's recommendations.`);
  }
  
  // Check for extreme macronutrient ratios
  const proteinPercent = (mealPlan.totalNutrition.protein * 4) / totalCalories * 100;
  const carbPercent = (mealPlan.totalNutrition.carbs * 4) / totalCalories * 100;
  const fatPercent = (mealPlan.totalNutrition.fat * 9) / totalCalories * 100;
  
  if (proteinPercent > 40) {
    warnings.push(`Protein intake (${proteinPercent.toFixed(1)}%) is very high. Consider consulting a healthcare provider for high-protein diets.`);
  }
  if (carbPercent < 10) {
    warnings.push(`Carbohydrate intake (${carbPercent.toFixed(1)}%) is very low. Ensure adequate energy for daily activities.`);
  }
  if (fatPercent < 15) {
    warnings.push(`Fat intake (${fatPercent.toFixed(1)}%) is quite low. Essential fatty acids are important for health.`);
  }
  
  return {
    isValid: blockedReasons.length === 0,
    warnings,
    blockedReasons
  };
}

function validateWorkout(workout: WorkoutData): ValidationResult {
  const warnings: string[] = [];
  const blockedReasons: string[] = [];
  
  // Check for extremely long duration
  if (workout.estimatedDuration > 180) { // 3 hours
    warnings.push(`Workout duration (${workout.estimatedDuration} minutes) is very long. Consider breaking into multiple sessions.`);
  }
  
  // Check for high-intensity or advanced exercises that need warnings
  const highIntensityExercises = ['deadlift', 'squat', 'bench press', 'overhead press', 'clean and jerk', 'snatch'];
  const advancedExercises = workout.exercises.filter(ex => 
    highIntensityExercises.some(intense => ex.name.toLowerCase().includes(intense.toLowerCase()))
  );
  
  if (advancedExercises.length > 0) {
    warnings.push(`This workout includes advanced exercises (${advancedExercises.map(ex => ex.name).join(', ')}). Ensure proper form and consider working with a trainer.`);
  }
  
  // Check for excessive volume
  const totalSets = workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
  if (totalSets > 25) {
    warnings.push(`High volume workout (${totalSets} total sets). Ensure adequate recovery time between sessions.`);
  }
  
  return {
    isValid: blockedReasons.length === 0,
    warnings,
    blockedReasons
  };
}

function validateUserMessage(message: string): ValidationResult {
  const warnings: string[] = [];
  const blockedReasons: string[] = [];
  
  // Check for medical advice requests
  const medicalTerms = [
    'diagnose', 'diagnosis', 'medical condition', 'medicine', 'medication', 'pill', 'drug',
    'injury treatment', 'pain relief', 'cure', 'disease', 'illness', 'symptoms',
    'blood pressure', 'heart condition', 'diabetes treatment', 'prescription'
  ];
  
  const messageWords = message.toLowerCase();
  const foundMedicalTerms = medicalTerms.filter(term => messageWords.includes(term));
  
  if (foundMedicalTerms.length > 0) {
    warnings.push(`Your message mentions medical topics (${foundMedicalTerms.join(', ')}). Remember that I cannot provide medical advice - please consult a healthcare professional.`);
  }
  
  // Check for dangerous diet requests
  const dangerousDietTerms = [
    'extreme diet', 'crash diet', 'starvation', 'fast for days', 'no food',
    'diet pills', 'weight loss pills', 'laxatives', 'very low calorie'
  ];
  
  const foundDangerousTerms = dangerousDietTerms.filter(term => messageWords.includes(term));
  
  if (foundDangerousTerms.length > 0) {
    blockedReasons.push(`I cannot provide advice on potentially dangerous diet practices (${foundDangerousTerms.join(', ')}). Please consult a healthcare professional for safe weight management.`);
  }
  
  return {
    isValid: blockedReasons.length === 0,
    warnings,
    blockedReasons
  };
}

export const chatHandler: RouteHandler<any> = {
  async post(context: HandlerContext<{ message: string; history?: ChatMessage[] }>) {
    try {
      const { body, env } = context;

      if (!env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Validate user message for safety
      const messageValidation = validateUserMessage(body.message);
      if (!messageValidation.isValid) {
        return {
          message: `I cannot provide that information. ${messageValidation.blockedReasons.join(' ')} Please consult with qualified healthcare professionals for safe and personalized advice.`,
          warnings: messageValidation.warnings,
          blocked: true,
          history: body.history || []
        };
      }

      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY
      });

      // Initialize conversation with system prompt
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...(body.history || []),
        { role: "user", content: body.message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0].message;

      // Try to parse the response as JSON if it contains workout or meal plan data
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response.content || '');
      } catch (e) {
        // If not JSON, just return the message as is
        parsedResponse = { message: response.content };
      }

      // Validate AI response data if present
      const allWarnings = [...messageValidation.warnings];
      let responseBlocked = false;

      if (parsedResponse.data) {
        if (parsedResponse.data.totalNutrition) {
          // It's a meal plan
          const mealPlanValidation = validateMealPlan(parsedResponse.data as MealPlanData);
          allWarnings.push(...mealPlanValidation.warnings);
          
          if (!mealPlanValidation.isValid) {
            responseBlocked = true;
            return {
              message: `I cannot provide this meal plan recommendation. ${mealPlanValidation.blockedReasons.join(' ')} Please consult with a registered dietitian for safe meal planning.`,
              warnings: allWarnings,
              blocked: true,
              history: [...messages, { role: "assistant", content: response.content || '' }]
            };
          }
        } else if (parsedResponse.data.exercises) {
          // It's a workout
          const workoutValidation = validateWorkout(parsedResponse.data as WorkoutData);
          allWarnings.push(...workoutValidation.warnings);
          
          if (!workoutValidation.isValid) {
            responseBlocked = true;
            return {
              message: `I cannot provide this workout recommendation. ${workoutValidation.blockedReasons.join(' ')} Please consult with a certified personal trainer for safe exercise programming.`,
              warnings: allWarnings,
              blocked: true,
              history: [...messages, { role: "assistant", content: response.content || '' }]
            };
          }
        }
      }

      // Add safety disclaimer to message if there are warnings
      let finalMessage = parsedResponse.message;
      if (allWarnings.length > 0) {
        finalMessage += '\n\n⚠️ SAFETY NOTES:\n' + allWarnings.map(w => `• ${w}`).join('\n');
        finalMessage += '\n\nRemember: Always consult healthcare professionals before making significant changes to your diet or exercise routine.';
      }

      return {
        message: finalMessage,
        data: parsedResponse.data,
        warnings: allWarnings,
        blocked: false,
        history: [...messages, { role: "assistant", content: response.content || '' }]
      };
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }
}; 