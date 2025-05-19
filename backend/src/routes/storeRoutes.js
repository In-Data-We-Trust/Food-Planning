const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authController = require('../controllers/authController');

// Public routes
router.get('/chains', storeController.getStoreChains);
router.get('/public', storeController.getPublicStores);
router.get('/public/:id', storeController.getPublicStore);
router.get('/nearby', storeController.getNearbyStores);

// Protected routes
router.use(authController.protect);

router.route('/')
  .get(storeController.getAllStores)
  .post(authController.restrictTo('admin'), storeController.createStore);

router.route('/:id')
  .get(storeController.getStore)
  .patch(authController.restrictTo('admin'), storeController.updateStore)
  .delete(authController.restrictTo('admin'), storeController.deleteStore);

router.get('/:id/products', storeController.getStoreProducts);
router.get('/:id/products/:productId', storeController.getStoreProduct);
router.get('/:id/categories', storeController.getStoreCategories);

router.post('/:id/favorite', storeController.addToFavorites);
router.delete('/:id/favorite', storeController.removeFromFavorites);

module.exports = router;
