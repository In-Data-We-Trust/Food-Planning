const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const authController = require('../controllers/authController');

// All shopping list routes are protected
router.use(authController.protect);

router.route('/')
  .get(shoppingListController.getAllShoppingLists)
  .post(shoppingListController.createShoppingList);

router.route('/:id')
  .get(shoppingListController.getShoppingList)
  .patch(shoppingListController.updateShoppingList)
  .delete(shoppingListController.deleteShoppingList);

router.post('/:id/items', shoppingListController.addItemToList);
router.patch('/:id/items/:itemId', shoppingListController.updateItem);
router.delete('/:id/items/:itemId', shoppingListController.removeItemFromList);

router.patch('/:id/items/:itemId/check', shoppingListController.toggleItemChecked);
router.patch('/:id/complete', shoppingListController.markListAsCompleted);

router.get('/:id/generate-from-inventory', shoppingListController.generateFromInventory);
router.patch('/:id/consolidate', shoppingListController.consolidateItems);
router.post('/:id/sections', shoppingListController.addSection);
router.patch('/:id/sections/:sectionId', shoppingListController.updateSection);

module.exports = router;
