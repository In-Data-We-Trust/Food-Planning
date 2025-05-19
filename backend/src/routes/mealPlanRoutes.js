const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const authController = require('../controllers/authController');

// All meal plan routes are protected
router.use(authController.protect);

router.route('/')
  .get(mealPlanController.getAllMealPlans)
  .post(mealPlanController.createMealPlan);

router.route('/:id')
  .get(mealPlanController.getMealPlan)
  .patch(mealPlanController.updateMealPlan)
  .delete(mealPlanController.deleteMealPlan);

router.post('/:id/days', mealPlanController.addDayToMealPlan);
router.delete('/:id/days/:dayId', mealPlanController.removeDayFromMealPlan);

router.post('/:id/days/:dayId/meals', mealPlanController.addMealToDay);
router.patch('/:id/days/:dayId/meals/:mealId', mealPlanController.updateMeal);
router.delete('/:id/days/:dayId/meals/:mealId', mealPlanController.removeMealFromDay);

router.post('/:id/days/:dayId/meals/:mealId/recipes', mealPlanController.addRecipeToMeal);
router.patch('/:id/days/:dayId/meals/:mealId/recipes/:recipeId', mealPlanController.updateRecipeInMeal);
router.delete('/:id/days/:dayId/meals/:mealId/recipes/:recipeId', mealPlanController.removeRecipeFromMeal);

router.post('/:id/generate-shopping-list', mealPlanController.generateShoppingList);
router.get('/:id/nutrition', mealPlanController.getMealPlanNutrition);

router.post('/templates', mealPlanController.createMealPlanTemplate);
router.get('/templates', mealPlanController.getMealPlanTemplates);
router.post('/templates/:id/apply', mealPlanController.applyMealPlanTemplate);

module.exports = router;
