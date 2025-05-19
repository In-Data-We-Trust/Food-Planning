const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

// All order routes are protected
router.use(authController.protect);

router.route('/')
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

router.route('/:id')
  .get(orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

router.post('/:id/items', orderController.addItemToOrder);
router.patch('/:id/items/:itemId', orderController.updateOrderItem);
router.delete('/:id/items/:itemId', orderController.removeItemFromOrder);

router.post('/:id/submit', orderController.submitOrder);
router.post('/:id/cancel', orderController.cancelOrder);
router.get('/:id/status', orderController.checkOrderStatus);

router.post('/from-shopping-list/:listId', orderController.createOrderFromShoppingList);
router.patch('/:id/delivery-info', orderController.updateDeliveryInfo);
router.patch('/:id/payment-info', orderController.updatePaymentInfo);
router.patch('/:id/schedule', orderController.scheduleOrder);

module.exports = router;
