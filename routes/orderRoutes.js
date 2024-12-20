import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  addOrderItems,
  deleteOrder,
  getOrders,
  getMyOrders,
  updateOrderToPaid,
  updateOrderToDeliver,
  getOrderById,
} from '../controllers/orderController.js';
import validateRequest from '../middleware/validator.js';
import { param, check } from 'express-validator';

const router = express.Router();

const validator = {
  getOrderById: [
    param('id').notEmpty().isMongoId().withMessage('Invalid ID format'),
  ],
  addOrderItems: [
    check('cartItems').notEmpty(),
    check('shippingAddress').notEmpty(),
    check('paymentMethod').notEmpty(),
    check('itemsPrice').isNumeric(),
  ],
};

router
  .route('/')
  .post(admin, validator.addOrderItems, validateRequest, addOrderItems)
  .get( admin, getOrders);

router.get('/my-orders',  admin,getMyOrders);
router
  .route('/:id')
  .get(protect,admin, validator.getOrderById, validateRequest, getOrderById)
  .delete(protect, admin, validator.getOrderById, validateRequest, deleteOrder);

router.put('/:id/pay', protect,admin, updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDeliver);

export default router;
