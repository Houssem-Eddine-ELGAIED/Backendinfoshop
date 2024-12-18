import express from 'express';
import { body, param } from 'express-validator';
import {
  addOrderItems,
  deleteOrder,
  getOrders,
  getMyOrders,
  updateOrderToPaid,
  updateOrderToDeliver,
  getOrderById
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validator.js';

const router = express.Router();

// Validation for adding order items
const validator = {
  addOrderItems: [
    body('cartItems').notEmpty().withMessage('Cart items are required'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('itemsPrice').isNumeric().withMessage('Items price must be a number'),
  ],
  getOrderById: [
    param('id').notEmpty().isMongoId().withMessage('Invalid order ID format')
  ]
};

// Routes for orders
router.route('/')
  .post( validator.addOrderItems, validateRequest, addOrderItems)  // Use the 'protect' middleware to authenticate the user
  .get( admin, getOrders);  // Only admins can get all orders

router.get('/my-orders', getMyOrders);  // Get orders for the logged-in user

router.route('/:id')
  .get( validator.getOrderById, validateRequest, getOrderById)  // Fetch order by ID
  .delete( admin, deleteOrder);  // Delete order (admin only)

router.put('/:id/pay',  updateOrderToPaid);  // Update order to paid
router.put('/:id/deliver', admin, updateOrderToDeliver);  // Mark order as delivered (admin only)

export default router;
