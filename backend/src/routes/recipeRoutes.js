const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authController = require('../controllers/authController');

// Public routes
router.get('/public', recipeController.getPublicRecipes);
router.get('/public/:id', recipeController.getPublicRecipe);

// Protected routes
router.use(authController.protect);

router.route('/')
  .get(recipeController.getAllRecipes)
  .post(recipeController.createRecipe);

router.route('/:id')
  .get(recipeController.getRecipe)
  .patch(recipeController.updateRecipe)
  .delete(recipeController.deleteRecipe);

router.post('/:id/reviews', recipeController.createReview);
router.patch('/:id/reviews/:reviewId', recipeController.updateReview);
router.delete('/:id/reviews/:reviewId', recipeController.deleteReview);

router.get('/search', recipeController.searchRecipes);
router.get('/category/:category', recipeController.getRecipesByCategory);
router.get('/cuisine/:cuisine', recipeController.getRecipesByCuisine);
router.get('/dietary/:diet', recipeController.getRecipesByDietaryLabel);

router.post('/:id/favorite', recipeController.addToFavorites);
router.delete('/:id/favorite', recipeController.removeFromFavorites);

module.exports = router;
