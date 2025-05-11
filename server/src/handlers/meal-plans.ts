import { MealPlanData, MealPlanDB } from '../db';
import { RouteHandler, HandlerContext, DeleteRequestBody } from '../types';

export const mealPlanHandlers: RouteHandler<MealPlanData> = {
  async get(context: HandlerContext): Promise<MealPlanData[]> {
    const { db, user } = context;

    if (!user) {
      throw new Error('Authentication required');
    }

    return (db as MealPlanDB).getMealPlans(user.id);
  },

  async post(context: HandlerContext<MealPlanData>): Promise<MealPlanData> {
    const { db, user, body: mealPlan } = context;

    if (!user) {
      throw new Error('Authentication required');
    }

    if (!mealPlan) {
      throw new Error('Meal plan data is required');
    }

    return (db as MealPlanDB).createMealPlan({
      ...mealPlan,
      user_id: user.id
    });
  },

  async put(context: HandlerContext<MealPlanData>): Promise<MealPlanData> {
    const { db, user, body: mealPlan, params } = context;

    if (!user) {
      throw new Error('Authentication required');
    }

    const mealPlanId = params.id;
    if (!mealPlanId) {
      throw new Error('Meal Plan ID is required for updates');
    }

    if (!mealPlan) {
      throw new Error('Meal plan data is required');
    }

    return (db as MealPlanDB).updateMealPlan(mealPlanId, mealPlan, user.id);
  },

  async delete(context: HandlerContext<DeleteRequestBody>): Promise<null> {
    const { db, user, body } = context;

    if (!user) {
      throw new Error('Authentication required');
    }

    if (!body?.id) {
      throw new Error('Meal plan ID is required for deletion');
    }

    await (db as MealPlanDB).deleteMealPlan(body.id, user.id);
    return null;
  }
}; 